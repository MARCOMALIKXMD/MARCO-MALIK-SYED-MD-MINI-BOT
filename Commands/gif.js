const axios = require('axios');
const settings = require('../settings');
async function gifCommand(sock, chatId, message) {
    try {
        const query = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').slice(4).trim() || 'funny';
        const r = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${settings.giphyApiKey}&q=${encodeURIComponent(query)}&limit=10&rating=g`);
        const gifs = r.data.data;
        if (!gifs?.length) throw new Error('none');
        const g = gifs[Math.floor(Math.random()*gifs.length)];
        await sock.sendMessage(chatId, { video:{url:g.images.original.url}, caption:`🎬 ${g.title}`, gifPlayback:true }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to get GIF.' }, { quoted: message }); }
}
module.exports = gifCommand;
