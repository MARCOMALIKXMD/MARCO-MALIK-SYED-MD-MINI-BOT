async function githubCommand(sock, chatId, message) {
    await sock.sendMessage(chatId, { text: `🤖 *MARCO MALIK & SYED-MD MINI BOT*\n\n📌 *Bot Name:* MARCO MALIK & SYED-MD MINI BOT\n👨‍💻 *Developer:* MARCO MĀLÏK and SYED MD\n🌐 *System:* Public Multi-User\n\nType *.help* to see all commands!` }, { quoted: message });
}
module.exports = githubCommand;
