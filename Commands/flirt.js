const list = ['Are you a magician? Because whenever I look at you, everyone else disappears. ✨','Do you have a map? I keep getting lost in your eyes. 👀','Is your name Google? Because you have everything I\'ve been searching for. 🔍','Do you believe in love at first sight, or should I walk by again? 💕','Are you a campfire? You\'re hot and I want s\'more. 🔥'];
async function flirtCommand(sock, chatId, message) {
    await sock.sendMessage(chatId, { text: `💝 *Flirt Line*\n\n${list[Math.floor(Math.random()*list.length)]}` }, { quoted: message });
}
module.exports = flirtCommand;
