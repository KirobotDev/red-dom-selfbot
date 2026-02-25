const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const customCommands = {
    "coeur": "🐼 Panda + Coeur",
    "genius": "🧠 Renoi pas con", 
    "heart": "🏳️‍🌈 Panda + coeur lgbt",
    "idk": "🤷 Le gars sait pas",
    "idkk": "🤷‍♂️ Pareil en + gros",
    "issou": "😆 Tsais l'espagnol",
    "king": "👑 Roi Baldwin badass",
    "panda": "🐼 Panda = Happy",
    "panique": "😰 Panda en sueur",
    "sad": "😢 Panda = Sad",
    "shock": "🐸 Crapaud choqué",
    "skull": "💀 Tete de mort bzr",
    "smart": "🦊 Malynx le lynx",
    "wolf": "🐺 Loup + Coeur"
};

const englishCustomCommands = {
    "coeur": "🐼 Panda + Heart",
    "genius": "🧠 Not an idiot", 
    "heart": "🏳️‍🌈 Panda + LGBT heart",
    "idk": "🤷 The guy doesn't know",
    "idkk": "🤷‍♂️ Same but bigger",
    "issou": "😆 The Spanish guy",
    "king": "👑 King Baldwin badass",
    "panda": "🐼 Panda = Happy",
    "panique": "😰 Sweaty Panda",
    "sad": "😢 Panda = Sad",
    "shock": "🐸 Shocked Toad",
    "skull": "💀 Skull but weird",
    "smart": "🦊 Sly as a lynx",
    "wolf": "🐺 Wolf + Heart"
};

function generateCustomMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishCustomCommands : customCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "custom",
    description: "Menu custom",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            
            const theme = userDb.theme || "default";
            const customMessage = generateCustomMessage(theme, prefix, userId, 'fr');
            const englishMessage = generateCustomMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, customMessage, englishMessage));
        }
        catch(e) {
            console.error("Erreur dans custom:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu custom.");
        }
    }
};