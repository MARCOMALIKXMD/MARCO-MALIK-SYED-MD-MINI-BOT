const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const axios = require('axios');
async function miscCommand(sock, chatId, message, args) {
    try {
        const type = args[0];
        const q = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const img = q?.imageMessage || message.message?.imageMessage;
        if (!img) return sock.sendMessage(chatId, { text: `❌ Reply to an image to apply .${type}` }, { quoted: message });
        const stream = await downloadContentFromMessage(img, 'image');
        const chunks=[]; for await(const c of stream) chunks.push(c);
        const b64 = Buffer.concat(chunks).toString('base64');
        const url = `https://api.dreaded.site/api/${type}?image=${encodeURIComponent('data:image/jpeg;base64,'+b64)}`;
        const r = await axios.get(url, { responseType:'arraybuffer', timeout:15000 });
        await sock.sendMessage(chatId, { image: Buffer.from(r.data), caption: `✅ ${type} applied!` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: `❌ Failed to apply ${args[0]}.` }, { quoted: message }); }
}
async function animeCommand(sock, chatId, message, args) {
    try {
        const type = args[0]||'hug';
        const r = await axios.get(`https://nekos.best/api/v2/${type}`, { timeout:10000 });
        const url = r.data?.results?.[0]?.url;
        if (!url) throw new Error('No URL');
        await sock.sendMessage(chatId, { image:{url}, caption:`✨ ${type}` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: `❌ Failed to get ${args[0]} image.` }, { quoted: message }); }
}
async function piesCommand(sock, chatId, message, args) {
    try {
        const cc = (args[0]||'us').slice(0,2).toLowerCase();
        await sock.sendMessage(chatId, { image:{url:`https://flagcdn.com/w640/${cc}.png`}, caption:`🌍 Flag: ${args[0]||'US'}` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to get flag.' }, { quoted: message }); }
}
module.exports = { miscCommand, animeCommand, piesCommand };
