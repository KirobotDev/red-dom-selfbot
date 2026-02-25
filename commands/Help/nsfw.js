const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const nsfwCommands = {
    "4k": "📸 4k",
    "anal": "🍑 Anal",
    "ass": "🍑 Ass",
    "boobs": "🍒 Boobs",
    "gonewild": "🔥 Gonewild",
    "hanal": "🌸 Hentai Anal",
    "hass": "🌸 Hentai Ass",
    "hboobs": "🌸 Hentai Boobs",
    "hentai": "🌸 Hentai",
    "hkitsune": "🦊 H Kitsune",
    "hmidriff": "💫 H Midriff",
    "hneko": "🐱 H Neko",
    "holo": "✨ Holo",
    "hthigh": "💋 H Thigh",
    "kemonomimi": "🐾 Kemonomimi",
    "neko": "🐱 Neko",
    "paizuri": "💦 Paizuri",
    "pgif": "🎞️ Porn Gif",
    "pussy": "🍓 Pussy",
    "tentacle": "🐙 Tentacle",
    "thigh": "🍑 Thigh",
    "yaoi": "💞 Yaoi"
};

const englishNsfwCommands = {
    "4k": "📸 4k",
    "anal": "🍑 Anal",
    "ass": "🍑 Ass",
    "boobs": "🍒 Boobs",
    "gonewild": "🔥 Gonewild",
    "hanal": "🌸 Hentai Anal",
    "hass": "🌸 Hentai Ass",
    "hboobs": "🌸 Hentai Boobs",
    "hentai": "🌸 Hentai",
    "hkitsune": "🦊 H Kitsune",
    "hmidriff": "💫 H Midriff",
    "hneko": "🐱 H Neko",
    "holo": "✨ Holo",
    "hthigh": "💋 H Thigh",
    "kemonomimi": "🐾 Kemonomimi",
    "neko": "🐱 Neko",
    "paizuri": "💦 Paizuri",
    "pgif": "🎞️ Porn Gif",
    "pussy": "🍓 Pussy",
    "tentacle": "🐙 Tentacle",
    "thigh": "🍑 Thigh",
    "yaoi": "💞 Yaoi"
};

function generateNsfwMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishNsfwCommands : nsfwCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "nsfw",
    description: "Menu NSFW",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            
            const theme = userDb.theme || "default";
            const nsfwMessage = generateNsfwMessage(theme, prefix, userId, 'fr');
            const englishMessage = generateNsfwMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, nsfwMessage, englishMessage));
        }
        catch(e) {
            console.error("Erreur dans nsfw:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu NSFW.");
        }
    }
};