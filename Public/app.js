'use strict';

// Connect to Socket.IO
const socket = io({ transports: ['websocket', 'polling'] });

let sessionId = null;
let connected = false;
let currentTab = 'qr';

// --- Socket events ---

socket.on('connect', () => {
    console.log('[App] Connected to server, socket:', socket.id);
});

socket.on('session_id', ({ sessionId: sid }) => {
    sessionId = sid;
    console.log('[App] Session ID assigned:', sessionId);
});

socket.on('status', ({ message }) => {
    setStatus(message);
});

socket.on('qr', ({ qr }) => {
    showQR(qr);
});

socket.on('pairing_code', ({ code }) => {
    showPairingCode(code);
});

socket.on('connected', ({ message }) => {
    connected = true;
    showSuccess();
    showToast(message || 'Connected Successfully!', 'success');
});

socket.on('reset_ui', () => {
    setTimeout(() => {
        if (connected) return; // Don't reset if we just showed success
    }, 100);
});

socket.on('logged_out', ({ message }) => {
    showToast(message || 'Session logged out.', 'error');
    resetUI();
});

socket.on('error', ({ message }) => {
    showToast(message, 'error');
    resetUI();
});

// --- Tab switching ---

function switchTab(tab) {
    currentTab = tab;

    document.getElementById('tabQR').classList.toggle('active', tab === 'qr');
    document.getElementById('tabPair').classList.toggle('active', tab === 'pair');
    document.getElementById('panelQR').classList.toggle('hidden', tab !== 'qr');
    document.getElementById('panelPair').classList.toggle('hidden', tab !== 'pair');
}

// --- Start QR ---

function startQR() {
    const btn = document.getElementById('btnQR');
    btn.disabled = true;

    // Show loader
    document.getElementById('qrPlaceholder').classList.add('hidden');
    document.getElementById('qrImage').classList.add('hidden');
    document.getElementById('qrLoader').classList.remove('hidden');
    setStatus('Generating QR Code...');

    socket.emit('start_qr', {});

    // Re-enable after 60s if no result
    setTimeout(() => { btn.disabled = false; }, 60000);
}

// --- Show QR image ---

function showQR(qrDataURL) {
    const img = document.getElementById('qrImage');
    const loader = document.getElementById('qrLoader');
    const placeholder = document.getElementById('qrPlaceholder');

    placeholder.classList.add('hidden');
    loader.classList.add('hidden');
    img.src = qrDataURL;
    img.classList.remove('hidden');
}

// --- Start Pairing ---

function startPairing() {
    const input = document.getElementById('phoneInput');
    const phone = input.value.replace(/\D/g, '');

    if (!phone || phone.length < 7) {
        showToast('Please enter a valid phone number with country code.', 'error');
        input.focus();
        return;
    }

    const btn = document.getElementById('btnPair');
    btn.disabled = true;

    document.getElementById('pairPlaceholder').classList.add('hidden');
    document.getElementById('pairCodeDisplay').classList.add('hidden');

    // Show spinner
    const spinner = createSpinner();
    document.getElementById('pairZone').appendChild(spinner);

    socket.emit('start_pairing', { phone });

    setTimeout(() => { btn.disabled = false; }, 60000);
}

function createSpinner() {
    const div = document.createElement('div');
    div.id = 'pairSpinner';
    div.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;color:var(--text2)"><div class="spinner"></div><p>Requesting pairing code...</p></div>`;
    return div;
}

// --- Show Pairing Code ---

function showPairingCode(code) {
    const spinner = document.getElementById('pairSpinner');
    if (spinner) spinner.remove();

    document.getElementById('pairPlaceholder').classList.add('hidden');
    document.getElementById('pairCode').textContent = code;
    document.getElementById('pairCodeDisplay').classList.remove('hidden');

    showToast('Pairing code ready! Enter it in WhatsApp.', 'success');
}

// --- Show Success ---

function showSuccess() {
    document.getElementById('mainCard').classList.add('hidden');
    document.getElementById('successCard').classList.remove('hidden');
}

// --- Reset UI ---

function resetUI() {
    connected = false;

    // Reset QR panel
    document.getElementById('qrPlaceholder').classList.remove('hidden');
    document.getElementById('qrImage').classList.add('hidden');
    document.getElementById('qrImage').src = '';
    document.getElementById('qrLoader').classList.add('hidden');
    document.getElementById('btnQR').disabled = false;

    // Reset pair panel
    document.getElementById('pairPlaceholder').classList.remove('hidden');
    document.getElementById('pairCodeDisplay').classList.add('hidden');
    document.getElementById('pairCode').textContent = '----';
    document.getElementById('phoneInput').value = '';
    document.getElementById('btnPair').disabled = false;
    const spinner = document.getElementById('pairSpinner');
    if (spinner) spinner.remove();

    // Show main card, hide success
    document.getElementById('mainCard').classList.remove('hidden');
    document.getElementById('successCard').classList.add('hidden');

    // Reload page to get fresh session
    setTimeout(() => { window.location.reload(); }, 300);
}

// --- Toast ---

function showToast(msg, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast';
    if (type) toast.classList.add(type);
    toast.classList.remove('hidden');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000);
}

// --- Status text ---

function setStatus(msg) {
    const el = document.getElementById('statusText');
    if (el) el.textContent = msg;
}
