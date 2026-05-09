const axios = require('axios');
async function instagramCommand(sock, chatId, message) {
    try {
        const url = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(' ').slice(1).join(' ').trim();
        if (!url || !url.includes('instagram')) return sock.sendMessage(chatId, { text: '❌ Provide an Instagram URL.' }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        const r = await axios.get(`https://api.siputzx.my.id/api/d/instagram?url=${encodeURIComponent(url)}`, { timeout:15000 });
        const data = r.data?.data;
        if (!data) throw new Error('No data');
        const mediaUrl = data.url || data.video_url || data.image_url;
        if (!mediaUrl) throw new Error('No media');
        if (mediaUrl.includes('.mp4') || data.video_url) await sock.sendMessage(chatId, { video:{url:mediaUrl}, caption:'📸 Downloaded from Instagram\nBy MARCO MALIK & SYED-MD MINI BOT', mimetype:'video/mp4' }, { quoted: message });
        else await sock.sendMessage(chatId, { image:{url:mediaUrl}, caption:'📸 Downloaded from Instagram\nBy MARCO MALIK & SYED-MD MINI BOT' }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to download from Instagram.' }, { quoted: message }); }
}
module.exports = instagramCommand;
