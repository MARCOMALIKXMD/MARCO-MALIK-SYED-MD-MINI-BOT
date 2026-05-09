async function kickCommand(sock, chatId, senderId, mentionedJidList, message) {
    if (!mentionedJidList?.length) {
        const q = message.message?.extendedTextMessage?.contextInfo?.participant;
        if (q) mentionedJidList = [q]; else return sock.sendMessage(chatId, { text: '❌ Mention a user to kick.' }, { quoted: message });
    }
    try {
        await sock.groupParticipantsUpdate(chatId, mentionedJidList, 'remove');
        const nums = mentionedJidList.map(j => '@' + j.split('@')[0]).join(', ');
        await sock.sendMessage(chatId, { text: `✅ ${nums} kicked.`, mentions: mentionedJidList }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to kick. Bot must be admin.' }, { quoted: message });
    }
}
module.exports = kickCommand;
