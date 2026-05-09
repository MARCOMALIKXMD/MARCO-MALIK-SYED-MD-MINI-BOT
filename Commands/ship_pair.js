async function pairCommand(sock, chatId, message) {
    await sock.sendMessage(chatId, { text: `💑 *Pair Command*\n\nMention two people:\n.pair @user1 @user2` }, { quoted: message });
}
module.exports = pairCommand;
