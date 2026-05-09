const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const axios = require('axios'), FormData = require('form-data');
const exec = {
    async exec(sock, message) {
        try {
            const chatId = message.key.remoteJid;
            const q = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const img = q?.imageMessage || message.message?.imageMessage;
            if (!img) return sock.sendMessage(chatId, { text: '❌ Send or reply to an image.' }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
            const stream = await downloadContentFromMessage(img, 'image');
            const chunks=[]; for await(const c of stream) chunks.push(c);
            const form = new FormData();
            form.append('image_file', Buffer.concat(chunks), { filename:'image.png', contentType:'image/png' });
            const r = await axios.post('https://api.remove.bg/v1.0/removebg', form, { headers:{...form.getHeaders(),'X-Api-Key':'demo'}, responseType:'arraybuffer' });
            await sock.sendMessage(chatId, { image: Buffer.from(r.data), caption:'✅ Background removed!' }, { quoted: message });
        } catch (e) {
            const chatId = message.key.remoteJid;
            await sock.sendMessage(chatId, { text: '❌ Failed to remove background. Requires a valid remove.bg API key in config.' }, { quoted: message });
        }
    }
};
module.exports = exec;
