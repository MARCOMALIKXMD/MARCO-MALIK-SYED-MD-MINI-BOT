const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const { writeExifImg, writeExifVid } = require('../lib/exif');
const fs = require('fs');
const settings = require('../settings');

async function stickerCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let media = quoted || message.message;
        let type = null;
        if (media?.imageMessage) type = 'image';
        else if (media?.videoMessage) type = 'video';
        else if (media?.stickerMessage) type = 'sticker';
        if (!type) return sock.sendMessage(chatId, { text: '❌ Reply to or send an image/video to make a sticker.' }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        const stream = await downloadContentFromMessage(media[`${type}Message`] || media.imageMessage, type === 'sticker' ? 'sticker' : type);
        const chunks = []; for await (const c of stream) chunks.push(c);
        const buffer = Buffer.concat(chunks);

        const out = type === 'video'
            ? await writeExifVid(buffer, { packname: settings.packname, author: settings.author })
            : await writeExifImg(buffer, { packname: settings.packname, author: settings.author });

        await sock.sendMessage(chatId, { sticker: fs.readFileSync(out) }, { quoted: message });
        try { fs.unlinkSync(out); } catch (e) {}
    } catch (err) {
        await sock.sendMessage(chatId, { text: '❌ Failed to create sticker. Make sure ffmpeg is installed.' }, { quoted: message });
    }
}
module.exports = stickerCommand;
