const list = ['Mohabbat ka ehsaas hai, andhere mein roshan diya,\nTere bina zindagi, jaise bujha hua chirag.','Dil ki baat kaho, aankhon se nahi,\nAnsu bole hain, alfaaz se bhi zyada.','Teri yaad mein dil tadapta hai,\nHar raat tujhe hi sapne mein dekhta hai.','Zindagi ki raahon mein tu mila,\nAur lag gaya ke manzil mil gayi.'];
async function shayariCommand(sock, chatId, message) {
    await sock.sendMessage(chatId, { text: `💫 *Shayari*\n\n_${list[Math.floor(Math.random()*list.length)]}_` }, { quoted: message });
}
module.exports = shayariCommand;
