const axios = require('axios');
async function memeCommand(sock, chatId, message) {
    try {
        const r = await axios.get('https://meme-api.com/gimme');
        await sock.sendMessage(chatId, { image: { url: r.data.url }, caption: `😂 *${r.data.title}*\nr/${r.data.subreddit}` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to get meme.' }, { quoted: message }); }
}
module.exports = memeCommand;
