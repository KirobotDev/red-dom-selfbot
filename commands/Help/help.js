const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const commands = {
  "afk": "⏰ Gestion AFK",
  "antiraid": "🛡️ Protection serveur",
  "auto": "⚙️ Automatisations",
  "backup": "💾 Sauvegardes serveurs",
  "configrpc": "🎛️ Config RPC",
  "configspot": "🎶 Config Spotify",
  "custom": "😎 Emojis Nitro",
  "divers": "🖌️ ASCII",
  "flood": "🌊 Macro Flood",
  "friends": "👥 Gestion amis",
  "fun": "🎉 Fun & mini-jeux",
  "fun2": "🕹️ Plus de fun",
  "group": "👨‍👩‍👧‍👦 Commandes groupe",
  "help": "📖 Aide & commandes",
  "multitag": "🉐 Rotation des tags",
  "mod": "🔨 Modération",
  "nsfw": "🔞 Contenu NSFW",
  "raid": "🚨 Commandes raid",
  "rpc": "💻 Gestion RPC",
  "server": "🥊 Gestion server",
  "settings": "⚙️ Paramètres",
  "stalker": "🕵️ Outils de stalk",
  "status": "📝 Status personnalisés",
  "theme": "🎨 Themes des help",
  "token": "🔑 Gestion tokens",
  "tools": "🧰 Outils",
  "tools2": "🕹️ Outils (suite)",
  "utility": "🛠️ Utilitaires",
  "utility2": "💻 Utilitaires (suite)",
  "voc": "🎤 Gestion vocale"
};

const englishCommands = {
  "afk": "⏰ AFK Management",
  "antiraid": "🛡️ Server Protection",
  "auto": "⚙️ Automations",
  "backup": "💾 Server Backups",
  "configrpc": "🎛️ RPC Configuration",
  "configspot": "🎶 Config Spotify",
  "custom": "😎 Nitro Emojis",
  "divers": "🎨 ASCII",
  "flood": "🌊 Flood Macro",
  "friends": "👥 Friends Management",
  "fun": "🎉 Fun & Mini-games",
  "fun2": "🕹️ More Fun",
  "group": "👨‍👩‍👧‍👦 Commands groups",
  "help": "📖 Help & Commands",
  "multitag": "🉐 Tags Rotation",
  "mod": "🔨 Moderation",
  "nsfw": "🔞 NSFW Content",
  "raid": "🚨 Raid Commands",
  "rpc": "💻 RPC Management",
  "server": "🥊 Server Management",
  "settings": "⚙️ Settings",
  "stalker": "🕵️ Stalking Tools",
  "status": "📝 Custom Status",
  "theme": "🎨 Help's theme",
  "token": "🔑 Token Management",
  "tools": "🧰 Tools",
  "tools2": "🕹️ Tools (continued)",
  "utility": "🛠️ Utilities",
  "utility2": "💻 Utilities (continued)",
  "voc": "🎤 Voice Management"
};

function generateHelpMessage(theme, prefix, userId, lang = 'fr') {
  const themeFunction = themes[theme] || themes.default;
  const commandSet = lang === 'en' ? englishCommands : commands;
  return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
  name: "help",
  description: "Menu Help",
  run: async (client, message, args, db, prefix) => {
    try {
        const globalDb = await loadGlobalDb();
        const userId = client.user.id;
        
        if (!globalDb[userId]) {
            globalDb[userId] = { langue: "fr", theme: "default" };
        }
        const userDb = globalDb[userId];
        const theme = userDb.theme || "default";
        const helpMessage = generateHelpMessage(theme, prefix, userId, 'fr');
        const englishMessage = generateHelpMessage(theme, prefix, userId, 'en');

        const finalMessage = await language(client, helpMessage, englishMessage);
        message.edit(finalMessage);
    }
    catch(e) {
        console.error("Erreur dans help:", e);
        message.edit("Une erreur est survenue lors de l'affichage de l'aide.");
    }
  }
};