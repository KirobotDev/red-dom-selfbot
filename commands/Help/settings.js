const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const settingsCommandsFR = {
    "alias": "👀 Autres noms de cmd",
    "deco": "💔 Se déco du sb",
    "kill": "⚡ Restart le bot",
    "ping": "🏓 Test de latence",
    "platform": "📱 Change la plateforme",
    "selfdel": "❌ Suppr auto tes cmds",
    "setemoji": "😀 Change l'emoji du $B",
    "setlang": "🌐 Change la langue",
    "setprefix": "🔹 Change le préfix",
    "theme": "🎨 Change le thème",
    "user": "👤 Infos sur votre $B" 
};

const settingsCommandsEN = {
    "alias": "👀 Cmd other names",
    "deco": "💔 Disconnect the $B",
    "kill": "⚡ Restart the $B",
    "ping": "🏓 Latency test",
    "platform": "📱 Allows the platform",
    "selfdel": "❌ Auto del your cmds",
    "setemoji": "😀 Change the emoji",
    "setlang": "🌐 Change the language",
    "setprefix": "🔹 Change the prefix",
    "theme": "🎨 Change the theme",
    "user": "👤 Infos of the $elfbot"
};

function generateSettingsMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? settingsCommandsEN : settingsCommandsFR;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "settings",
    description: "Menu settings",
    run: async (client, message, db, args, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            const theme = userDb.theme || "default";

            const settingsMessageFR = generateSettingsMessage(theme, prefix, userId, 'fr');
            const settingsMessageEN = generateSettingsMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, settingsMessageFR, settingsMessageEN));
        } catch (e) {
            console.error("Erreur dans settings:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu Settings.");
        }
    }
};