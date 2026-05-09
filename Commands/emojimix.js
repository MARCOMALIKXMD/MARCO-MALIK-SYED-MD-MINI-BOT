const axios = require('axios');
async function emojimixCommand(sock, chatId, message) {
    try {
        const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').slice(9).trim().split('+');
        if (text.length < 2) return sock.sendMessage(chatId, { text: '❌ Provide two emojis. Example: .emojimix 😊+🔥' }, { quoted: message });
        const e1 = encodeURIComponent(text[0].trim()), e2 = encodeURIComponent(text[1].trim());
        const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${e1}_${e2}`;
        const r = await axios.get(url);
        const imgUrl = r.data?.results?.[0]?.media_formats?.png_transparent?.url;
        if (!imgUrl) throw new Error('No image');
        await sock.sendMessage(chatId, { image:{url:imgUrl}, caption:`${text[0].trim()} + ${text[1].trim()} = 🎉` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Could not mix emojis. Try different ones!' }, { quoted: message }); }
}
module.exports = emojimixCommand;
