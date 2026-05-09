const axios = require('axios');
async function jokeCommand(sock, chatId, message) {
    try {
        const r = await axios.get('https://official-joke-api.appspot.com/random_joke');
        await sock.sendMessage(chatId, { text: `😂 *Joke*\n\n*Setup:* ${r.data.setup}\n*Punchline:* ${r.data.punchline}` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to get joke.' }, { quoted: message }); }
}
module.exports = jokeCommand;
