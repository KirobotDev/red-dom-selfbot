const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const theme = require(path.join(__dirname, 'themes.js'));

module.exports = {
  name: "antiraid",
  description: "Affiche les dernières commandes de modération et de sécurité",
  run: async (client, message, args, db, prefix) => {
    try {
      const globalDb = await loadGlobalDb();
      const userId = client.user.id;
      
      if (!globalDb[userId]) {
        globalDb[userId] = { langue: "fr", theme: "default" };
      }
      const userDb = globalDb[userId];
        
      const antiraidCommands = {
        antibot: "🚫 Kick auto les bots",
        antiinsulte: "🗣️ Suppr les insultes",
        antilink: "🔗 Suppr les liens",
        antispam: "🔇 Anti-spam"
      };

      const englishAntiraidCommands = {
        antibot: "🚫 Auto kick bots",
        antiinsulte: "🗣️ Delete insults",
        antilink: "🔗 Delete links",
        antispam: "🔇 Anti-spam"
      };

      let antiRaidMessage;
      const themeName = userDb.theme || "default";
      
      if (theme[themeName]) {
        antiRaidMessage = theme[themeName](prefix, antiraidCommands, userId, 'fr'); 
      } else {
        antiRaidMessage = theme.default(prefix, antiraidCommands, userId, 'fr'); 
      }

      let englishMessage;
      if (theme[themeName]) {
        englishMessage = theme[themeName](prefix, englishAntiraidCommands, userId, 'en');
      } else {
        englishMessage = theme.default(prefix, englishAntiraidCommands, userId, 'en'); 
      }

      message.edit(await language(client, antiRaidMessage, englishMessage));
    }
    catch(e) {
      console.error("Erreur dans antiraid:", e);
      message.edit("Une erreur est survenue lors de l'affichage des commandes antiraid.");
    }
  }
};