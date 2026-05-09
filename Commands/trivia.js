const axios = require('axios');
const games = {};
async function startTrivia(sock, chatId) {
    if (games[chatId]) return sock.sendMessage(chatId, { text: '❌ A game is already running!' });
    try {
        const r = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const q = r.data.results[0];
        games[chatId] = { question: q.question, correct: q.correct_answer, options: [...q.incorrect_answers, q.correct_answer].sort() };
        await sock.sendMessage(chatId, { text: `🧠 *Trivia!*\n\nQ: ${games[chatId].question}\n\n${games[chatId].options.map((o,i)=>`${i+1}. ${o}`).join('\n')}\n\nUse: .answer <text>` });
    } catch (e) { await sock.sendMessage(chatId, { text: '❌ Failed to get trivia question.' }); }
}
function answerTrivia(sock, chatId, answer) {
    if (!games[chatId]) return sock.sendMessage(chatId, { text: '❌ No trivia game running. Use .trivia to start.' });
    const g = games[chatId];
    const ok = answer.toLowerCase() === g.correct.toLowerCase();
    sock.sendMessage(chatId, { text: ok ? `✅ Correct! Answer: *${g.correct}* 🎉` : `❌ Wrong! Answer was: *${g.correct}*` });
    delete games[chatId];
}
module.exports = { startTrivia, answerTrivia };
