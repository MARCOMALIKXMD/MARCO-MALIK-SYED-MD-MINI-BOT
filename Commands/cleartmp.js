const { cleanupTempFiles } = require('../lib/tempCleanup');
async function cleartmpCommand(sock, chatId, message) {
    cleanupTempFiles(0);
    await sock.sendMessage(chatId, { text: '✅ Temp files cleared!' }, { quoted: message });
}
module.exports = cleartmpCommand;
