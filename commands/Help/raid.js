const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const raidCommandsFR = {
  "banall": "🛑 Ban tous membres",
  "broadcast": "📢 Env un msg partout",
  "delsalon": "🗑️ Supprime tous salons",
  "delrole": "❌ Supprime tous rôles",
  "everyone": "▶️ Ping tous membres",
  "hack": "💻 Simule un hack",
  "raidtotal": "⚡ Big raid du serv"
};

const raidCommandsEN = {
  "banall": "🛑 Ban all members",
  "broadcast": "📢 Broadcast a message",
  "delsalon": "🗑️ Delete all channels",
  "delrole": "❌ Delete all roles",
  "everyone": "▶️ Ping all members",
  "hack": "💻 Simulates a hack",
  "raidtotal": "⚡ Big raid of the serv"
};

function generateRaidMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? raidCommandsEN : raidCommandsFR;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
  name: "raid",
  description: "Expulse tous les membres, bannit tous les membres et crée plusieurs salons textuels dans le serveur.",
  run: async (client, message, args, db, prefix) => {
    try {
      const globalDb = await loadGlobalDb();
      const userId = client.user.id;
      
      if (!globalDb[userId]) {
        globalDb[userId] = { langue: "fr", theme: "default" };
      }
      const userDb = globalDb[userId];
      const theme = userDb.theme || "default";

      const raidMessage = generateRaidMessage(theme, prefix, userId, 'fr');
      const englishMessage = generateRaidMessage(theme, prefix, userId, 'en');

      message.edit(await language(client, raidMessage, englishMessage));
    } catch (e) {
      console.error("Erreur dans raid:", e);
      message.edit("Une erreur est survenue lors de l'affichage du menu RAID.");
    }
  }
};