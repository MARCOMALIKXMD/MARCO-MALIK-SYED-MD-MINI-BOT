const settings = require('../settings');
const { isSudo } = require('./index');

async function isOwnerOrSudo(senderId, sock) {
    const clean = senderId.split('@')[0].split(':')[0];
    if (clean === settings.ownerNumber) return true;
    return await isSudo(senderId);
}

module.exports = isOwnerOrSudo;
