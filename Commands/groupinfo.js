async function groupInfoCommand(sock, chatId, message) {
    try {
        const meta = await sock.groupMetadata(chatId);
        const admins = meta.participants.filter(p=>p.admin);
        await sock.sendMessage(chatId, { text: `*📋 Group Info*\n\n*Name:* ${meta.subject}\n*ID:* ${meta.id}\n*Members:* ${meta.participants.length}\n*Admins:* ${admins.length}\n*Created:* ${new Date(meta.creation*1000).toLocaleDateString()}\n*Description:* ${meta.desc||'No description'}` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to get group info.' }, { quoted: message }); }
}
module.exports = groupInfoCommand;
