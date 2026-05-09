'use strict';

/**
 * MARCO MALIK & SYED-MD MINI BOT — sessionManager.js
 * Manages unlimited independent WhatsApp sessions (one per user).
 * Supports both QR code and Pairing Code connection methods.
 */

const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    makeInMemoryStore,
    fetchLatestBaileysVersion,
    Browsers
} = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const settings = require('./settings');
const config = require('./config');
const { handleMessages, handleGroupParticipantUpdate } = require('./main');

// Active sessions map: sessionId → { sock, store, status, connectedAt }
const activeSessions = new Map();

// Socket.IO instance — set by server.js
let io = null;

function setIO(ioInstance) {
    io = ioInstance;
}

function getSessionDir(sessionId) {
    return path.join(config.SESSION_DIR, sessionId);
}

function emitToSession(sessionId, event, data) {
    if (io) io.to(sessionId).emit(event, data);
}

async function createSession(sessionId, usePairingCode = false, phoneNumber = null) {
    if (activeSessions.has(sessionId)) {
        console.log(`[SessionManager] Session ${sessionId} already exists.`);
        return;
    }

    const sessionDir = getSessionDir(sessionId);
    await fse.ensureDir(sessionDir);

    const logger = pino({ level: 'silent' });

    let store;
    try {
        store = makeInMemoryStore({ logger });
        if (fs.existsSync(path.join(sessionDir, 'store.json'))) {
            store.readFromFile(path.join(sessionDir, 'store.json'));
        }
        setInterval(() => {
            try { store.writeToFile(path.join(sessionDir, 'store.json')); } catch (e) {}
        }, 10000);
    } catch (e) {
        store = null;
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    let { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.macOS('Desktop'),
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 30000,
        keepAliveIntervalMs: 20000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return { conversation: 'Placeholder' };
        },
    });

    if (store) store.bind(sock.ev);

    activeSessions.set(sessionId, {
        sock,
        store,
        status: 'connecting',
        connectedAt: null,
        phoneNumber: phoneNumber || null,
    });

    // --- Pairing Code flow ---
    if (usePairingCode && phoneNumber && !sock.authState.creds.registered) {
        try {
            // Wait for connection before requesting pairing code
            await new Promise(resolve => setTimeout(resolve, 3000));
            const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
            const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
            emitToSession(sessionId, 'pairing_code', { code: formatted });
            console.log(`[SessionManager] Pairing code for ${sessionId}: ${formatted}`);
        } catch (err) {
            console.error(`[SessionManager] Pairing code error: ${err.message}`);
            emitToSession(sessionId, 'error', { message: 'Failed to generate pairing code. Check phone number and try again.' });
        }
    }

    // --- Connection update handler ---
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr, isNewLogin } = update;

        if (qr && !usePairingCode) {
            try {
                const qrDataURL = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
                emitToSession(sessionId, 'qr', { qr: qrDataURL });
            } catch (e) {
                emitToSession(sessionId, 'qr', { qr });
            }
        }

        if (connection === 'open') {
            const session = activeSessions.get(sessionId);
            if (session) {
                session.status = 'connected';
                session.connectedAt = new Date();
            }

            // Save creds
            await saveCreds();

            console.log(`[SessionManager] ✅ Session ${sessionId} connected!`);

            // Notify client — success, then auto-reset
            emitToSession(sessionId, 'connected', {
                message: 'Connected Successfully! Your bot is now active.',
                sessionId
            });

            // After 5 seconds, tell the client to reset the UI
            setTimeout(() => {
                emitToSession(sessionId, 'reset_ui', {});
            }, 5000);
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            const session = activeSessions.get(sessionId);

            console.log(`[SessionManager] ⚠️ Session ${sessionId} closed. Reason: ${reason}`);

            if (
                reason === DisconnectReason.badSession ||
                reason === DisconnectReason.loggedOut ||
                reason === 401
            ) {
                console.log(`[SessionManager] 🔴 Session ${sessionId} logged out — removing.`);
                emitToSession(sessionId, 'logged_out', { message: 'Session logged out. Please reconnect.' });
                await destroySession(sessionId);
            } else if (
                reason === DisconnectReason.connectionLost ||
                reason === DisconnectReason.timedOut ||
                reason === DisconnectReason.connectionClosed ||
                reason === DisconnectReason.restartRequired ||
                !reason
            ) {
                console.log(`[SessionManager] 🔄 Session ${sessionId} reconnecting...`);
                activeSessions.delete(sessionId);
                // Reconnect after delay
                setTimeout(() => {
                    createSession(sessionId, false, null).catch(console.error);
                }, 5000);
            } else {
                await destroySession(sessionId);
            }
        }
    });

    // --- Credentials update ---
    sock.ev.on('creds.update', saveCreds);

    // --- Message handler ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            if (chatUpdate.type !== 'notify') return;
            await handleMessages(sock, chatUpdate, false, sessionId);
        } catch (err) {
            console.error(`[Session ${sessionId}] Message error:`, err.message);
        }
    });

    // --- Group participant update ---
    sock.ev.on('group-participants.update', async (update) => {
        try {
            await handleGroupParticipantUpdate(sock, update, sessionId);
        } catch (err) {
            console.error(`[Session ${sessionId}] Group update error:`, err.message);
        }
    });

    // --- Call handler (anticall) ---
    sock.ev.on('call', async (calls) => {
        try {
            const anticallData = getSessionData(sessionId, 'anticall', { enabled: false });
            if (!anticallData.enabled) return;
            for (const call of calls) {
                if (call.status === 'offer') {
                    await sock.rejectCall(call.id, call.from);
                    await sock.sendMessage(call.from, {
                        text: '📵 *Auto-Rejected Call*\nCalls are blocked on this bot.'
                    });
                }
            }
        } catch (err) {}
    });

    return sock;
}

function getSessionData(sessionId, key, defaultVal = {}) {
    try {
        const filePath = path.join(getSessionDir(sessionId), `${key}.json`);
        if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath));
    } catch (e) {}
    return defaultVal;
}

async function destroySession(sessionId) {
    const session = activeSessions.get(sessionId);
    if (session?.sock) {
        try { session.sock.end(); } catch (e) {}
    }
    activeSessions.delete(sessionId);
    // DO NOT delete session folder — user's creds are there for reconnect
    console.log(`[SessionManager] Session ${sessionId} destroyed from memory.`);
}

function getActiveSessions() {
    return activeSessions.size;
}

// Restore all existing sessions on startup
async function restoreAllSessions() {
    const sessionsDir = config.SESSION_DIR;
    if (!fs.existsSync(sessionsDir)) return;

    const dirs = fs.readdirSync(sessionsDir).filter(d => {
        const full = path.join(sessionsDir, d);
        return fs.statSync(full).isDirectory();
    });

    console.log(`[SessionManager] Restoring ${dirs.length} sessions...`);

    for (const sessionId of dirs) {
        try {
            const credsFile = path.join(sessionsDir, sessionId, 'creds.json');
            if (fs.existsSync(credsFile)) {
                console.log(`[SessionManager] Restoring session: ${sessionId}`);
                await createSession(sessionId, false, null);
                // Small delay between session starts to avoid rate limiting
                await new Promise(r => setTimeout(r, 2000));
            }
        } catch (err) {
            console.error(`[SessionManager] Failed to restore session ${sessionId}:`, err.message);
        }
    }
}

module.exports = {
    createSession,
    destroySession,
    getActiveSessions,
    restoreAllSessions,
    setIO,
    activeSessions,
};
