const { downloadContentFromMessage } = require('@adiwajshing/baileys');
async function simageCommand(sock, quotedMessage, chatId) {
    try {
        if (!quotedMessage?.stickerMessage) return sock.sendMessage(chatId, { text: '❌ Reply to a sticker.' });
        const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
        const chunks=[]; for await(const c of stream) chunks.push(c);
        await sock.sendMessage(chatId, { image: Buffer.concat(chunks), caption: '✅ Sticker converted to image.' });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to convert sticker.' }); }
}
module.exports = simageCommand;
