const fs   = require('fs');
const path = require('path');
const FILE = path.join(process.cwd(), 'data', 'userGroupData.json');

function load() {
    try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE)); } catch (e) {}
    return { sudo:[], antilink:{}, antibadword:{}, warnings:{}, welcome:{}, goodbye:{}, chatbot:{}, antitag:{} };
}
function save(d) { try { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); } catch (e) {} }

// Sudo
async function isSudo(jid) {
    const clean = jid.split('@')[0].split(':')[0];
    return load().sudo?.some(s => s.split('@')[0].split(':')[0] === clean) || false;
}
async function addSudo(jid)    { const d=load(); if(!d.sudo) d.sudo=[]; if(!d.sudo.includes(jid)) d.sudo.push(jid); save(d); }
async function removeSudo(jid) { const d=load(); d.sudo=(d.sudo||[]).filter(s=>s!==jid); save(d); }

// Antilink
async function setAntilink(g, status, action='delete') { const d=load(); if(!d.antilink)d.antilink={}; d.antilink[g]={enabled:status==='on',action}; save(d); }
async function getAntilink(g)  { return load().antilink?.[g]||null; }
async function removeAntilink(g){ const d=load(); if(d.antilink)delete d.antilink[g]; save(d); }

// Anti-badword
async function setAntiBadword(g, status, action='delete') { const d=load(); if(!d.antibadword)d.antibadword={}; d.antibadword[g]={enabled:status==='on',action}; save(d); }
async function getAntiBadword(g) { return load().antibadword?.[g]||null; }
async function removeAntiBadword(g){ const d=load(); if(d.antibadword)delete d.antibadword[g]; save(d); }

// Warnings
async function incrementWarningCount(g, u) { const d=load(); if(!d.warnings)d.warnings={}; if(!d.warnings[g])d.warnings[g]={}; d.warnings[g][u]=(d.warnings[g][u]||0)+1; save(d); return d.warnings[g][u]; }
async function resetWarningCount(g, u) { const d=load(); if(d.warnings?.[g])delete d.warnings[g][u]; save(d); }
async function getWarningCount(g, u) { return load().warnings?.[g]?.[u]||0; }

// Welcome
async function addWelcome(g, msg)  { const d=load(); if(!d.welcome)d.welcome={}; d.welcome[g]={enabled:true,message:msg||'Welcome!'}; save(d); }
async function delWelcome(g)       { const d=load(); if(d.welcome)delete d.welcome[g]; save(d); }
async function isWelcomeOn(g)      { return load().welcome?.[g]?.enabled||false; }
async function getWelcomeMessage(g){ return load().welcome?.[g]?.message||'Welcome!'; }

// Goodbye
async function addGoodbye(g, msg) { const d=load(); if(!d.goodbye)d.goodbye={}; d.goodbye[g]={enabled:true,message:msg||'Goodbye!'}; save(d); }
async function delGoodBye(g)      { const d=load(); if(d.goodbye)delete d.goodbye[g]; save(d); }
async function isGoodByeOn(g)     { return load().goodbye?.[g]?.enabled||false; }
async function getGoodbyeMessage(g){ return load().goodbye?.[g]?.message||'Goodbye!'; }

// Chatbot
async function setChatbot(g, enabled){ const d=load(); if(!d.chatbot)d.chatbot={}; d.chatbot[g]={enabled}; save(d); }
async function getChatbot(g)         { return load().chatbot?.[g]||null; }

// Antitag
async function setAntitag(g, enabled){ const d=load(); if(!d.antitag)d.antitag={}; d.antitag[g]={enabled}; save(d); }
async function getAntitag(g)         { return load().antitag?.[g]||null; }

module.exports = {
    isSudo, addSudo, removeSudo,
    setAntilink, getAntilink, removeAntilink,
    setAntiBadword, getAntiBadword, removeAntiBadword,
    incrementWarningCount, resetWarningCount, getWarningCount,
    addWelcome, delWelcome, isWelcomeOn, getWelcomeMessage,
    addGoodbye, delGoodBye, isGoodByeOn, getGoodbyeMessage,
    setChatbot, getChatbot, setAntitag, getAntitag,
    load, save
};
