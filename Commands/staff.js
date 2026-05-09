const settings = require('../settings');
const { load } = require('../lib/index');
async function staffCommand(sock, chatId, message) {
    const data = load();
    const sudo = data.sudo || [];
    let text = `👥 *Bot Staff*\n\n👑 *Owner:*\n• ${settings.botOwner} (+${settings.ownerNumber})\n\n`;
    text += sudo.length ? `🛡️ *Sudo Admins:*\n${sudo.map(s=>`• +${s.split('@')[0]}`).join('\n')}` : '🛡️ *Sudo Admins:* None';
    await sock.sendMessage(chatId, { text }, { quoted: message });
}
module.exports = staffCommand;
