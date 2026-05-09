const axios = require('axios');
async function quoteCommand(sock, chatId, message) {
    try {
        const r = await axios.get('https://api.quotable.io/random');
        await sock.sendMessage(chatId, { text: `💬 *Quote*\n\n"${r.data.content}"\n\n— *${r.data.author}*` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to get quote.' }, { quoted: message }); }
}
module.exports = quoteCommand;
