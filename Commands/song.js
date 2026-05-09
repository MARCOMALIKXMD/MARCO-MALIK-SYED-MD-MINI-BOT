const yts = require('yt-search');
async function songCommand(sock, chatId, message) {
    try {
        const query = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').slice(5).trim();
        if (!query) return sock.sendMessage(chatId, { text: '❌ Provide a song name.' }, { quoted: message });
        const r = await yts(query); const v = r.videos[0];
        if (!v) return sock.sendMessage(chatId, { text: '❌ No results.' }, { quoted: message });
        await sock.sendMessage(chatId, { image:{url:v.thumbnail}, caption:`🎵 *${v.title}*\n👤 ${v.author.name}\n⏱ ${v.timestamp}\n👁 ${v.views} views\n🔗 ${v.url}\n\nUse .play ${query} to download!` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Song search failed.' }, { quoted: message }); }
}
module.exports = songCommand;
