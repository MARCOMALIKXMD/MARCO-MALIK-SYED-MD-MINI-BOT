const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const Jimp = require('jimp');
async function blurCommand(sock, chatId, message, quotedMessage) {
    try {
        const img = quotedMessage?.imageMessage || message.message?.imageMessage;
        if (!img) return sock.sendMessage(chatId, { text: '❌ Send or reply to an image.' }, { quoted: message });
        const stream = await downloadContentFromMessage(img, 'image');
        const chunks=[]; for await(const c of stream) chunks.push(c);
        const j = await Jimp.read(Buffer.concat(chunks));
        j.blur(15);
        await sock.sendMessage(chatId, { image: await j.getBufferAsync(Jimp.MIME_JPEG), caption: '✅ Blurred!' }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to blur image.' }, { quoted: message }); }
}
module.exports = blurCommand;
