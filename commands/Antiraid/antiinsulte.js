const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "antiinsulte.json");

function readDB() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
    }
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data || "{}");
  } catch (err) {
    console.error("Erreur de lecture de la base de données :", err);
    return {};
  }
}

function writeDB(dbb) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(dbb, null, 2));
  } catch (err) {
    console.error("Erreur d'écriture dans la base de données :", err);
  }
}

function setupMessageFilter(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    const dbb = readDB();
    const bannedWords = dbb[guildId] || [];

    if (bannedWords.length === 0) return;

    const messageContent = message.content.toLowerCase();
    const containsBannedWord = bannedWords.some(word => 
      messageContent.includes(word.toLowerCase())
    );

    if (containsBannedWord) {
      try {
        await message.delete();

      } catch (error) {
        console.error("Erreur lors de la suppression du message :", error);
      }
    }
  });
}

function restartMessageFilter(client) {
  client.removeAllListeners("messageCreate");
  setupMessageFilter(client);
  console.log("Filtre anti-insulte redémarré");
}

let isFilterActive = false;

function startFilter(client) {
  if (!isFilterActive) {
    setupMessageFilter(client);
    isFilterActive = true;
  }
}

module.exports = {
  name: "antiinsulte",
  description: "Ajoute ou supprime des mots interdits sur le serveur",
  usage: "&antiinsulte [add/remove/list] [mot]",
  run: async (client, message, args, db) => {
    if (!isFilterActive) {
      startFilter(client);
    }

    if (!message.guild) {
      return message.channel.send("Cette commande ne peut être utilisée que sur un serveur.");
    }

    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.channel.send("Tu n'as pas la permission d'utiliser cette commande.");
    }

    const action = args[0];
    const word = args.slice(1).join(" ").toLowerCase();
    const guildId = message.guild.id;

    let dbb = readDB();
    if (!dbb[guildId]) dbb[guildId] = [];

    if (action === "add") {
      if (!word) return message.channel.send("Tu dois spécifier un mot !");
      if (dbb[guildId].includes(word)) return message.channel.send("🚫 Ce mot est déjà interdit !");
      
      dbb[guildId].push(word);
      writeDB(dbb);
      return message.channel.send(`Le mot **${word}** a été ajouté à la liste des interdits.`);
    
    } else if (action === "remove") {
      if (!word) return message.channel.send("Tu dois spécifier un mot !");
      if (!dbb[guildId].includes(word)) return message.channel.send("🚫 Ce mot n'est pas dans la liste.");
      
      dbb[guildId] = dbb[guildId].filter(w => w !== word);
      writeDB(dbb);
      return message.channel.send(`Le mot **${word}** a été retiré de la liste.`);
    
    } else if (action === "list") {
      if (dbb[guildId].length === 0) return message.channel.send("Aucune insulte enregistrée pour ce serveur.");
      return message.channel.send(`**Mots interdits** : ${dbb[guildId].join(", ")}`);
    
    } else {
      return message.edit(`
**Commandes antiinsulte :**
\`${db.prefix}antiinsulte add (mot)\` - Ajoute une insulte interdite à la liste
\`${db.prefix}antiinsulte list\`- Montre la liste des insultes interdites
\`${db.prefix}antiinsulte remove\` - Enlève une insulte de la liste
        `);
    }
  },

  setupMessageFilter,
  restartMessageFilter
};

setTimeout(() => {
  if (typeof global.client !== 'undefined' && global.client) {
    setupMessageFilter(global.client);
    console.log("Filtre anti-insulte démarré automatiquement");
  }
}, 1000);