const settings = require('../settings');
async function aliveCommand(sock, chatId, message) {
    const up = process.uptime();
    const h = Math.floor(up/3600), m = Math.floor((up%3600)/60), s = Math.floor(up%60);
    const mem = (process.memoryUsage().rss/1024/1024).toFixed(2);
    await sock.sendMessage(chatId, {
        text: `*${settings.botName}*\n\n✅ Bot is *Online*\n⏱ Uptime: *${h}h ${m}m ${s}s*\n💾 RAM: *${mem} MB*\n🤖 Version: *${settings.version}*\n👑 Owner: *${settings.botOwner}*`
    }, { quoted: message });
}
module.exports = aliveCommand;
