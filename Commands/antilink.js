const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    const args = userMessage.slice(9).trim().toLowerCase();
    if (args==='on') { await setAntilink(chatId,'on','delete'); return sock.sendMessage(chatId,{text:'✅ Antilink enabled (action: delete).\nUse .antilink set kick/warn to change.'},{quoted:message}); }
    if (args==='off') { await removeAntilink(chatId); return sock.sendMessage(chatId,{text:'❌ Antilink disabled.'},{quoted:message}); }
    if (args.startsWith('set ')) {
        const action = args.split(' ')[1];
        if (!['delete','kick','warn'].includes(action)) return sock.sendMessage(chatId,{text:'❌ Invalid action. Use: delete, kick, or warn'},{quoted:message});
        await setAntilink(chatId,'on',action);
        return sock.sendMessage(chatId,{text:`✅ Antilink action: *${action}*`},{quoted:message});
    }
    const cfg = await getAntilink(chatId);
    await sock.sendMessage(chatId,{text:`*ANTILINK*\nStatus: *${cfg?.enabled?'on':'off'}*\nAction: *${cfg?.action||'none'}*\n\n.antilink on/off\n.antilink set delete/kick/warn`},{quoted:message});
}
module.exports = { handleAntilinkCommand };
