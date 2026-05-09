async function pingCommand(sock, chatId, message) {
    const start = Date.now();
    const end = Date.now();
    await sock.sendMessage(chatId, { text: `🏓 *Pong!*\n📶 Speed: *${end - start}ms*` }, { quoted: message });
}
module.exports = pingCommand;
