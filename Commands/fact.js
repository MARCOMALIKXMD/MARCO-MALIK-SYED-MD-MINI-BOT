const axios = require('axios');
async function factCommand(sock, chatId, message) {
    try {
        const r = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        await sock.sendMessage(chatId, { text: `🧠 *Fun Fact*\n\n${r.data.text}` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to get fact.' }, { quoted: message }); }
}
module.exports = factCommand;
