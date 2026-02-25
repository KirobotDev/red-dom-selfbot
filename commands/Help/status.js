const { language, loadGlobalDb, savedb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const statusCommandsFR = {
    "multistatus": "♾️ Rotation des status",
    "setstatus dnd": "⛔ Ne pas déranger",
    "setstatus idle": "🌙 Inactif",
    "setstatus inv": "👻 Invisible",
    "setstatus onl": "🟢 En ligne"
};

const statusCommandsEN = {
    "multistatus": "♾️ Auto rotate statuses",
    "setstatus dnd": "⛔ Do not disturb",
    "setstatus idle": "🌙 Idle",
    "setstatus inv": "👻 Invisible",
    "setstatus onl": "🟢 Online"
};

function generateStatusMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? statusCommandsEN : statusCommandsFR;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "status",
    description: "Menu status",
    run: async (client, message, db, args, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                await savedb(client, { langue: "fr", theme: "default" });
            }
            const userDb = globalDb[userId] || {};
            const theme = userDb.theme || "default";

            const statusMessageFR = generateStatusMessage(theme, prefix, userId, 'fr');
            const statusMessageEN = generateStatusMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, statusMessageFR, statusMessageEN));
        } catch (e) {
            console.error("Erreur dans status:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu Status.");
        }
    }
};