const { setAntitag, getAntitag } = require('../lib/index');
async function handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    const args = userMessage.slice(8).trim().toLowerCase();
    if (args==='on') { await setAntitag(chatId,true); return sock.sendMessage(chatId,{text:'✅ Antitag enabled.'},{quoted:message}); }
    if (args==='off') { await setAntitag(chatId,false); return sock.sendMessage(chatId,{text:'❌ Antitag disabled.'},{quoted:message}); }
    const cfg = await getAntitag(chatId);
    await sock.sendMessage(chatId,{text:`*ANTITAG*\nStatus: *${cfg?.enabled?'on':'off'}*\n\n.antitag on / .antitag off`},{quoted:message});
}
module.exports = { handleAntitagCommand };
