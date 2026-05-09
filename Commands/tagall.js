async function tagAllCommand(sock, chatId, senderId, message) {
    try {
        const meta = await sock.groupMetadata(chatId);
        const mentions = meta.participants.map(p => p.id);
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const msg = text.split(' ').slice(1).join(' ') || '📢 Attention everyone!';
        let body = `*📢 ${msg}*\n\n` + mentions.map(m => `@${m.split('@')[0]}`).join('\n');
        await sock.sendMessage(chatId, { text: body, mentions }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed. Bot must be admin.' }, { quoted: message }); }
}
async function tagNotAdminCommand(sock, chatId, senderId, message) {
    try {
        const meta = await sock.groupMetadata(chatId);
        const non = meta.participants.filter(p => !p.admin);
        const mentions = non.map(p => p.id);
        let body = `*📢 Non-admins:*\n\n` + mentions.map(m => `@${m.split('@')[0]}`).join('\n');
        await sock.sendMessage(chatId, { text: body, mentions }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed.' }, { quoted: message }); }
}
module.exports = { tagAllCommand, tagNotAdminCommand };
