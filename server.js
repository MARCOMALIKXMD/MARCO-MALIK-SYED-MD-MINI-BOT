'use strict';

/**
 * MARCO MĀLÏK MINI BOT — server.js
 * Public multi-user WhatsApp bot web server.
 * Handles QR code and Pairing Code connection flows.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const { createSession, restoreAllSessions, setIO, getActiveSessions } = require('./sessionManager');
const config = require('./config');
const settings = require('./settings');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling']
});

// Set IO instance in session manager
setIO(io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure directories exist
fse.ensureDirSync(config.SESSION_DIR);
fse.ensureDirSync(config.DATA_DIR);
fse.ensureDirSync(config.TEMP_DIR || './temp');

// --- Routes ---

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        bot: settings.botName,
        version: settings.version,
        timestamp: new Date().toISOString()
    });
});

// Main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Socket.IO Events ---
io.on('connection', (socket) => {
    console.log(`[Server] Client connected: ${socket.id}`);

    // Generate a new session ID for this client
    const sessionId = uuidv4();
    socket.join(sessionId);
    socket.emit('session_id', { sessionId });

    // Start QR connection
    socket.on('start_qr', async (data) => {
        try {
            console.log(`[Server] QR request for session: ${sessionId}`);
            socket.emit('status', { message: '🔄 Generating QR Code...' });
            await createSession(sessionId, false, null);
        } catch (err) {
            socket.emit('error', { message: `Failed to start session: ${err.message}` });
        }
    });

    // Start Pairing Code connection
    socket.on('start_pairing', async (data) => {
        try {
            const { phone } = data;
            if (!phone || phone.replace(/[^0-9]/g, '').length < 7) {
                socket.emit('error', { message: '❌ Please enter a valid phone number with country code.' });
                return;
            }
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            console.log(`[Server] Pairing code request for session: ${sessionId}, phone: ${cleanPhone}`);
            socket.emit('status', { message: '🔄 Requesting pairing code...' });
            await createSession(sessionId, true, cleanPhone);
            socket.emit('status', { message: '📱 Check your WhatsApp → Linked Devices for the code!' });
        } catch (err) {
            socket.emit('error', { message: `Failed to start pairing: ${err.message}` });
        }
    });

    // Client manually resets
    socket.on('reset', () => {
        socket.emit('reset_ui', {});
    });

    socket.on('disconnect', () => {
        console.log(`[Server] Client disconnected: ${socket.id}`);
    });
});

// --- Start server ---
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', async () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log(`║   𓆩 MARCO MALIK & SYED-MD MINI BOT v${settings.version} 𓆪   ║`);
    console.log('║   Public Multi-User WhatsApp Bot System  ║');
    console.log(`║   Running on: http://localhost:${PORT}       ║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    // Restore previously connected sessions
    await restoreAllSessions();
    console.log('[Server] ✅ Ready for connections!');
});

module.exports = { app, server, io };
