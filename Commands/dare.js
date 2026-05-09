const dares = ['Send a voice message singing a song.','Change your profile picture for 1 hour.','Write "I am a potato" in this chat.','Tell a joke to the group.','Do 10 push-ups right now.','Post a selfie with a funny face.','Speak in rhymes for the next 5 minutes.'];
async function dareCommand(sock, chatId, message) {
    await sock.sendMessage(chatId, { text: `😈 *Truth or Dare — DARE*\n\n${dares[Math.floor(Math.random()*dares.length)]}` }, { quoted: message });
}
module.exports = { dareCommand };
