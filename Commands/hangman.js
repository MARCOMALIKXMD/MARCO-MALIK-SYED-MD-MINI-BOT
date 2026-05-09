const words = ['javascript','programming','whatsapp','computer','keyboard','internet','database','algorithm','developer','technology'];
const games = {};
function startHangman(sock, chatId) {
    const word = words[Math.floor(Math.random()*words.length)];
    games[chatId] = { word, guessed:[], attempts:6 };
    sock.sendMessage(chatId, { text: `🎮 *Hangman Started!*\n\nWord: \`${word.split('').map(()=>'_').join(' ')}\`\nAttempts left: 6\n\nUse .guess <letter>` });
}
function guessLetter(sock, chatId, letter) {
    if (!games[chatId]) return sock.sendMessage(chatId, { text: '❌ No game running. Use .hangman to start.' });
    const g = games[chatId]; letter = letter.toLowerCase();
    if (g.guessed.includes(letter)) return sock.sendMessage(chatId, { text: `❌ Already guessed "${letter}"!` });
    g.guessed.push(letter);
    const correct = g.word.includes(letter);
    if (!correct) g.attempts--;
    const display = g.word.split('').map(c => g.guessed.includes(c)?c:'_').join(' ');
    const won = !display.includes('_');
    if (won) { sock.sendMessage(chatId, { text: `🎉 *You won!* Word: *${g.word}*` }); delete games[chatId]; }
    else if (!g.attempts) { sock.sendMessage(chatId, { text: `💀 *Game over!* Word: *${g.word}*` }); delete games[chatId]; }
    else sock.sendMessage(chatId, { text: `${correct?'✅':'❌'} "${letter}" ${correct?'correct!':'wrong!'}\n\nWord: \`${display}\`\nAttempts: ${g.attempts}\nGuessed: ${g.guessed.join(', ')}` });
}
module.exports = { startHangman, guessLetter };
