const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const rpcCommands = {
    "activaterpc": "▶️ Active ton RPC",
    "configrpc": "⚙️ Configure ton RPC",
    "deleterpc": "🗑️ Enlève ton RPC",
    "rpcsettings": "📊 Paramètres du RPC",
    "setrpc": "🎮 Met le RPC de base",
    "setrpc list": "📋 Liste des RPC"
};

const englishRpcCommands = {
    "activaterpc": "▶️ Enable your RPC",
    "configrpc": "⚙️ Configure your RPC",
    "deleterpc": "🗑️ Clear your RPC",
    "rpcsettings": "📊 Settings of the RPC",
    "setrpc": "🎮 Put the default RPC",
    "setrpc list": "📋 List of all RPC"
};

function generateRpcMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishRpcCommands : rpcCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "rpc",
    description: "Menu RPC",
    run: async (client, message, args, db, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                globalDb[userId] = { langue: "fr", theme: "default" };
            }
            const userDb = globalDb[userId];
            
            const theme = userDb.theme || "default";
            const rpcMessage = generateRpcMessage(theme, prefix, userId, 'fr');
            const englishMessage = generateRpcMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, rpcMessage, englishMessage));
        }
        catch(e) {
            console.error("Erreur dans rpc:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu RPC.");
        }
    }
};