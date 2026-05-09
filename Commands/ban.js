const fs = require('fs');
const FILE = './data/banned.json';
function load() { try { return JSON.parse(fs.readFileSync(FILE)); } catch(e){ return []; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

async function banCommand(sock, chatId, message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
    let target = mentioned[0] || quoted;
    if (!target) return sock.sendMessage(chatId, { text: '❌ Mention or reply to a user to ban.' }, { quoted: message });
    const jid = target.split('@')[0] + '@s.whatsapp.net';
    const d = load(); if (!d.includes(jid)) { d.push(jid); save(d); }
    await sock.sendMessage(chatId, { text: `✅ @${jid.split('@')[0]} has been banned.`, mentions: [jid] }, { quoted: message });
}

async function unbanCommand(sock, chatId, message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
    let target = mentioned[0] || quoted;
    if (!target) return sock.sendMessage(chatId, { text: '❌ Mention or reply to a user to unban.' }, { quoted: message });
    const jid = target.split('@')[0] + '@s.whatsapp.net';
    const d = load().filter(b => b !== jid); save(d);
    await sock.sendMessage(chatId, { text: `✅ @${jid.split('@')[0]} has been unbanned.`, mentions: [jid] }, { quoted: message });
}
module.exports = { banCommand, unbanCommand };
