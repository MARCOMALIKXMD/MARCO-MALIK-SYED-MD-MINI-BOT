const { getAntilink } = require('./index');
const isAdmin         = require('./isAdmin');

const LINK_REGEX = /(https?:\/\/|www\.|chat\.whatsapp\.com|t\.me\/|bit\.ly\/|tinyurl\.com\/)[^\s]*/i;

async function Antilink(message, sock) {
    try {
        const chatId   = message.key.remoteJid;
        if (!chatId.endsWith('@g.us')) return;

        const senderId = message.key.participant || message.key.remoteJid;
        if (message.key.fromMe) return;

        const text = message.message?.conversation
            || message.message?.extendedTextMessage?.text
            || message.message?.imageMessage?.caption
            || message.message?.videoMessage?.caption || '';

        if (!LINK_REGEX.test(text)) return;

        const cfg = await getAntilink(chatId);
        if (!cfg?.enabled) return;

        const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
        if (isSenderAdmin) return;

        // Delete the message
        try { await sock.sendMessage(chatId, { delete: message.key }); } catch (e) {}

        if (cfg.action === 'kick') {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            await sock.sendMessage(chatId, {
                text: `🚫 @${senderId.split('@')[0]} was kicked for sending a link!`,
                mentions: [senderId]
            });
        } else if (cfg.action === 'warn') {
            const { incrementWarningCount } = require('./index');
            const count = await incrementWarningCount(chatId, senderId);
            await sock.sendMessage(chatId, {
                text: `⚠️ @${senderId.split('@')[0]} Links are not allowed! Warning ${count}/3`,
                mentions: [senderId]
            });
        } else {
            await sock.sendMessage(chatId, {
                text: `🚫 @${senderId.split('@')[0]} Links are not allowed in this group!`,
                mentions: [senderId]
            });
        }
    } catch (e) {}
}

module.exports = { Antilink };
