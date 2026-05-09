const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('./index');

async function handleJoinEvent(sock, groupId, participants) {
    try {
        if (!await isWelcomeOn(groupId)) return;
        const meta = await sock.groupMetadata(groupId);
        for (const p of participants) {
            await sock.sendMessage(groupId, {
                text: `🎉 Welcome @${p.split('@')[0]} to *${meta.subject}*!\nWe are glad to have you here.`,
                mentions: [p]
            });
        }
    } catch (e) {}
}

async function handleLeaveEvent(sock, groupId, participants) {
    try {
        if (!await isGoodByeOn(groupId)) return;
        const meta = await sock.groupMetadata(groupId);
        for (const p of participants) {
            await sock.sendMessage(groupId, {
                text: `👋 @${p.split('@')[0]} has left *${meta.subject}*. Goodbye!`,
                mentions: [p]
            });
        }
    } catch (e) {}
}

async function handlePromotionEvent(sock, groupId, participants) {
    try {
        for (const p of participants)
            await sock.sendMessage(groupId, { text:`🎉 @${p.split('@')[0]} has been promoted to admin!`, mentions:[p] });
    } catch (e) {}
}

async function handleDemotionEvent(sock, groupId, participants) {
    try {
        for (const p of participants)
            await sock.sendMessage(groupId, { text:`⬇️ @${p.split('@')[0]} has been demoted from admin.`, mentions:[p] });
    } catch (e) {}
}

async function welcomeCommand(sock, chatId, message) {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const arg  = text.split(' ').slice(1).join(' ').toLowerCase();
    if (arg === 'on')  { await addWelcome(chatId,null); return sock.sendMessage(chatId,{text:'✅ Welcome messages enabled.'},{quoted:message}); }
    if (arg === 'off') { await delWelcome(chatId);     return sock.sendMessage(chatId,{text:'❌ Welcome messages disabled.'},{quoted:message}); }
    return sock.sendMessage(chatId,{text:'Usage: .welcome on / .welcome off'},{quoted:message});
}

async function goodbyeCommand(sock, chatId, message) {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const arg  = text.split(' ').slice(1).join(' ').toLowerCase();
    if (arg === 'on')  { await addGoodbye(chatId,null); return sock.sendMessage(chatId,{text:'✅ Goodbye messages enabled.'},{quoted:message}); }
    if (arg === 'off') { await delGoodBye(chatId);      return sock.sendMessage(chatId,{text:'❌ Goodbye messages disabled.'},{quoted:message}); }
    return sock.sendMessage(chatId,{text:'Usage: .goodbye on / .goodbye off'},{quoted:message});
}

module.exports = { handleJoinEvent, handleLeaveEvent, handlePromotionEvent, handleDemotionEvent, welcomeCommand, goodbyeCommand };
