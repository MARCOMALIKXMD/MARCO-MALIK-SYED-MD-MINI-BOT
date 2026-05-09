const truths = ['What is your biggest fear?','Have you ever lied to a close friend?','What is your most embarrassing moment?','Have you ever cheated on a test?','What is your biggest secret?','What do you think about most often?','Who was your first crush?'];
async function truthCommand(sock, chatId, message) {
    await sock.sendMessage(chatId, { text: `🤔 *Truth or Dare — TRUTH*\n\n${truths[Math.floor(Math.random()*truths.length)]}` }, { quoted: message });
}
module.exports = { truthCommand };
