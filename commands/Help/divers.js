const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const diversCommands = {
    "art <texte>": "🎨 Créer ton ascii",
    "chill": "😎 Mec Détendu",  
    "crane": "💀 Crâne Géant",  
    "hacker": "💻 Hacker 4chan",  
    "luffy": "🐒 Luffy Gear Five",  
    "sasuke": "👦 Sasuke Enfant",  
    "toxic": "☠️ Crâne Toxique",  
    "troll": "😈 Troll Face"
};

const englishDiversCommands = {
    "art <text>": "🎨 Create your ascii",
    "chill": "😎 Chill Guy",
    "crane": "💀 Giant Skull",
    "hacker": "💻 4chan Hacker",
    "luffy": "🐒 Luffy Gear Five",
    "sasuke": "👦 Sasuke Kid",
    "toxic": "☠️ Toxic Skull",
    "troll": "😈 Troll Face"
};

function generateDiversMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishDiversCommands : diversCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "divers",
    description: "Menu divers",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            
            const theme = userDb.theme || "default";
            const diversMessage = generateDiversMessage(theme, prefix, userId, 'fr');
            const englishMessage = generateDiversMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, diversMessage, englishMessage));
        }
        catch(e) {
            console.error("Erreur dans divers:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu divers.");
        }
    }
};