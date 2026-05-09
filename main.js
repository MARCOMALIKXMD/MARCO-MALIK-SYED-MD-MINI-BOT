'use strict';

/**
 * MARCO MALIK & SYED-MD MINI BOT — main.js
 * Full command handler for multi-user public system.
 * Each session gets this same handler — isolated per user.
 */

const fs = require('fs');
const settings = require('./settings');
const config = require('./config');

// ── Command imports ──────────────────────────────────────────────────────────
const pingCommand       = require('./commands/ping');
const aliveCommand      = require('./commands/alive');
const ownerCommand      = require('./commands/owner');
const helpCommand       = require('./commands/help');
const stickerCommand    = require('./commands/sticker');
const { banCommand, unbanCommand } = require('./commands/ban');
const kickCommand       = require('./commands/kick');
const promoteCommand    = require('./commands/promote');
const demoteCommand     = require('./commands/demote');
const { muteCommand, unmuteCommand } = require('./commands/mute');
const { tagAllCommand, tagNotAdminCommand } = require('./commands/tagall');
const { tagCommand, hideTagCommand } = require('./commands/tag');
const jokeCommand       = require('./commands/joke');
const quoteCommand      = require('./commands/quote');
const factCommand       = require('./commands/fact');
const memeCommand       = require('./commands/meme');
const { truthCommand }  = require('./commands/truth');
const { dareCommand }   = require('./commands/dare');
const eightBallCommand  = require('./commands/eightball');
const complimentCommand = require('./commands/compliment');
const insultCommand     = require('./commands/insult');
const flirtCommand      = require('./commands/flirt');
const shipCommand       = require('./commands/ship');
const ttsCommand        = require('./commands/tts');
const { handleTranslateCommand } = require('./commands/translate');
const lyricsCommand     = require('./commands/lyrics');
const { startTrivia, answerTrivia } = require('./commands/trivia');
const { tictactoeCommand, tictactoeMove } = require('./commands/tictactoe');
const { startHangman, guessLetter } = require('./commands/hangman');
const { warnCommand, warningsCommand } = require('./commands/warn');
const groupInfoCommand  = require('./commands/groupinfo');
const resetLinkCommand  = require('./commands/resetlink');
const { handleAntilinkCommand } = require('./commands/antilink');
const { handleAntitagCommand }  = require('./commands/antitag');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');
const { sudoCommand, unsudoCommand } = require('./commands/sudo');
const settingsCommand   = require('./commands/settings');
const githubCommand     = require('./commands/github');
const newsCommand       = require('./commands/news');
const staffCommand      = require('./commands/staff');
const simpCommand       = require('./commands/simp');
const stupidCommand     = require('./commands/stupid');
const setppCommand      = require('./commands/setpp');
const simageCommand     = require('./commands/simage');
const attpCommand       = require('./commands/attp');
const takeCommand       = require('./commands/take');
const blurCommand       = require('./commands/img_blur');
const removebgCommand   = require('./commands/removebg');
const imagineCommand    = require('./commands/imagine');
const playCommand       = require('./commands/play');
const songCommand       = require('./commands/song');
const tiktokCommand     = require('./commands/tiktok');
const instagramCommand  = require('./commands/instagram');
const facebookCommand   = require('./commands/facebook');
const aiCommand         = require('./commands/ai');
const { miscCommand, animeCommand, piesCommand } = require('./commands/misc');
const shayariCommand    = require('./commands/shayari');
const emojimixCommand   = require('./commands/emojimix');
const gifCommand        = require('./commands/gif');
const ssCommand         = require('./commands/ss');
const igsCommand        = require('./commands/igs');
const cleartmpCommand   = require('./commands/cleartmp');

// ── Lib imports ──────────────────────────────────────────────────────────────
const isAdminFn            = require('./lib/isAdmin');
const { isBanned }         = require('./lib/isBanned');
const isOwnerOrSudo        = require('./lib/isOwner');
const { isSudo }           = require('./lib/index');
const { handleBadwordDetection, handleAntiBadwordCommand } = require('./lib/antibadword');
const { Antilink }         = require('./lib/antilink');
const { handleJoinEvent, handleLeaveEvent, handlePromotionEvent, handleDemotionEvent, welcomeCommand, goodbyeCommand } = require('./lib/welcome');
const { addCommandReaction } = require('./lib/reactions');
const { cleanupTempFiles }  = require('./lib/tempCleanup');

