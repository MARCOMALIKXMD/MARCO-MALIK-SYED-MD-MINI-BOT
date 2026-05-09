async function shipCommand(sock, chatId, message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const senderId = message.key.participant || message.key.remoteJid;
    const p1 = senderId, p2 = mentioned[0] || senderId;
    const pct = Math.floor(Math.random()*101);
    const bar = '█'.repeat(Math.floor(pct/10)) + '░'.repeat(10-Math.floor(pct/10));
    const emoji = pct>=80?'💖':pct>=60?'💕':pct>=40?'💗':'💔';
    await sock.sendMessage(chatId, { text: `💘 *Ship Calculator*\n\n@${p1.split('@')[0]} + @${p2.split('@')[0]}\n\n${emoji} ${pct}% Match\n[${bar}]`, mentions: [p1, p2] }, { quoted: message });
}
module.exports = shipCommand;
