const { setChatbot, getChatbot } = require('../lib/index');
const axios = require('axios');
async function handleChatbotCommand(sock, chatId, message, match) {
    if (match==='on') { await setChatbot(chatId,true); return sock.sendMessage(chatId,{text:'✅ Chatbot enabled.'},{quoted:message}); }
    if (match==='off') { await setChatbot(chatId,false); return sock.sendMessage(chatId,{text:'❌ Chatbot disabled.'},{quoted:message}); }
    const cfg = await getChatbot(chatId);
    await sock.sendMessage(chatId,{text:`🤖 Chatbot: *${cfg?.enabled?'on':'off'}*\n.chatbot on / .chatbot off`},{quoted:message});
}
async function handleChatbotResponse(sock, chatId, message, userMessage) {
    try {
        const cfg = await getChatbot(chatId);
        if (!cfg?.enabled) return;
        if (userMessage.startsWith('.')) return;
        const r = await axios.get(`https://api.simsimi.vip/v1/simsimi?text=${encodeURIComponent(userMessage)}&lc=en`);
        const reply = r.data?.success?.text;
        if (reply) await sock.sendMessage(chatId, { text: reply }, { quoted: message });
    } catch(e){}
}
module.exports = { handleChatbotCommand, handleChatbotResponse };
