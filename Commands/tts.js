const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');
async function ttsCommand(sock, chatId, text, message, language='en') {
    if (!text) return sock.sendMessage(chatId, { text: '❌ Provide text. Example: .tts Hello World' }, { quoted: message });
    const tmpDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const fp = path.join(tmpDir, `tts-${Date.now()}.mp3`);
    const gtts = new gTTS(text, language);
    gtts.save(fp, async function(err) {
        if (err) return sock.sendMessage(chatId, { text: '❌ Error generating audio.' }, { quoted: message });
        await sock.sendMessage(chatId, { audio: { url: fp }, mimetype: 'audio/mpeg', ptt: false }, { quoted: message });
        try { setTimeout(()=>fs.unlinkSync(fp), 5000); } catch(e){}
    });
}
module.exports = ttsCommand;
