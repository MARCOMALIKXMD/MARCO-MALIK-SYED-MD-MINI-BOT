const fs = require('fs');
const REACT_FILE = './data/autoReact.json';

async function addCommandReaction(sock, message) {
    try {
        let data = { enabled: false };
        try { data = JSON.parse(fs.readFileSync(REACT_FILE)); } catch (e) {}
        if (!data.enabled) return;
        const emojis = ['✅', '⚡', '🔥', '💫', '✨', '🌟', '💥'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        await sock.sendMessage(message.key.remoteJid, {
            react: { text: emoji, key: message.key }
        });
    } catch (e) {}
}

module.exports = { addCommandReaction };
