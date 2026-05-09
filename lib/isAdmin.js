async function isAdmin(sock, chatId, senderId) {
    try {
        const meta = await sock.groupMetadata(chatId);
        const admins = meta.participants.filter(p => p.admin).map(p => p.id);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        return {
            isSenderAdmin: admins.includes(senderId),
            isBotAdmin: admins.includes(botId),
            admins,
            participants: meta.participants,
        };
    } catch (e) {
        return { isSenderAdmin: false, isBotAdmin: false, admins: [], participants: [] };
    }
}

module.exports = isAdmin;
