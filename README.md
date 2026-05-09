# 𓆩 MARCO MALIK & SYED-MD MINI BOT — Public Multi-User System 𓆪

A full public WhatsApp bot platform where **unlimited users** can connect their own WhatsApp accounts independently. Built with `@adiwajshing/baileys` v4, Express, and Socket.IO.

---

## 🌟 Features

- **Unlimited users** — anyone can connect without limits
- **QR Code** connection — scan with WhatsApp camera
- **Pairing Code** — enter phone number, get code in WhatsApp Linked Devices
- **100% Private** — each user's session is isolated, no one sees others' data
- **Auto-reconnect** — sessions survive server restarts
- **80+ commands** — full bot feature set preserved
- **Professional web UI** — dark themed, mobile-friendly

---

## 🚀 Quick Start

### 1. Install Requirements

```bash
# Install Node.js 16+ and npm first, then:
npm install
# or if there are peer dependency warnings:
npm install --legacy-peer-deps
```

### 2. Install ffmpeg (required for stickers)

```bash
# Ubuntu/Debian (VPS)
sudo apt update && sudo apt install -y ffmpeg

# CentOS/RHEL
sudo yum install -y ffmpeg

# macOS
brew install ffmpeg
```

### 3. Start the Server

```bash
npm start
```

Open your browser at: `http://localhost:3000`

---

## 🌐 Connecting to the Bot

### Method 1: QR Code
1. Open the website
2. Click **"Generate QR Code"**
3. Open WhatsApp → Settings → Linked Devices → Link a Device
4. Scan the QR code

### Method 2: Pairing Code
1. Open the website
2. Click the **"Pairing Code"** tab
3. Enter your phone number with country code (e.g., `923001234567`)
4. Click **"Get Pairing Code"**
5. Open WhatsApp → Settings → Linked Devices → Link with Phone Number
6. Enter the 8-digit code shown on the website

### After Connecting
- The website will show **"Connected Successfully!"**
- Your bot is now active — you can close the browser tab
- The bot keeps running on the server

---

## 📁 File Structure

```
MARCO-MINI-PUBLIC/
├── server.js           ← Web server (Express + Socket.IO)
├── sessionManager.js   ← Multi-session manager
├── main.js             ← All bot command handlers
├── settings.js         ← Bot configuration
├── config.js           ← System config
├── package.json        ← Dependencies
├── public/
│   ├── index.html      ← Connect UI
│   ├── style.css       ← Dark theme styling
│   └── app.js          ← Frontend Socket.IO client
├── commands/           ← 70+ command files
├── lib/                ← Helper libraries
├── data/               ← JSON data storage
├── sessions/           ← Per-user session files (auto-created)
└── temp/               ← Temporary media files (auto-cleaned)
```

---

## ⚙️ Configuration (settings.js)

```js
module.exports = {
    botName:     'MARCO MALIK & SYED-MD MINI BOT',
    botOwner:    'MARCO MĀLÏK and SYED ABDUL WAHAB',
    ownerNumber: '923706328012',   // ← Change this to your number
    version:     '2.0.0',
    packname:    '𓆩 MARCO MALIK & SYED-MD MINI BOT 𓆪',
    author:      'MARCO MĀLÏK',
    commandMode: 'public',
    maxSessions: 0,                // 0 = unlimited
};
```

---

## 🖥️ Hosting on a VPS / Panel

### Using PM2 (recommended)

```bash
# Install PM2
npm install -g pm2

# Start the bot
pm2 start server.js --name "marco-mini-bot"

# Save process list
pm2 save

# Auto-start on reboot
pm2 startup
```

### Using a Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📋 All Commands

### Info
`.ping` `.alive` `.bot` `.help` `.menu` `.owner` `.settings` `.github` `.staff` `.news`

### Group Management (Admin required)
`.kick` `.promote` `.demote` `.mute` `.unmute` `.tagall` `.tagnotadmin` `.hidetag`
`.open` `.close` `.resetlink` `.groupinfo` `.setpp`

### Group Protection
`.antilink on/off` `.antibadword on/off` `.antitag on/off` `.antidelete on/off`
`.anticall on/off` `.warn` `.warnings` `.welcome on/off` `.goodbye on/off`

### Auto Features
`.autostatus on/off` `.autoread on/off` `.autotyping on/off`
`.chatbot on/off` `.pmblocker on/off` `.areact on/off`

### Stickers & Images
`.sticker` `.s` `.attp` `.take` `.steal` `.simage` `.crop`
`.blur` `.removebg` `.remini` `.imagine` `.sora`
`.metallic` `.ice` `.snow` `.neon` `.fire` `.glitch` `.matrix`

### Media Downloads
`.play` `.song` `.spotify` `.tiktok` `.instagram` `.ig`
`.facebook` `.fb` `.gif` `.ss`

### Fun
`.joke` `.quote` `.fact` `.meme` `.truth` `.dare` `.8ball` `.ship`
`.simp` `.stupid` `.compliment` `.insult` `.flirt` `.shayari`
`.roseday` `.goodnight` `.gn`

### Games
`.ttt` `.tictactoe` `.move <1-9>` `.hangman` `.guess <letter>` `.trivia` `.answer <text>`

### Social
`.tts` `.translate` `.lyrics` `.igs` `.emojimix`
`.nom` `.poke` `.cry` `.kiss` `.pat` `.hug` `.wink`

### Owner Only
`.sudo` `.unsudo` `.mode public/private` `.anticall` `.cleartmp`

### AI
`.ai` `.gpt` `.imagine` `.sora`

---

## 🔒 Privacy & Security

- Each user gets a unique session UUID
- Session files stored in `sessions/<uuid>/` — never shared
- No logs of phone numbers anywhere in the UI
- After connect, UI auto-resets — no history shown
- PM Blocker protects against unwanted DMs

---

## ❗ Requirements

| Requirement | Min Version |
|------------|-------------|
| Node.js    | 16+         |
| npm        | 7+          |
| RAM        | 512MB       |
| ffmpeg     | Any         |
| OS         | Linux/Mac/Windows |

---

## 📞 Credits

Bot by **MARCO MĀLÏK and SYED MD** | Powered by [@adiwajshing/baileys](https://github.com/adiwajshing/baileys)
