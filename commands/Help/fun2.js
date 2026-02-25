const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const fun2Commands = {
    "caca": "💩 Lancer de mrd",
    "dadjoke": "👨 Blague de mrd",
    "mock": "🔄 En MoDe CoMmE çA",
    "meme": "🖼️ Meme aléatoire",
    "pizza": "🍕 Pizza cadeau",
    "quote": "💬 Citation aléatoire",
    "rizz": "🍚 Rizz avec du riz"
};

const englishFun2Commands = {
    "caca": "💩 Throw poop",
    "dadjoke": "👨 Dad joke",
    "mock": "🔄 iT'Ll bE lIkE tHiS",
    "meme": "🖼️ Random meme",
    "pizza": "🍕 Pizza gift",
    "quote": "💬 Random quote",
    "rizz": "🍚 Rizz (french meme)"
};

function generateFun2Message(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishFun2Commands : fun2Commands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "fun2",
    description: "Menu fun 2",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            
            const theme = userDb.theme || "default";
            const fun2Message = generateFun2Message(theme, prefix, userId, 'fr');
            const englishMessage = generateFun2Message(theme, prefix, userId, 'en');

            message.edit(await language(client, fun2Message, englishMessage));
        }
        catch(e) {
            console.error("Erreur dans fun2:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu fun 2.");
        }
    }
};