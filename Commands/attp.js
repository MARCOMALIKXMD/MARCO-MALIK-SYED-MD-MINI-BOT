const axios = require('axios');
async function attpCommand(sock, chatId, message) {
    try {
        const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').slice(5).trim();
        if (!text) return sock.sendMessage(chatId, { text: '❌ Provide text. Example: .attp Hello' }, { quoted: message });
        const r = await axios.get(`https://api.dreaded.site/api/animatedtext?text=${encodeURIComponent(text)}`, { responseType:'arraybuffer' });
        await sock.sendMessage(chatId, { sticker: Buffer.from(r.data) }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to create animated sticker.' }, { quoted: message }); }
}
module.exports = attpCommand;
