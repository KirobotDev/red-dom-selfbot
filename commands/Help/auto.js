const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const autoCommands = {
    "autobump": "🔄 Autobump (disboard)",
    "autoclear": "🗑️ Autosuppr les msg",
    "autoghost": "👻 Autoghost les msg",
    "autospam": "🔁 Autospam un msg", 
    "macro": "📜 Commandes de macro",
    "macrocmd": "⚡ Macro pour commandes"
};

const englishAutoCommands = {
    "autobump": "🔄 Autobump (disboard)",
    "autoclear": "🗑️ Autodelete msg",
    "autoghost": "👻 Autoghost msg",
    "autospam": "🔁 Autospam msg",
    "macro": "📜 Macro commands",
    "macrocmd": "⚡ Macro for commands"
};

function generateAutoMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishAutoCommands : autoCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "auto",
    description: "Menu automation",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            
            const theme = userDb.theme || "default";
            const autoMessage = generateAutoMessage(theme, prefix, userId, 'fr');
            const englishMessage = generateAutoMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, autoMessage, englishMessage));
        }
        catch(e) {
            console.error("Erreur dans auto:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu automation.");
        }
    }
};