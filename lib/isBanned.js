const fs   = require('fs');
const path = require('path');
const FILE = path.join(process.cwd(), 'data', 'banned.json');

function loadBanned() {
    try { if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE)); } catch (e) {}
    return [];
}

function isBanned(jid) {
    return loadBanned().some(b => b.split('@')[0] === jid.split('@')[0].split(':')[0]);
}

module.exports = { isBanned };
