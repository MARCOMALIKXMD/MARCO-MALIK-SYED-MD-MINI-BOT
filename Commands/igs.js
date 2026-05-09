const axios = require('axios');
async function igsCommand(sock, chatId, message) {
    try {
        const username = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(' ').slice(1).join(' ').trim().replace('@','');
        if (!username) return sock.sendMessage(chatId, { text: '❌ Provide an Instagram username. Example: .igs instagram' }, { quoted: message });
        const r = await axios.get(`https://api.siputzx.my.id/api/s/instagram?username=${username}`, { timeout:15000 });
        const d = r.data?.data;
        if (!d) throw new Error('No data');
        const text = `📸 *Instagram Profile*\n\n👤 *Name:* ${d.full_name||username}\n🔗 *Username:* @${d.username}\n📝 *Bio:* ${d.biography||'No bio'}\n👥 *Followers:* ${d.edge_followed_by?.count||0}\n➡️ *Following:* ${d.edge_follow?.count||0}\n📷 *Posts:* ${d.edge_owner_to_timeline_media?.count||0}\n✅ *Verified:* ${d.is_verified?'Yes':'No'}`;
        if (d.profile_pic_url_hd||d.profile_pic_url) await sock.sendMessage(chatId, { image:{url:d.profile_pic_url_hd||d.profile_pic_url}, caption:text }, { quoted: message });
        else await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to fetch Instagram profile.' }, { quoted: message }); }
}
module.exports = igsCommand;
