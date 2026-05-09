const settings = require('../settings');
async function settingsCommand(sock, chatId, message) {
    await sock.sendMessage(chatId, { text: `⚙️ *Bot Settings*\n\n🤖 *MARCO MALIK & SYED-MD MINI BOT:* ${settings.botName}\n👑 *MARCO MALIK & SYED ABDUL WAHAB:* ${settings.botOwner}\n📱 *923706328012 / 923049730127:* +${settings.ownerNumber}\n🔖 *9.0.0:* ${settings.version}\n📦 *MARCO MALIK MINI BOT:* ${settings.packname}\n⚡ *public:* ${settings.commandMode}` }, { quoted: message });
}
module.exports = settingsCommand;
