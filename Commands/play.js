const yts = require('yt-search');
const axios = require('axios');
async function playCommand(sock, chatId, message) {
    try {
        const query = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').slice(6).trim();
        if (!query) return sock.sendMessage(chatId, { text: '❌ Provide a song name. Example: .play Shape of You' }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });
        const r = await yts(query);
        const v = r.videos[0];
        if (!v) return sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: message });
        await sock.sendMessage(chatId, { text: `🎵 *${v.title}*\n👤 ${v.author.name}\n⏱ ${v.timestamp}\n🔗 ${v.url}\n\n_Downloading..._` }, { quoted: message });
        const dl = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(v.url)}`, { timeout:30000 });
        const dlUrl = dl.data?.data?.url;
        if (!dlUrl) throw new Error('No URL');
        await sock.sendMessage(chatId, { audio: { url: dlUrl }, mimetype:'audio/mpeg', ptt:false }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to play song.' }, { quoted: message }); }
}
module.exports = playCommand;
