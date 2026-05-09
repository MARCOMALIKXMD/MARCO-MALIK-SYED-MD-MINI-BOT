async function demoteCommand(sock, chatId, mentionedJidList, message) {
    if (!mentionedJidList?.length) return sock.sendMessage(chatId, { text: '❌ Mention a user to demote.' }, { quoted: message });
    try {
        await sock.groupParticipantsUpdate(chatId, mentionedJidList, 'demote');
        const nums = mentionedJidList.map(j => '@' + j.split('@')[0]).join(', ');
        await sock.sendMessage(chatId, { text: `✅ ${nums} demoted from admin.`, mentions: mentionedJidList }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to demote. Bot must be admin.' }, { quoted: message }); }
}
module.exports = demoteCommand;
