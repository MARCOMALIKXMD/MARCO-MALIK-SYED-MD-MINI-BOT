async function stupidCommand(sock, chatId, quotedMsg, mentionedJid, senderId) {
    const target = mentionedJid[0] || senderId;
    const pct = Math.floor(Math.random()*101);
    const bar = '█'.repeat(Math.floor(pct/10))+'░'.repeat(10-Math.floor(pct/10));
    await sock.sendMessage(chatId, { text: `🤪 *Stupid Meter*\n\n@${target.split('@')[0]}\n\n[${bar}] ${pct}%\n\n${pct>70?'It\'s So Stupid! 🤦':pct>40?'Medium Stupid 😂':'Not Stupid at all! 😌'}`, mentions:[target] });
}
module.exports = stupidCommand;
