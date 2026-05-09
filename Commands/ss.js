async function ssCommand(sock, chatId, message) {
    try {
        const url = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(' ').slice(1).join(' ').trim();
        if (!url?.startsWith('http')) return sock.sendMessage(chatId, { text: '❌ Provide a URL. Example: .ss https://google.com' }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '📸', key: message.key } });
        const ssUrl = `https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodeURIComponent(url)}&format=jpeg&width=1280&height=720`;
        await sock.sendMessage(chatId, { image:{url:ssUrl}, caption:`📸 Screenshot of: ${url}` }, { quoted: message });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to take screenshot.' }, { quoted: message }); }
}
module.exports = ssCommand;
