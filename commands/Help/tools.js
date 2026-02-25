const { language, loadGlobalDb, savedb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, 'themes.js'));

const toolsCommandsFR = {
    "base64": "💻 Encode/Decode base64",
	"binary": "2️⃣ Encode/Decode binaire",
    "botlink": "🤖 Lien de votre bot",
    "calcul": "🧮 Fait des calculs",
    "capitale": "🏛️ Trouve une capitale",
    "cleardm": "🗑️ Suppr msg d'un dm",
    "clearsalon": "🗑️ Suppr msg d'un salon",
    "closedms": "📪 Ferme les DM's",
    "code": "🔤 Style pour du txt",
    "dm": "✉️ DM qlq d'un serveur",
    "edit": "✏️ Modifie des messages",
	"everyone": "👻 Ghost ping tlm",
    "find": "🔍 Trouve un user en vc",
    "graber-ip": "🔎 Grab l'ip de qlq",
    "ipinfo": "🌐 Infos sur une IP"
};

const toolsCommandsEN = {
    "base64": "💻 Encode/Decode base64",
	"binary": "2️⃣ Encode/Decode binary",
    "botlink": "🤖 Link of your bot",
    "calcul": "🧮 Performs calculs",
    "capitale": "🏛️ Finds the capital",
    "cleardm": "🗑️ Delete all msgs (DM)",
    "clearsalon": "🗑️ Same in a channel",
    "closedms": "📪 Closes DMs",
    "code": "🔤 Echaracters for text",
    "dm": "✉️ DM a server member",
    "edit": "✏️ Edits messages",
	"everyone": "👻 Ghost ping everyone",
    "find": "🔍 Find someone in a vc",
    "graber-ip": "🔎 Grab Ip of a user",
    "ipinfo": "🌐 Infos about an IP"
};

function generateToolsMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? toolsCommandsEN : toolsCommandsFR;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "tools",
    description: "Menu Help - Tools (part 1)",
    run: async (client, message, db, args, prefix) => {
        try {
            const globalDb = await loadGlobalDb();
            const userId = client.user.id;
            
            if (!globalDb[userId]) {
                await savedb(client, { langue: "fr", theme: "default" });
            }
            const userDb = globalDb[userId] || {};
            const theme = userDb.theme || "default";

            const toolsMessageFR = generateToolsMessage(theme, prefix, userId, 'fr');
            const toolsMessageEN = generateToolsMessage(theme, prefix, userId, 'en');

            message.edit(await language(client, toolsMessageFR, toolsMessageEN));
        } catch (e) {
            console.error("Erreur dans tools:", e);
            message.edit("Une erreur est survenue lors de l'affichage du menu Tools.");
        }
    }
};