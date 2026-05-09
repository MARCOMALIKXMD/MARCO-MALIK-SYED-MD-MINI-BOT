const fs   = require('fs');
const path = require('path');

function getBadwords() {
    try {
        const f = path.join(process.cwd(), 'data', 'badwords.json');
        if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f));
    } catch (e) {}
    return [];
}

function hasBadword(text) {
    const lower = text.toLowerCase();
    return getBadwords().some(w => lower.includes(w.toLowerCase()));
}

async function handleBadwordDetection(sock, chatId, message, text, senderId) {
    try {
        const { getAntiBadword } = require('./index');
        const cfg = await getAntiBadword(chatId);
        if (!cfg?.enabled) return;
        if (!hasBadword(text)) return;

        const isAdmin = require('./isAdmin');
        const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
        if (isSenderAdmin || message.key.fromMe) return;

        if (cfg.action === 'kick') {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
        } else if (cfg.action === 'warn') {
            const { incrementWarningCount } = require('./index');
            await incrementWarningCount(chatId, senderId);
        }

        try { await sock.sendMessage(chatId, { delete: message.key }); } catch (e) {}
        await sock.sendMessage(chatId, {
            text: `⚠️ @${senderId.split('@')[0]} Bad language detected and removed!`,
            mentions: [senderId]
        });
    } catch (e) {}
}

async function handleAntiBadwordCommand(sock, chatId, message, args) {
    const { setAntiBadword, getAntiBadword } = require('./index');
    if (args === 'on') {
        await setAntiBadword(chatId, 'on', 'delete');
        await sock.sendMessage(chatId, { text: '✅ Anti-badword enabled (action: delete).\nUse *.antibadword set kick/warn* to change action.' }, { quoted: message });
    } else if (args === 'off') {
        await setAntiBadword(chatId, 'off');
        await sock.sendMessage(chatId, { text: '❌ Anti-badword disabled.' }, { quoted: message });
    } else if (args.startsWith('set ')) {
        const action = args.split(' ')[1];
        if (!['delete', 'kick', 'warn'].includes(action)) {
            return sock.sendMessage(chatId, { text: '❌ Invalid action. Use: delete, kick, or warn' }, { quoted: message });
        }
        await setAntiBadword(chatId, 'on', action);
        await sock.sendMessage(chatId, { text: `✅ Anti-badword action set to: *${action}*` }, { quoted: message });
    } else if (args.startsWith('add ')) {
        const word = args.slice(4).trim().toLowerCase();
        const f = path.join(process.cwd(), 'data', 'badwords.json');
        const words = getBadwords();
        if (!words.includes(word)) { words.push(word); fs.writeFileSync(f, JSON.stringify(words, null, 2)); }
        await sock.sendMessage(chatId, { text: `✅ "*${word}*" added to bad-word list.` }, { quoted: message });
    } else if (args.startsWith('remove ')) {
        const word = args.slice(7).trim().toLowerCase();
        const f = path.join(process.cwd(), 'data', 'badwords.json');
        const words = getBadwords().filter(w => w !== word);
        fs.writeFileSync(f, JSON.stringify(words, null, 2));
        await sock.sendMessage(chatId, { text: `✅ "*${word}*" removed from bad-word list.` }, { quoted: message });
    } else {
        const cfg = await getAntiBadword(chatId);
        await sock.sendMessage(chatId, {
            text: `*ANTI-BADWORD*\nStatus: *${cfg?.enabled ? 'on' : 'off'}*\nAction: *${cfg?.action || 'none'}*\n\nCommands:\n.antibadword on/off\n.antibadword set delete/kick/warn\n.antibadword add <word>\n.antibadword remove <word>`
        }, { quoted: message });
    }
}

module.exports = { hasBadword, handleBadwordDetection, handleAntiBadwordCommand };
