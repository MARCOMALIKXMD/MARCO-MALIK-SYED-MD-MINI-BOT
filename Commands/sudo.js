const { addSudo, removeSudo } = require('../lib/index');
async function sudoCommand(sock, chatId, message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return sock.sendMessage(chatId, { text: '❌ Mention a user to add as sudo.' }, { quoted: message });
    await addSudo(mentioned[0]);
    await sock.sendMessage(chatId, { text: `✅ @${mentioned[0].split('@')[0]} added as sudo.`, mentions:[mentioned[0]] }, { quoted: message });
}
async function unsudoCommand(sock, chatId, message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return sock.sendMessage(chatId, { text: '❌ Mention a user to remove from sudo.' }, { quoted: message });
    await removeSudo(mentioned[0]);
    await sock.sendMessage(chatId, { text: `✅ @${mentioned[0].split('@')[0]} removed from sudo.`, mentions:[mentioned[0]] }, { quoted: message });
}
module.exports = { sudoCommand, unsudoCommand };
