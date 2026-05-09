const settings = require('../settings');
async function helpCommand(sock, chatId, message) {
    const up = process.uptime();
    const h = Math.floor(up/3600), m = Math.floor((up%3600)/60);
    await sock.sendMessage(chatId, {
        text: `╔════════════════════╗\n║  *${settings.botName}*\n║  *v${settings.version}*\n╚════════════════════╝\n\n*👑 OWNER*\n.owner | .sudo | .unsudo | .mode\n\n*🛡️ GROUP MANAGEMENT*\n.kick | .ban | .unban | .promote | .demote\n.mute | .unmute | .tagall | .tagnotadmin\n.hidetag | .setpp | .open | .close\n.resetlink | .groupinfo\n\n*🔒 PROTECTION*\n.antilink | .antibadword | .antitag\n.antidelete | .anticall | .warn | .warnings\n.welcome | .goodbye\n\n*🤖 AUTO FEATURES*\n.autostatus | .autoread | .autotyping\n.chatbot | .pmblocker | .areact\n\n*🎵 MEDIA & FUN*\n.sticker | .s | .attp | .take | .steal\n.play | .song | .spotify | .tiktok\n.gif | .meme | .joke | .quote | .fact\n.truth | .dare | .8ball | .ship\n.compliment | .insult | .flirt | .simp\n.translate | .tts | .lyrics\n\n*🌐 SOCIAL MEDIA*\n.instagram | .facebook | .ss | .igs\n\n*🎮 GAMES*\n.tictactoe | .ttt | .move\n.hangman | .guess | .trivia\n\n*🖼️ IMAGE TOOLS*\n.removebg | .remini | .blur | .crop\n.imagine | .sora | .metallic | .ice\n.snow | .neon | .fire | .glitch\n\n*📋 INFO*\n.ping | .alive | .settings | .github\n.staff | .news | .emojimix | .shayari\n\n⏱ Uptime: *${h}h ${m}m*`
    }, { quoted: message });
}
module.exports = helpCommand;
