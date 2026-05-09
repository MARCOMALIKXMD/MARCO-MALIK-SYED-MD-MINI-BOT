const axios = require('axios');
async function facebookCommand(sock, chatId, message) {
    try {
        const url = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(' ').slice(1).join(' ').trim();
        if (!url || !url.includes('facebook')) return sock.sendMessage(chatId, { text: '❌ Provide a Facebook video URL.' }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        const r = await axios.get(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`, { timeout:15000 });
        if (!r.data?.data?.url) throw new Error('No URL');
        await sock.sendMessage(chatId, { video:{url:r.data.data.url}, caption:'📘 Downloaded from Facebook\nBy MARCO MALIK & SYED-MD MINI BOT', mimetype:'video/mp4' }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to download from Facebook.' }, { quoted: message }); }
}
module.exports = facebookCommand;
