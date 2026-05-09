const TicTacToe = require('../lib/tictactoe');
const games = {};
const MAP = {'X':'❎','O':'⭕','1':'1️⃣','2':'2️⃣','3':'3️⃣','4':'4️⃣','5':'5️⃣','6':'6️⃣','7':'7️⃣','8':'8️⃣','9':'9️⃣'};

async function tictactoeCommand(sock, chatId, senderId, text) {
    const existing = Object.values(games).find(r => [r.game.playerX, r.game.playerO].includes(senderId) && r.state==='PLAYING');
    if (existing) return sock.sendMessage(chatId, { text: '❌ You are still in a game. Type *surrender* to quit.' });
    let room = Object.values(games).find(r => r.state==='WAITING' && (text ? r.name===text : true));
    if (room) {
        room.game.playerO = senderId; room.state = 'PLAYING';
        const arr = room.game.render().map(v => MAP[v]);
        await sock.sendMessage(chatId, { text: `🎮 *TicTacToe Started!*\n\n${arr.slice(0,3).join('')}\n${arr.slice(3,6).join('')}\n${arr.slice(6).join('')}\n\n@${room.game.currentTurn.split('@')[0]}'s turn`, mentions:[room.game.playerX,senderId] });
    } else {
        room = { id:'ttt-'+Date.now(), game: new TicTacToe(senderId,'o'), state:'WAITING', name: text||null };
        games[room.id] = room;
        await sock.sendMessage(chatId, { text: `⏳ *Waiting for opponent*\nType *.ttt ${text||''}* to join!` });
    }
}
function tictactoeMove(sock, chatId, senderId, pos) {
    const room = Object.values(games).find(r => [r.game.playerX, r.game.playerO].includes(senderId) && r.state==='PLAYING');
    if (!room) return;
    if (senderId !== room.game.currentTurn) return sock.sendMessage(chatId, { text: '❌ Not your turn!' });
    if (!room.game.turn(senderId===room.game.playerO, pos-1)) return sock.sendMessage(chatId, { text: '❌ Invalid move!' });
    const arr = room.game.render().map(v => MAP[v]);
    const board = `${arr.slice(0,3).join('')}\n${arr.slice(3,6).join('')}\n${arr.slice(6).join('')}`;
    const winner = room.game.winner, tie = room.game.turns===9;
    const status = winner ? `🎉 @${winner.split('@')[0]} wins!` : tie ? '🤝 Draw!' : `🎲 @${room.game.currentTurn.split('@')[0]}'s turn`;
    sock.sendMessage(chatId, { text: `🎮 *TicTacToe*\n\n${status}\n\n${board}`, mentions:[room.game.playerX,room.game.playerO] });
    if (winner||tie) delete games[room.id];
}
module.exports = { tictactoeCommand, tictactoeMove };
