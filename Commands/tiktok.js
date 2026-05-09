const axios = require('axios');
async function tiktokCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const url = text.split(' ').slice(1).join(' ').trim();
        if (!url || !url.includes('tiktok')) return sock.sendMessage(chatId, { text: '❌ Provide a TikTok link.\nExample: .tiktok https://vm.tiktok.com/xxx' }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });
        const r = await axios.get(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`, { timeout:15000 });
        const videoUrl = r.data?.data?.play || r.data?.data?.video;
        const title = r.data?.data?.title || 'TikTok Video';
        if (!videoUrl) throw new Error('No URL');
        await sock.sendMessage(chatId, { video:{url:videoUrl}, caption:`🎵 *${title}*\n\nDownloaded by MARCO MALIK & SYED-MD MINI BOT`, mimetype:'video/mp4' }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to download TikTok video.' }, { quoted: message }); }
}
module.exports = tiktokCommand;
