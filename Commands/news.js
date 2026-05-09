async function newsCommand(sock, chatId) {
    await sock.sendMessage(chatId, { text: '📰 *Latest News*\n\nVisit: https://news.google.com\nOr: https://bbc.com/news' });
}
module.exports = newsCommand;
