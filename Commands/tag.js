async function tagCommand(sock, chatId, senderId, msg, replyMsg, message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return sock.sendMessage(chatId, { text: '❌ Mention users to tag.' }, { quoted: message });
    await sock.sendMessage(chatId, { text: msg || '📌', mentions: mentioned });
}
async function hideTagCommand(sock, chatId, senderId, msg, replyMsg, message) {
    try {
        const meta = await sock.groupMetadata(chatId);
        const mentions = meta.participants.map(p => p.id);
        await sock.sendMessage(chatId, { text: msg || ' ', mentions });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to hidetag.' }, { quoted: message }); }
}
module.exports = { tagCommand, hideTagCommand };
