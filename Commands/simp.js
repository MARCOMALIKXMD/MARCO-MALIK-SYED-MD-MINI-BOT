async function simpCommand(sock, chatId, quotedMsg, mentionedJid, senderId) {
    const target = mentionedJid[0] || senderId;
    const pct = Math.floor(Math.random()*101);
    const bar = '█'.repeat(Math.floor(pct/10))+'░'.repeat(10-Math.floor(pct/10));
    await sock.sendMessage(chatId, { text: `🥺 *Simp Meter*\n\n@${target.split('@')[0]}\n\n[${bar}] ${pct}%\n\n${pct>70?'Super Simp! 🥺':pct>40?'Medium Simp 😅':'Not a Simp 😎'}`, mentions:[target] });
}
module.exports = simpCommand;
