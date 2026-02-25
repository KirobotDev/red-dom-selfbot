const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const friendsCommands = {
    "acceptall": "✅ Accepte toutes dmds",
    "addnote <id>": "📝 Ajouter une note",
    "allnotes": "📋 Voir toutes notes",
    "block": "🚫 Bloquer un user",
    "blocklist": "📜 Liste des bloqués",
    "delnote <id>": "🗑️ Supprimer une note",
    "demande list": "📥 Dmds d'amis reçues",
    "demande2 list": "📤 Dmds d'amis envoyées",
    "friend all": "👥 Voir tous amis",
    "friend nick": "🏷️ Modifier un surnom",
    "friend nombre": "🔢 Nombre total amis",
    "friend remove": "❌ Supprimer tous amis",
    "friend server": "🏠 Amis sur ce serveur",
    "link": "🔗 Envoyer lien ami",
    "unblock": "🔓 Débloquer un user"
};

const englishFriendsCommands = {
    "acceptall": "✅ Accept friends reqs",
    "addnote <id>": "📝 Add a note",
    "allnotes": "📋 View all notes",
    "block": "🚫 Block a user",
    "blocklist": "📜 List of blocked",
    "delnote <id>": "🗑️ Delete a note",
    "demande list": "📥 Friend reqs received",
    "demande2 list": "📤 Friend reqs sent",
    "friend all": "👥 View all friends",
    "friend nick": "🏷️ Change a nickname",
    "friend nombre": "🔢 Total friends",
    "friend remove": "❌ Remove all friends",
    "friend server": "🏠 Friends on here",
    "link": "🔗 Send friend link",
    "unblock": "🔓 Unblock a user"
};

function generateFriendsMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishFriendsCommands : friendsCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "friends",
    description: "Menu friends",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            
            const theme = userDb.theme || "default";
            const friendsMessage = generateFriendsMessage(theme, prefix, userId, 'fr');
            const englishMessage = generateFriendsMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, friendsMessage, englishMessage));
        }
        catch(e) {
            console.error("Erreur dans friends:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu friends.");
        }
    }
};