// ── Helpers ──────────────────────────────────────────────────────────────────

function readJson(file, def = {}) {
    try { const f = require('path').join(process.cwd(), 'data', file); if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f)); } catch (e) {}
    return def;
}

async function tryReact(sock, message) {
    try {
        const data = readJson('autoReact.json', { enabled: false });
        if (!data.enabled) return;
        const emojis = ['✅', '⚡', '🔥', '💫', '✨', '🌟'];
        await sock.sendMessage(message.key.remoteJid, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: message.key } });
    } catch (e) {}
}

async function tryTyping(sock, chatId) {
    try {
        const data = readJson('autotyping.json', { enabled: false });
        if (!data.enabled) return;
        await sock.sendPresenceUpdate('composing', chatId);
        setTimeout(() => sock.sendPresenceUpdate('paused', chatId).catch(() => {}), 2000);
    } catch (e) {}
}

// ── Main message handler ─────────────────────────────────────────────────────

async function handleMessages(sock, chatUpdate, isBaileys, sessionId) {
    try {
        const message = chatUpdate.messages?.[0];
        if (!message?.message) return;

        const chatId   = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup  = chatId.endsWith('@g.us');
        const fromMe   = message.key.fromMe;

        const rawText = message.message?.conversation
            || message.message?.extendedTextMessage?.text
            || message.message?.imageMessage?.caption
            || message.message?.videoMessage?.caption || '';
        const userMessage = rawText.trim().toLowerCase();

        // Auto-read
        try { if (readJson('autoread.json', { enabled:false }).enabled) await sock.readMessages([message.key]); } catch (e) {}

        // Status auto-view
        if (chatId === 'status@broadcast') {
            try { if (readJson('autoStatus.json', {enabled:false}).enabled) await sock.readMessages([message.key]); } catch(e){} return;
        }

        // Banned check
        if (!fromMe && isBanned(senderId)) return;

        // PM Blocker
        if (!isGroup && !fromMe) {
            try {
                const pmData = readJson('pmblocker.json', { enabled:false, message:'Please do not DM the bot.' });
                if (pmData.enabled) { await sock.sendMessage(chatId, { text: pmData.message }); return; }
            } catch (e) {}
        }

        // Private mode
        try {
            const modeData = readJson('messageCount.json', { isPublic:true });
            if (!modeData.isPublic && !fromMe) {
                if (!(await isOwnerOrSudo(senderId, sock))) return;
            }
        } catch (e) {}

        // Admin status
        let isSenderAdmin = false, isBotAdmin = false;
        if (isGroup) {
            try {
                const { isSenderAdmin: sa, isBotAdmin: ba } = await isAdminFn(sock, chatId, senderId);
                isSenderAdmin = sa; isBotAdmin = ba;
            } catch (e) {}
        }

        const senderIsOwner = fromMe || await isOwnerOrSudo(senderId, sock);
        const senderIsSudoUser = senderIsOwner || await isSudo(senderId);

        // ── Group protections (all messages) ──────────────────────────────────
        if (isGroup && !fromMe) {
            // Antilink
            await Antilink(message, sock).catch(() => {});
            // Antibadword
            if (rawText) await handleBadwordDetection(sock, chatId, message, rawText, senderId).catch(() => {});
            // Antitag
            try {
                const { getAntitag } = require('./lib/index');
                const atCfg = await getAntitag(chatId);
                if (atCfg?.enabled) {
                    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    if (mentioned.length >= 5 && !isSenderAdmin) {
                        await sock.sendMessage(chatId, { delete: message.key });
                        await sock.sendMessage(chatId, { text: `❌ @${senderId.split('@')[0]} mass-tagging is not allowed!`, mentions:[senderId] });
                    }
                }
            } catch (e) {}
        }

        // Non-command
        if (!userMessage.startsWith('.')) {
            if (isGroup) await handleChatbotResponse(sock, chatId, message, rawText).catch(() => {});
            return;
        }

        // Auto-typing indicator
        await tryTyping(sock, chatId);

        let commandRan = true;

        try {
            switch (true) {

                // ── Info ──────────────────────────────────────────────────────
                case userMessage === '.ping':
                    await pingCommand(sock, chatId, message); break;

                case ['.alive','.bot','.status'].includes(userMessage):
                    await aliveCommand(sock, chatId, message); break;

                case userMessage === '.owner':
                    await ownerCommand(sock, chatId); break;

                case ['.help','.menu','.list','.commands'].includes(userMessage):
                    await helpCommand(sock, chatId, message); break;

                case userMessage === '.settings':
                    await settingsCommand(sock, chatId, message); break;

                case ['.github','.git','.sc','.repo','.script'].includes(userMessage):
                    await githubCommand(sock, chatId, message); break;

                case userMessage === '.staff':
                    await staffCommand(sock, chatId, message); break;

                case userMessage === '.news':
                    await newsCommand(sock, chatId); break;

                // ── Sticker & Image ───────────────────────────────────────────
                case ['.sticker','.s'].includes(userMessage):
                    await stickerCommand(sock, chatId, message); break;

                case userMessage === '.crop':
                    await stickerCommand(sock, chatId, message); break;

                case userMessage === '.simage': {
                    const qm = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    await simageCommand(sock, qm, chatId); break;
                }

                case userMessage.startsWith('.attp'):
                    await attpCommand(sock, chatId, message); break;

                case userMessage.startsWith('.take') || userMessage.startsWith('.steal'): {
                    const args = rawText.slice(userMessage.startsWith('.steal')?6:5).trim().split(' ');
                    await takeCommand(sock, chatId, message, args); break;
                }

                case userMessage.startsWith('.blur'): {
                    const qm = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    await blurCommand(sock, chatId, message, qm); break;
                }

                case ['.removebg','.rmbg','.nobg'].some(p => userMessage.startsWith(p)):
                    await removebgCommand.exec(sock, message); break;

                case userMessage.startsWith('.imagine'):
                    await imagineCommand(sock, chatId, message); break;

                case userMessage.startsWith('.sora'): {
                    const prompt = rawText.slice(5).trim();
                    if (!prompt) { await sock.sendMessage(chatId,{text:'❌ Provide a prompt. Example: .sora a cat in space'},{quoted:message}); break; }
                    await sock.sendMessage(chatId,{react:{text:'🎬',key:message.key}});
                    await sock.sendMessage(chatId,{image:{url:`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=512&height=512&nologo=true`},caption:`🎬 *SORA AI*\n\n${prompt}`},{quoted:message}); break;
                }

                case ['.metallic','.ice','.snow','.neon','.fire','.glitch','.matrix'].some(p => userMessage.startsWith(p)): {
                    const type = userMessage.trim().split(/\s+/)[0].slice(1);
                    const text = rawText.slice(type.length+2).trim();
                    if (!text) { await sock.sendMessage(chatId,{text:`❌ Provide text. Example: .${type} YourName`},{quoted:message}); break; }
                    try {
                        const effectUrl = `https://nekobot.xyz/api/text?type=${type}&text=${encodeURIComponent(text)}`;
                        const r = await require('axios').get(effectUrl, { timeout:12000 });
                        const imgUrl = r.data?.message || r.data?.url || r.data?.image;
                        if (imgUrl) await sock.sendMessage(chatId,{image:{url:imgUrl},caption:`✅ *${type}* effect`},{quoted:message});
                        else throw new Error('no img');
                    } catch { await sock.sendMessage(chatId,{text:`❌ Failed to generate *${type}* effect. Try again later.`},{quoted:message}); }
                    break;
                }

                case userMessage.startsWith('.ss'):
                    await ssCommand(sock, chatId, message); break;

                // ── Group management ──────────────────────────────────────────
                case userMessage.startsWith('.kick'): {
                    if (!isGroup) { await sock.sendMessage(chatId,{text:'Groups only.'}); break; }
                    if (!isBotAdmin) { await sock.sendMessage(chatId,{text:'Bot must be admin.'}); break; }
                    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await kickCommand(sock, chatId, senderId, mentions, message); break;
                }

                case userMessage.startsWith('.promote'): {
                    if (!isGroup||!isBotAdmin) { await sock.sendMessage(chatId,{text:isGroup?'Bot must be admin.':'Groups only.'}); break; }
                    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await promoteCommand(sock, chatId, mentions, message); break;
                }

                case userMessage.startsWith('.demote'): {
                    if (!isGroup||!isBotAdmin) { await sock.sendMessage(chatId,{text:isGroup?'Bot must be admin.':'Groups only.'}); break; }
                    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await demoteCommand(sock, chatId, mentions, message); break;
                }

                case userMessage.startsWith('.mute'): {
                    if (!isGroup||!isBotAdmin) break;
                    const mins = parseInt(rawText.split(' ')[1]);
                    await muteCommand(sock, chatId, senderId, message, isNaN(mins)?undefined:mins); break;
                }

                case userMessage === '.unmute':
                    if (!isGroup||!isBotAdmin) break;
                    await unmuteCommand(sock, chatId); break;

                case userMessage === '.tagall':
                    if (!isGroup) break;
                    await tagAllCommand(sock, chatId, senderId, message); break;

                case userMessage === '.tagnotadmin':
                    if (!isGroup) break;
                    await tagNotAdminCommand(sock, chatId, senderId, message); break;

                case userMessage.startsWith('.hidetag'): {
                    const txt = rawText.slice(8).trim();
                    await hideTagCommand(sock, chatId, senderId, txt, null, message); break;
                }

                case userMessage.startsWith('.tag '): {
                    const txt = rawText.slice(4).trim();
                    await tagCommand(sock, chatId, senderId, txt, null, message); break;
                }

                case userMessage === '.groupinfo' || userMessage === '.infogp':
                    if (!isGroup) { await sock.sendMessage(chatId,{text:'Groups only.'}); break; }
                    await groupInfoCommand(sock, chatId, message); break;

                case userMessage === '.resetlink' || userMessage === '.revoke':
                    if (!isGroup||!isBotAdmin) break;
                    await resetLinkCommand(sock, chatId, message); break;

                case userMessage === '.open':
                    if (!isGroup||!isBotAdmin) break;
                    await sock.groupSettingUpdate(chatId,'not_announcement');
                    await sock.sendMessage(chatId,{text:'🔓 Group is now *open*.'}); break;

                case userMessage === '.close':
                    if (!isGroup||!isBotAdmin) break;
                    await sock.groupSettingUpdate(chatId,'announcement');
                    await sock.sendMessage(chatId,{text:'🔒 Group is now *closed*.'}); break;

                case userMessage.startsWith('.setpp'):
                    await setppCommand(sock, chatId, message); break;

                // ── Ban system ────────────────────────────────────────────────
                case userMessage.startsWith('.ban'):
                    await banCommand(sock, chatId, message); break;

                case userMessage.startsWith('.unban'):
                    await unbanCommand(sock, chatId, message); break;

                // ── Warnings ──────────────────────────────────────────────────
                case userMessage.startsWith('.warnings'): {
                    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await warningsCommand(sock, chatId, mentions); break;
                }

                case userMessage.startsWith('.warn'): {
                    if (!isGroup) break;
                    const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                    await warnCommand(sock, chatId, senderId, mentions, message); break;
                }

                // ── Delete ────────────────────────────────────────────────────
                case userMessage.startsWith('.delete') || userMessage.startsWith('.del'): {
                    const q = message.message?.extendedTextMessage?.contextInfo;
                    if (!q) { await sock.sendMessage(chatId,{text:'❌ Reply to a message to delete it.'},{quoted:message}); break; }
                    const botId = sock.user.id.split(':')[0]+'@s.whatsapp.net';
                    await sock.sendMessage(chatId,{delete:{remoteJid:chatId,id:q.stanzaId,participant:q.participant,fromMe:q.participant===botId}}); break;
                }

                // ── Protection ────────────────────────────────────────────────
                case userMessage.startsWith('.antilink'):
                    if (!isGroup) { await sock.sendMessage(chatId,{text:'Groups only.'}); break; }
                    await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message); break;

                case userMessage.startsWith('.antitag'):
                    if (!isGroup) { await sock.sendMessage(chatId,{text:'Groups only.'}); break; }
                    await handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message); break;

                case userMessage.startsWith('.antibadword'): {
                    if (!isGroup) { await sock.sendMessage(chatId,{text:'Groups only.'}); break; }
                    const args = rawText.slice(12).trim();
                    await handleAntiBadwordCommand(sock, chatId, message, args); break;
                }

                case userMessage.startsWith('.antidelete'): {
                    const arg = rawText.slice(11).trim().toLowerCase();
                    const adFile = require('path').join(process.cwd(),'data','antidelete.json');
                    let adData = { enabled:false }; try { adData = JSON.parse(fs.readFileSync(adFile)); } catch(e){}
                    if (arg==='on') { adData.enabled=true; fs.writeFileSync(adFile,JSON.stringify(adData,null,2)); await sock.sendMessage(chatId,{text:'✅ Antidelete enabled.'},{quoted:message}); }
                    else if (arg==='off') { adData.enabled=false; fs.writeFileSync(adFile,JSON.stringify(adData,null,2)); await sock.sendMessage(chatId,{text:'❌ Antidelete disabled.'},{quoted:message}); }
                    else await sock.sendMessage(chatId,{text:`Antidelete: *${adData.enabled?'on':'off'}*\n.antidelete on/off`},{quoted:message});
                    break;
                }

                case userMessage.startsWith('.anticall'): {
                    const arg = rawText.slice(9).trim().toLowerCase();
                    const acFile = require('path').join(process.cwd(),'data','anticall.json');
                    let acData = { enabled:false }; try { acData = JSON.parse(fs.readFileSync(acFile)); } catch(e){}
                    if (!senderIsOwner) { await sock.sendMessage(chatId,{text:'Only owner can use anticall.'}); break; }
                    if (arg==='on') { acData.enabled=true; fs.writeFileSync(acFile,JSON.stringify(acData,null,2)); await sock.sendMessage(chatId,{text:'✅ Anticall enabled.'},{quoted:message}); }
                    else if (arg==='off') { acData.enabled=false; fs.writeFileSync(acFile,JSON.stringify(acData,null,2)); await sock.sendMessage(chatId,{text:'❌ Anticall disabled.'},{quoted:message}); }
                    else await sock.sendMessage(chatId,{text:`Anticall: *${acData.enabled?'on':'off'}*\n.anticall on/off`},{quoted:message});
                    break;
                }

                // ── Auto-features ─────────────────────────────────────────────
                case userMessage.startsWith('.chatbot'):
                    if (!isGroup) { await sock.sendMessage(chatId,{text:'Groups only.'}); break; }
                    if (!isSenderAdmin&&!fromMe) { await sock.sendMessage(chatId,{text:'Admins only.'}); break; }
                    await handleChatbotCommand(sock, chatId, message, rawText.slice(8).trim()); break;

                case userMessage.startsWith('.autostatus'): {
                    const a = rawText.slice(11).trim().toLowerCase();
                    const f = require('path').join(process.cwd(),'data','autoStatus.json');
                    let d={enabled:false}; try{d=JSON.parse(fs.readFileSync(f));}catch(e){}
                    if(a==='on'){d.enabled=true;fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:'✅ Auto-status view enabled.'},{quoted:message});}
                    else if(a==='off'){d.enabled=false;fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:'❌ Auto-status disabled.'},{quoted:message});}
                    else await sock.sendMessage(chatId,{text:`Auto-status: *${d.enabled?'on':'off'}*\n.autostatus on/off`},{quoted:message});
                    break;
                }

                case userMessage.startsWith('.autoread'): {
                    const a = rawText.slice(9).trim().toLowerCase();
                    const f = require('path').join(process.cwd(),'data','autoread.json');
                    let d={enabled:false}; try{d=JSON.parse(fs.readFileSync(f));}catch(e){}
                    if(a==='on'){d.enabled=true;fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:'✅ Auto-read enabled.'},{quoted:message});}
                    else if(a==='off'){d.enabled=false;fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:'❌ Auto-read disabled.'},{quoted:message});}
                    else await sock.sendMessage(chatId,{text:`Auto-read: *${d.enabled?'on':'off'}*\n.autoread on/off`},{quoted:message});
                    break;
                }

                case userMessage.startsWith('.autotyping'): {
                    const a = rawText.slice(11).trim().toLowerCase();
                    const f = require('path').join(process.cwd(),'data','autotyping.json');
                    let d={enabled:false}; try{d=JSON.parse(fs.readFileSync(f));}catch(e){}
                    if(a==='on'){d.enabled=true;fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:'✅ Auto-typing enabled.'},{quoted:message});}
                    else if(a==='off'){d.enabled=false;fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:'❌ Auto-typing disabled.'},{quoted:message});}
                    else await sock.sendMessage(chatId,{text:`Auto-typing: *${d.enabled?'on':'off'}*\n.autotyping on/off`},{quoted:message});
                    break;
                }

                case userMessage.startsWith('.areact'): {
                    const a = rawText.slice(7).trim().toLowerCase();
                    const f = require('path').join(process.cwd(),'data','autoReact.json');
                    let d={enabled:false}; try{d=JSON.parse(fs.readFileSync(f));}catch(e){}
                    if(a==='on'){d.enabled=true;fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:'✅ Auto-react enabled.'},{quoted:message});}
                    else if(a==='off'){d.enabled=false;fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:'❌ Auto-react disabled.'},{quoted:message});}
                    else await sock.sendMessage(chatId,{text:`Auto-react: *${d.enabled?'on':'off'}*\n.areact on/off`},{quoted:message});
                    break;
                }

                case userMessage.startsWith('.pmblocker'): {
                    const a = rawText.slice(10).trim();
                    const f = require('path').join(process.cwd(),'data','pmblocker.json');
                    let d={enabled:false,message:'Please do not DM the bot.'}; try{d=JSON.parse(fs.readFileSync(f));}catch(e){}
                    const al = a.toLowerCase();
                    if(al==='on'){d.enabled=true;fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:'✅ PM Blocker enabled.'},{quoted:message});}
                    else if(al==='off'){d.enabled=false;fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:'❌ PM Blocker disabled.'},{quoted:message});}
                    else if(al.startsWith('msg ')){d.message=a.slice(4);fs.writeFileSync(f,JSON.stringify(d,null,2));await sock.sendMessage(chatId,{text:`✅ PM message set.`},{quoted:message});}
                    else await sock.sendMessage(chatId,{text:`PM Blocker: *${d.enabled?'on':'off'}*\n.pmblocker on/off\n.pmblocker msg <text>`},{quoted:message});
                    break;
                }

                // ── Welcome / Goodbye ─────────────────────────────────────────
                case userMessage.startsWith('.welcome'):
                    if (!isGroup) { await sock.sendMessage(chatId,{text:'Groups only.'}); break; }
                    if (!isSenderAdmin&&!fromMe) { await sock.sendMessage(chatId,{text:'Admins only.'}); break; }
                    await welcomeCommand(sock, chatId, message); break;

                case userMessage.startsWith('.goodbye'):
                    if (!isGroup) { await sock.sendMessage(chatId,{text:'Groups only.'}); break; }
                    if (!isSenderAdmin&&!fromMe) { await sock.sendMessage(chatId,{text:'Admins only.'}); break; }
                    await goodbyeCommand(sock, chatId, message); break;

                // ── Sudo / Owner ──────────────────────────────────────────────
                case userMessage.startsWith('.sudo'):
                    if (!fromMe) { await sock.sendMessage(chatId,{text:'Only owner can add sudo.'}); break; }
                    await sudoCommand(sock, chatId, message); break;

                case userMessage.startsWith('.unsudo'):
                    if (!fromMe) { await sock.sendMessage(chatId,{text:'Only owner can remove sudo.'}); break; }
                    await unsudoCommand(sock, chatId, message); break;

                case userMessage.startsWith('.mode'): {
                    if (!senderIsOwner) { await sock.sendMessage(chatId,{text:'Owner only command.'}); break; }
                    const a = rawText.split(' ')[1]?.toLowerCase();
                    const f = require('path').join(process.cwd(),'data','messageCount.json');
                    let d={isPublic:true,messageCount:{}}; try{d=JSON.parse(fs.readFileSync(f));}catch(e){}
                    if(!a) { await sock.sendMessage(chatId,{text:`Mode: *${d.isPublic?'public':'private'}*\n.mode public / .mode private`},{quoted:message}); break; }
                    d.isPublic = a==='public';
                    fs.writeFileSync(f,JSON.stringify(d,null,2));
                    await sock.sendMessage(chatId,{text:`✅ Bot is now in *${a}* mode`}); break;
                }

                // ── Fun & Games ───────────────────────────────────────────────
                case userMessage === '.joke':    await jokeCommand(sock, chatId, message); break;
                case userMessage === '.quote':   await quoteCommand(sock, chatId, message); break;
                case userMessage === '.fact':    await factCommand(sock, chatId, message); break;
                case userMessage === '.meme':    await memeCommand(sock, chatId, message); break;
                case userMessage === '.truth':   await truthCommand(sock, chatId, message); break;
                case userMessage === '.dare':    await dareCommand(sock, chatId, message); break;
                case userMessage === '.flirt':   await flirtCommand(sock, chatId, message); break;
                case userMessage === '.shayari': await shayariCommand(sock, chatId, message); break;

                case userMessage.startsWith('.8ball'): {
                    const q = rawText.split(' ').slice(1).join(' ');
                    await eightBallCommand(sock, chatId, q); break;
                }

                case userMessage.startsWith('.compliment'): await complimentCommand(sock, chatId, message); break;
                case userMessage.startsWith('.insult'):     await insultCommand(sock, chatId, message); break;
                case userMessage === '.ship':               await shipCommand(sock, chatId, message); break;

                case userMessage.startsWith('.simp'): {
                    const m = message.message?.extendedTextMessage?.contextInfo?.mentionedJid||[];
                    await simpCommand(sock, chatId, null, m, senderId); break;
                }

                case userMessage.startsWith('.stupid'): {
                    const m = message.message?.extendedTextMessage?.contextInfo?.mentionedJid||[];
                    await stupidCommand(sock, chatId, null, m, senderId); break;
                }

                case userMessage.startsWith('.roseday'):
                case userMessage.startsWith('.goodnight'):
                case userMessage === '.gn': {
                    const m = message.message?.extendedTextMessage?.contextInfo?.mentionedJid||[];
                    const target = m[0];
                    const msgs = { roseday:'🌹 Happy Rose Day! May love bloom in your life.', goodnight:'🌙 Good night! Sweet dreams 💤⭐', gn:'🌙 Good night! Sweet dreams 💤⭐' };
                    const key = userMessage.startsWith('.roseday')?'roseday':userMessage.startsWith('.goodnight')?'goodnight':'gn';
                    const txt = target ? `@${target.split('@')[0]} — ${msgs[key]}` : msgs[key];
                    await sock.sendMessage(chatId, { text: txt, mentions: target?[target]:[] }, { quoted: message }); break;
                }

                // ── Trivia ────────────────────────────────────────────────────
                case userMessage.startsWith('.trivia'):
                    await startTrivia(sock, chatId); break;

                case userMessage.startsWith('.answer'): {
                    const a = rawText.split(' ').slice(1).join(' ');
                    if (!a) { await sock.sendMessage(chatId,{text:'Usage: .answer <answer>'}); break; }
                    answerTrivia(sock, chatId, a); break;
                }

                // ── TicTacToe ─────────────────────────────────────────────────
                case userMessage.startsWith('.ttt') || userMessage.startsWith('.tictactoe'): {
                    const t = rawText.split(' ').slice(1).join(' ');
                    await tictactoeCommand(sock, chatId, senderId, t); break;
                }

                case userMessage.startsWith('.move'): {
                    const pos = parseInt(rawText.split(' ')[1]);
                    if (isNaN(pos)) { await sock.sendMessage(chatId,{text:'Provide position 1-9.'}); break; }
                    tictactoeMove(sock, chatId, senderId, pos); break;
                }

                // ── Hangman ───────────────────────────────────────────────────
                case userMessage.startsWith('.hangman'):
                    startHangman(sock, chatId); break;

                case userMessage.startsWith('.guess'): {
                    const letter = rawText.split(' ')[1];
                    if (!letter) { await sock.sendMessage(chatId,{text:'Usage: .guess <letter>'}); break; }
                    guessLetter(sock, chatId, letter); break;
                }

                // ── TTS & Translate ───────────────────────────────────────────
                case userMessage.startsWith('.tts'): {
                    const t = rawText.slice(4).trim();
                    await ttsCommand(sock, chatId, t, message); break;
                }

                case userMessage.startsWith('.translate') || userMessage.startsWith('.trt'): {
                    const sl = userMessage.startsWith('.translate') ? 10 : 4;
                    await handleTranslateCommand(sock, chatId, message, rawText.slice(sl).trim()); break;
                }

                case userMessage.startsWith('.lyrics'):
                    await lyricsCommand(sock, chatId, rawText.slice(7).trim(), message); break;

                // ── Media ─────────────────────────────────────────────────────
                case userMessage.startsWith('.play'):   await playCommand(sock, chatId, message); break;
                case userMessage.startsWith('.song'):   await songCommand(sock, chatId, message); break;

                case userMessage.startsWith('.spotify'): {
                    const q = rawText.slice(8).trim();
                    if (!q) { await sock.sendMessage(chatId,{text:'❌ Provide a song name.'}); break; }
                    const yts = require('yt-search');
                    const r = await yts(q); const v = r.videos[0];
                    if (!v) { await sock.sendMessage(chatId,{text:'❌ No results.'}); break; }
                    await sock.sendMessage(chatId,{text:`🎵 *Spotify Search*\n\n*Title:* ${v.title}\n*Artist:* ${v.author.name}\n*Duration:* ${v.timestamp}\n🔗 ${v.url}`},{quoted:message}); break;
                }

                case userMessage.startsWith('.tiktok'):   await tiktokCommand(sock, chatId, message); break;
                case userMessage.startsWith('.instagram') || userMessage.startsWith('.ig'): await instagramCommand(sock, chatId, message); break;
                case userMessage.startsWith('.facebook')  || userMessage.startsWith('.fb'): await facebookCommand(sock, chatId, message); break;
                case userMessage.startsWith('.gif'):      await gifCommand(sock, chatId, message); break;
                case userMessage.startsWith('.igs'):      await igsCommand(sock, chatId, message); break;
                case userMessage.startsWith('.emojimix'): await emojimixCommand(sock, chatId, message); break;

                // ── AI ────────────────────────────────────────────────────────
                case userMessage.startsWith('.ai') || userMessage.startsWith('.gpt'):
                    await aiCommand(sock, chatId, message); break;

                // ── Anime / Fun images ────────────────────────────────────────
                case ['.nom','.poke','.cry','.kiss','.pat','.hug','.wink'].some(p => userMessage === p || userMessage.startsWith(p+' ')): {
                    let sub = userMessage.trim().split(/\s+/)[0].slice(1);
                    await animeCommand(sock, chatId, message, [sub]); break;
                }

                case userMessage.startsWith('.pies'): {
                    const parts = rawText.trim().split(/\s+/);
                    await piesCommand(sock, chatId, message, parts.slice(1)); break;
                }

                case ['.china','.india','.japan','.korea','.malaysia','.indonesia','.thailand','.usa','.pakistan','.uk'].includes(userMessage):
                    await piesCommand(sock, chatId, message, [userMessage.slice(1)]); break;

                case userMessage.startsWith('.wasted'):
                    await miscCommand(sock, chatId, message, ['wasted']); break;

                case ['.glass','.jail','.passed','.triggered'].some(p => userMessage.startsWith(p)): {
                    const sub = userMessage.trim().split(/\s+/)[0].slice(1);
                    await miscCommand(sock, chatId, message, [sub]); break;
                }

                // ── Utility ───────────────────────────────────────────────────
                case userMessage === '.cleartmp':
                    await cleartmpCommand(sock, chatId, message); break;

                // ── Default ───────────────────────────────────────────────────
                default:
                    commandRan = false;
                    if (isGroup) await handleChatbotResponse(sock, chatId, message, rawText).catch(()=>{});
                    break;
            }
        } catch (cmdErr) {
            console.error(`[Session:${sessionId}] Command error:`, cmdErr.message);
            try { await sock.sendMessage(chatId, { text: '❌ Error processing command. Please try again.' }); } catch (e) {}
        }

        // React if command ran
        if (commandRan) await tryReact(sock, message).catch(()=>{});

    } catch (err) {
        console.error(`[Session:${sessionId}] Handler error:`, err.message);
    }
}

// ── Group participant events ──────────────────────────────────────────────────
async function handleGroupParticipantUpdate(sock, update, sessionId) {
    try {
        const { id, participants, action } = update;
        if (!id.endsWith('@g.us')) return;
        if (action === 'add')     await handleJoinEvent(sock, id, participants);
        if (action === 'remove')  await handleLeaveEvent(sock, id, participants);
        if (action === 'promote') await handlePromotionEvent(sock, id, participants);
        if (action === 'demote')  await handleDemotionEvent(sock, id, participants);
    } catch (e) {
        console.error(`[Session:${sessionId}] Group update error:`, e.message);
    }
}

module.exports = { handleMessages, handleGroupParticipantUpdate };
