async function muteCommand(sock, chatId, senderId, message, duration) {
    try {
        await sock.groupSettingUpdate(chatId, 'announcement');
        const dt = duration ? `for ${duration} min(s)` : 'indefinitely';
        await sock.sendMessage(chatId, { text: `🔇 Group muted ${dt}.` }, { quoted: message });
        if (duration) setTimeout(async () => { try { await sock.groupSettingUpdate(chatId,'not_announcement'); await sock.sendMessage(chatId,{text:'🔊 Group unmuted automatically.'}); } catch(e){} }, duration*60*1000);
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to mute. Bot must be admin.' }, { quoted: message }); }
}
async function unmuteCommand(sock, chatId) {
    try { await sock.groupSettingUpdate(chatId,'not_announcement'); await sock.sendMessage(chatId,{text:'🔊 Group unmuted.'}); }
    catch(e) { await sock.sendMessage(chatId,{text:'❌ Failed to unmute. Bot must be admin.'}); }
}
module.exports = { muteCommand, unmuteCommand };
