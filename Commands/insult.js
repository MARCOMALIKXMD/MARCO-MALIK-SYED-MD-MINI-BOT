const list = ['You are as sharp as a marble! 🗿','I\'d explain it but I left my crayons at home.','You bring joy when you leave the room.','You\'re proof that evolution can go in reverse.','If brains were gasoline, you couldn\'t power a fly\'s scooter.'];
async function insultCommand(sock, chatId, message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0];
    const i = list[Math.floor(Math.random()*list.length)];
    const text = target ? `@${target.split('@')[0]} — ${i}` : i;
    await sock.sendMessage(chatId, { text: `🔥 *Insult*\n\n${text}`, mentions: target?[target]:[] }, { quoted: message });
}
module.exports = insultCommand;
