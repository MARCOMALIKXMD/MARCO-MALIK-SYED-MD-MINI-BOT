const list = ['You are amazing! 🌟','You light up every room! ✨','Your smile could cure any sadness! 😊','You are incredibly talented! 🎯','The world is better because of you! 💖','You inspire everyone! 🌈','You are one in a million! 💫'];
async function complimentCommand(sock, chatId, message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0];
    const c = list[Math.floor(Math.random()*list.length)];
    const text = target ? `@${target.split('@')[0]} — ${c}` : c;
    await sock.sendMessage(chatId, { text: `💌 *Compliment*\n\n${text}`, mentions: target?[target]:[] }, { quoted: message });
}
module.exports = complimentCommand;
