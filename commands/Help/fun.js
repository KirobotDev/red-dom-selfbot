const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const funCommands = {
    "blague": "😂 Blague aléatoire",
    "branlette": "💪 Branle quelqu'un",
    "chance": "🍀 Montre ta chance",
    "chat": "🐱 Chat mignon",
    "coinflip": "🪙 Pile ou Face",
    "cookie": "🍪 Cookie cadeau",
    "debite": "🔥 Debite qlq",
    "insulte": "😠 Insulte distinguée",
    "karma": "✨ Karma un user",
    "love <@user>": "💖 Message animé",
    "money": "💰 Envoie un billet",
    "nitro": "🎁 Nitro ptetre",
    "nitrotroll": "🤡 Nitro troll",
    "quote": "💬 Dis une citation",
    "reddom": "⚡ tqt",
    "rizz": "😏 Yeahhh",
    "roll": "🎲 Lance un dé",
    "say <@user>": "🗣️ Fait passer pr qlq",
    "thot <@user>": "📊 Pourcentage de slp"
};

const englishFunCommands = {
    "blague": "😂 Random joke",
    "branlette": "💪 Hug someone",
    "chance": "🍀 Shows your luck",
    "chat": "🐱 Cute cat",
    "coinflip": "🪙 Heads or Tails",
    "cookie": "🍪 Cookie gift",
    "debite": "🔥 Roast someone",
    "insulte": "😠 Random insult",
    "karma": "✨ Karma a user",
    "love <@user>": "💖 Animated love msg",
    "money": "💰 Send a bill",
    "nitro": "🎁 Nitros maybe",
    "nitrotroll": "🤡 Nitro troll",
    "quote": "💬 Say a quote",
    "reddom": "⚡ Dw",
    "rizz": "😏 Yeahhh",
    "roll": "🎲 Roll a dice",
    "say <@user>": "🗣️ Impersonate someone",
    "thot <@user>": "📊 Thot's purcentage"
};

function generateFunMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishFunCommands : funCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "fun",
    description: "Menu fun",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            
            const theme = userDb.theme || "default";
            const funMessage = generateFunMessage(theme, prefix, userId, 'fr');
            const englishMessage = generateFunMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, funMessage, englishMessage));
        }
        catch(e) {
            console.error("Erreur dans fun:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu fun.");
        }
    }
};