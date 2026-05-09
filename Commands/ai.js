const axios = require('axios');
async function aiCommand(sock, chatId, message) {
    try {
        const query = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(' ').slice(1).join(' ').trim();
        if (!query) return sock.sendMessage(chatId, { text: '❌ Ask something. Example: .ai What is AI?' }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });
        const r = await axios.get(`https://api.siputzx.my.id/api/ai/llama?prompt=${encodeURIComponent(query)}`, { timeout:20000 });
        const reply = r.data?.data || r.data?.response || r.data?.message;
        if (!reply) throw new Error('No response');
        await sock.sendMessage(chatId, { text: `🤖 *AI Response*\n\n${reply}` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ AI unavailable. Try again later.' }, { quoted: message }); }
}
module.exports = aiCommand;
