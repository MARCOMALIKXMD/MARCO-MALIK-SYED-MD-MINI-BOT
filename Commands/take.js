const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const webp = require('node-webpmux');
const crypto = require('crypto');
async function takeCommand(sock, chatId, message, args) {
    try {
        const packname = args[0]||'𓆩 MARCO MALIK & SYED-MD MINI BOT 𓆪', author = args[1]||'MARCO MĀLÏK';
        const q = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!q?.stickerMessage) return sock.sendMessage(chatId, { text: '❌ Reply to a sticker.' }, { quoted: message });
        const stream = await downloadContentFromMessage(q.stickerMessage, 'sticker');
        const chunks=[]; for await(const c of stream) chunks.push(c);
        const img = new webp.Image(); await img.load(Buffer.concat(chunks));
        const json = { 'sticker-pack-id': crypto.randomBytes(32).toString('hex'), 'sticker-pack-name': packname, 'sticker-pack-publisher': author, emojis: ['🤖'] };
        const attr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);
        const jb = Buffer.from(JSON.stringify(json),'utf8');
        const exif = Buffer.concat([attr,jb]); exif.writeUIntLE(jb.length,14,4);
        img.exif = exif;
        await sock.sendMessage(chatId, { sticker: await img.save(null) }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Error processing sticker.' }, { quoted: message }); }
}
module.exports = takeCommand;
