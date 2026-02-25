const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const stalkerCommandsFR = {
    "stalk": "👀 Copie msgs d’un user",
    "stalkall": "🌐 Pareil sur tous serv",
    "stalk stop": "✋ Stop le stalk",
    "stalk stopall": "🛑 Stop le stalkall"
};

const stalkerCommandsEN = {
    "stalk": "👀 Copy msgs of a user",
    "stalkall": "🌐 Same on every serv",
    "stalk stop": "✋ Stop the stalk",
    "stalk stopall": "🛑 Stop the stalkall"
};

function generateStalkerMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? stalkerCommandsEN : stalkerCommandsFR;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "stalker",
    description: "Affiche la liste des commandes disponibles",
    run: async (client, message, db, args, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            const theme = userDb.theme || "default";

            const stalkerMessageFR = generateStalkerMessage(theme, prefix, userId, 'fr');
            const stalkerMessageEN = generateStalkerMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, stalkerMessageFR, stalkerMessageEN));
        } catch (e) {
            console.error("Erreur dans stalker:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu Stalker.");
        }
    }
};