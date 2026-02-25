const { language, loadGlobalDb, savedb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const utility2CommandsFR = {
    "message": "✉️ Programme un message",
    "mutual": "🏘️ Serveurs en commun",
    "password": "🔐 Créer un mdp",
    "pin": "📌 Épingle un message",
    "ping": "🏓 Test de latence",
    "react": "🔘 Réactions oui/non",
    "reaction": "💬 Texte en réactions",
    "savechat": "💾 Sauvegarder des msg",
    "time": "⏰ Heure d'une ville",
    "timestamp": "⏱️ Crée ton timestamp",
    "unpin": "📌 Désépingle un msg",
    "userinfo": "👤 Infos sur un user"
};

const utility2CommandsEN = {
    "message": "✉️ Schedule a message",
    "mutual": "🏘️ Servers in common",
    "password": "🔐 Create a password",
    "pin": "📌 Pin a message",
    "ping": "🏓 Latency test",
    "react": "🔘 Reactions yes/no",
    "reaction": "💬 Text as reactions",
    "savechat": "💾 Save msg in a file",
    "time": "⏰ Time for a city",
    "timestamp": "⏱️ Create a timestamp",
    "unpin": "📌 Unpin a message",
    "userinfo": "👤 Get user infos"
};

function generateUtility2Message(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? utility2CommandsEN : utility2CommandsFR;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "utility2",
    description: "Menu Help - Part 2",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                await savedb(client, { langue: "fr", theme: "default" });
            }
            const userDb = globalDb[userId] || {};
            const theme = userDb.theme || "default";

            const utility2MessageFR = generateUtility2Message(theme, prefix, userId, 'fr');
            const utility2MessageEN = generateUtility2Message(theme, prefix, userId, 'en');

            message.edit(await language(client, utility2MessageFR, utility2MessageEN));
        } catch (e) {
            console.error("Erreur dans utility2:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu Utility 2.");
        }
    }
};