const axios = require('axios');
async function lyricsCommand(sock, chatId, songTitle, message) {
    if (!songTitle) return sock.sendMessage(chatId, { text: '❌ Provide a song name. Example: .lyrics Shape of You' }, { quoted: message });
    try {
        const parts = songTitle.split(' ');
        const artist = parts.slice(0,2).join('/'), song = parts.slice(2).join(' ')||songTitle;
        const r = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
        const lyr = r.data.lyrics;
        if (!lyr) throw new Error('empty');
        const out = lyr.length > 4000 ? lyr.slice(0,4000)+'...\n\n_(truncated)_' : lyr;
        await sock.sendMessage(chatId, { text: `🎵 *${songTitle}*\n\n${out}` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: `❌ Lyrics not found for "${songTitle}".` }, { quoted: message }); }
}
module.exports = lyricsCommand;
