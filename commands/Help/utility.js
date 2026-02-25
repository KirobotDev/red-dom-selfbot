const { language, loadGlobalDb, savedb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const utilityCommandsFR = {
    "avatar": "🖼️ Avatar d'un user",
    "banner": "🏳️ Bannière d'un user",
    "cesar": "🔐 Code un msg",
    "checkperm": "🛡️ Perms d'un user",
    "chrono": "⏱️ Chronomètre un temps",
    "clear": "🗑️ Supprime des msgs",
    "common": "🤝 Users en commun", 
    "createwebhook": "🔗 Crée un webhook",
    "embed": "🔲 Créer un embed",
    "ghost": "👻 Msg se suppr tt seul",
    "ghostping": "💥 Ping auto suppr",
    "gif": "🧪 Trouve un gif",
    "hypesquad": "🎖️ Changer l'Hypesquad",
    "image": "🖌️ Image selon un mot",
    "langues": "🌐 Langues disponibles",
    "leaveall": "🚪 Quitte tous servers",
    "leaveserver": "🚪 Quitte un serveur"
};

const utilityCommandsEN = {
    "avatar": "🖼️ View someone avatar",
    "banner": "🏳️ Show someone banner",
    "cesar": "🔐 Encodes a message",
    "checkperm": "🛡️ User's permissions",
    "chrono": "⏱️ Create a stopwatch",
    "clear": "🗑️ Delete messages",
    "common": "🤝 See common members", 
    "createwebhook": "🔗 Create a webhook",
    "embed": "🔲 Create an embed",
    "ghost": "👻 Self-deleting msg",
    "ghostping": "💥 Self-deleting ping",
    "gif": "🧪 Find a gif",
    "hypesquad": "🎖️ Change Hypesquad",
    "image": "🖌️ Image on a word",
    "langues": "🌐 Available languages",
    "leaveall": "🚪 Leave all servers",
    "leaveserver": "🚪 Leave a server"
};

function generateUtilityMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? utilityCommandsEN : utilityCommandsFR;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "utility",
    description: "Menu Help - Part 1",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                await savedb(client, { langue: "fr", theme: "default" });
            }
            const userDb = globalDb[userId] || {};
            const theme = userDb.theme || "default";

            const utilityMessageFR = generateUtilityMessage(theme, prefix, userId, 'fr');
            const utilityMessageEN = generateUtilityMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, utilityMessageFR, utilityMessageEN));
        } catch (e) {
            console.error("Erreur dans utility:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu Utility.");
        }
    }
};