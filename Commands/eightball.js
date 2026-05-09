const responses = ['✅ It is certain.','✅ Without a doubt.','✅ Yes, definitely.','✅ Most likely.','✅ Outlook good.','❓ Reply hazy, try again.','❓ Ask again later.','❓ Cannot predict now.','❌ Don\'t count on it.','❌ My reply is no.','❌ Very doubtful.'];
async function eightBallCommand(sock, chatId, question) {
    if (!question) return sock.sendMessage(chatId, { text: '❓ Please provide a question!\nExample: .8ball Will I win?' });
    await sock.sendMessage(chatId, { text: `🎱 *Magic 8-Ball*\n\n❓ *Question:* ${question}\n\n${responses[Math.floor(Math.random()*responses.length)]}` });
}
module.exports = eightBallCommand;
