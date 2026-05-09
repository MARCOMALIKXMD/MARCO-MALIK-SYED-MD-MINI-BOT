const settings = require('../settings');
async function ownerCommand(sock, chatId) {
    await sock.sendMessage(chatId, {
        text: `👑 *Bot Owner*\n\nName: *${settings.botOwner}*\nNumber: *+${settings.ownerNumber}*`
    });
}
module.exports = ownerCommand;
