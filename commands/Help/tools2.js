const { language, loadGlobalDb, savedb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const tools2CommandsFR = {
    "leavegroups": "🚪 Quitte tous les grps",
    "massreact": "🎯 Spam les reactions",
    "messagecount": "🔢 Nombre de messages",
    "purge": "🧹 Spam les msg vides",
    "rainbowrole": "🌈 Rôle multi-couleur",
    "repeat": "🔁 Répète un message",
    "rolecount": "📊 Nb user avc le rôle",
    "snipe": "🔍 Dernier msg supprimé",
    "spam": "💣 Spam un message",
    "translate": "🈹 Traduis un texte",
    "username": "🔎 Recherche Bruteforce"
};

const tools2CommandsEN = {
    "leavegroups": "🚪 Leaves all groups",
    "massreact": "🎯 Reactions spam",
    "messagecount": "🔢 Number of messages",
    "purge": "🧹 Spam empty messages",
    "rainbowrole": "🌈 Multi-color role",
    "repeat": "🔁 Repeats a message",
    "rolecount": "📊 Number user w/ role",
    "snipe": "🔍 Last deleted message",
    "spam": "💣 Spams a message",
    "translate": "🈹 Translates text",
    "username": "🔎 Bruteforce Research"
};

function generateTools2Message(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? tools2CommandsEN : tools2CommandsFR;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "tools2",
    description: "Menu Help - Tools (part 2)",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                await savedb(client, { langue: "fr", theme: "default" });
            }
            const userDb = globalDb[userId] || {};
            const theme = userDb.theme || "default";

            const tools2MessageFR = generateTools2Message(theme, prefix, userId, 'fr');
            const tools2MessageEN = generateTools2Message(theme, prefix, userId, 'en');

            message.edit(await language(client, tools2MessageFR, tools2MessageEN));
        } catch (e) {
            console.error("Erreur dans tools2:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu Tools 2.");
        }
    }
};