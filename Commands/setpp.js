const { downloadContentFromMessage } = require('@adiwajshing/baileys');
async function setppCommand(sock, chatId, message) {
    try {
        const q = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const img = q?.imageMessage || message.message?.imageMessage;
        if (!img) return sock.sendMessage(chatId, { text: '❌ Send or reply to an image.' }, { quoted: message });
        const stream = await downloadContentFromMessage(img, 'image');
        const chunks=[]; for await(const c of stream) chunks.push(c);
        await sock.updateProfilePicture(chatId, Buffer.concat(chunks));
        await sock.sendMessage(chatId, { text: '✅ Profile picture updated!' }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to update profile picture.' }, { quoted: message }); }
}
module.exports = setppCommand;
