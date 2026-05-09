async function promoteCommand(sock, chatId, mentionedJidList, message) {
    if (!mentionedJidList?.length) return sock.sendMessage(chatId, { text: '❌ Mention a user to promote.' }, { quoted: message });
    try {
        await sock.groupParticipantsUpdate(chatId, mentionedJidList, 'promote');
        const nums = mentionedJidList.map(j => '@' + j.split('@')[0]).join(', ');
        await sock.sendMessage(chatId, { text: `✅ ${nums} promoted to admin.`, mentions: mentionedJidList }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to promote. Bot must be admin.' }, { quoted: message }); }
}
module.exports = promoteCommand;
