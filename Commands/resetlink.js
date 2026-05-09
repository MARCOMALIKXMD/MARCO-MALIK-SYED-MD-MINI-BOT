async function resetLinkCommand(sock, chatId, message) {
    try {
        await sock.groupRevokeInvite(chatId);
        const code = await sock.groupInviteCode(chatId);
        await sock.sendMessage(chatId, { text: `🔗 *Group link reset!*\n\nNew link: https://chat.whatsapp.com/${code}` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to reset link. Bot must be admin.' }, { quoted: message }); }
}
module.exports = resetLinkCommand;
