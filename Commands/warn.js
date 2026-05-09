const { incrementWarningCount, getWarningCount, resetWarningCount } = require('../lib/index');
const config = require('../config');
async function warnCommand(sock, chatId, senderId, mentionedJidList, message) {
    const target = mentionedJidList[0] || message.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(chatId, { text: '❌ Mention a user to warn.' }, { quoted: message });
    const count = await incrementWarningCount(chatId, target);
    const max = config.WARN_COUNT||3;
    if (count >= max) {
        try { await sock.groupParticipantsUpdate(chatId,[target],'remove'); await resetWarningCount(chatId,target); await sock.sendMessage(chatId,{text:`⚠️ @${target.split('@')[0]} kicked after ${max} warnings!`,mentions:[target]},{quoted:message}); }
        catch(e) { await sock.sendMessage(chatId,{text:`⚠️ @${target.split('@')[0]} reached max warnings (${max})! Could not kick.`,mentions:[target]},{quoted:message}); }
    } else { await sock.sendMessage(chatId,{text:`⚠️ *Warning ${count}/${max}*\n@${target.split('@')[0]} warned.`,mentions:[target]},{quoted:message}); }
}
async function warningsCommand(sock, chatId, mentionedJidList) {
    const target = mentionedJidList[0];
    if (!target) return sock.sendMessage(chatId, { text: '❌ Mention a user.' });
    const count = await getWarningCount(chatId, target);
    await sock.sendMessage(chatId, { text: `⚠️ @${target.split('@')[0]} has *${count}/${config.WARN_COUNT||3}* warnings.`, mentions:[target] });
}
module.exports = { warnCommand, warningsCommand };
