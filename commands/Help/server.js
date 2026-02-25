const { language, loadGlobalDb } = require("../../fonctions");
const path = require("path");
const themes = require(path.join(__dirname, "themes.js"));

const serverCommandsFR = {
    "alladmin": "ℹ️ Tous users admins",
    "allrole": "👥 Tous les rôles",
    "boosts": "💎 Nombre de boosts",
    "bots": "🤖 Nombre de bots",
    "emojis": "😀 Nombre d'emojis",
    "idcategory": "📂 Id d'une categorie",
    "idemoji": "🔢 Id d'un emoji",
    "idrole": "🧩 Id d'un rôle",
    "idsalon": "📌 Id d'un salon",
    "idserver": "🏛️ Id du serveur actuel",
    "iduser": "👤 ID d'un utilisateur",
    "membres": "👥 Nombre de membres",
    "owner": "👑 Montre l'owner",
    "roles": "🎭 Nombre de rôles",
    "salons": "📜 Nombre de salons",
    "serverinfo": "🏛️ Infos d'un serveur",
    "stickers": "🏷️ Nombre de stickers",
};

const serverCommandsEN = {
    "alladmin": "ℹ️ All admin users",
    "allrole": "👥 All of the roles",
    "bots": "🤖 Number of bots",
    "boosts": "💎 Number of server",
    "emojis": "😀 Number of emojis",
    "idcategory": "📂 ID of a category",
    "idemoji": "🔢 ID of a custom emoji",
    "idrole": "🧩 ID of a role",
    "idsalon": "📌 ID of a channel",
    "idserver": "🏛️ ID of the server",
    "iduser": "👤 ID of a user",
    "membres": "👥 Number of members",
    "owner": "👑 Display server owner",
    "roles": "🎭 Number of roles",
    "salons": "📜 Number of channels",
    "serverinfo": "🏛️ Get server's infos",
    "stickers": "🏷️ Number of stickers",
};

function generateServerMessage(theme, prefix, userId, lang = "fr") {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === "en" ? serverCommandsEN : serverCommandsFR;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "server",
    description: "Commandes liées au serveur",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            const theme = userDb.theme || "default";

            const serverMessageFR = generateServerMessage(theme, prefix, userId, "fr");
            const serverMessageEN = generateServerMessage(theme, prefix, userId, "en");

            message.edit(await language(client, serverMessageFR, serverMessageEN));
        } catch (e) {
            console.error("Erreur dans server:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu Server.");
        }
    }
};