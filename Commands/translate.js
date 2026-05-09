const fetch = require('node-fetch');
async function handleTranslateCommand(sock, chatId, message, match) {
    try {
        let text = '', lang = 'en';
        const q = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (q) {
            text = q.conversation || q.extendedTextMessage?.text || '';
            lang = match.trim() || 'en';
        } else {
            const parts = match.trim().split(' ');
            lang = parts.pop();
            text = parts.join(' ');
        }
        if (!text) return sock.sendMessage(chatId, { text: 'Usage:\n1. Reply to a message: .translate <lang>\n2. Direct: .translate <text> <lang>\nExample: .translate hello fr' }, { quoted: message });
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        const translated = data?.[0]?.[0]?.[0];
        if (!translated) throw new Error('No translation');
        await sock.sendMessage(chatId, { text: translated }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Translation failed.' }, { quoted: message }); }
}
module.exports = { handleTranslateCommand };
