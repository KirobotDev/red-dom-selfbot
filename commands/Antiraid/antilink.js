const fs = require('fs');
const path = require('path');
const { language } = require("../../fonctions");

const storagePath = path.join(__dirname, "antilink_servers.json");

let antilinkServers = {};
try {
  if (fs.existsSync(storagePath)) {
    antilinkServers = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
  }
} catch (error) {
  console.error("Erreur lors du chargement du fichier antilink_servers.json :", error);
}

const activeListeners = new Set();

module.exports = {
  name: "antilink",
  description: "Gère la suppression des messages contenant des liens.",
  run: async (client, message, args) => {
    if (!message) {
      console.error("Message est undefined.");
      return;
    }

    if (!message.guild) {
      return message.edit(await language(client, "Vous devez utiliser cette commande dans un serveur", "You must use this command in guild only"));
    }

    const guildId = message.guild.id;

    try {
      await message.delete();
    } catch (error) {
      console.error("Le message de commande a déjà été supprimé ou n'a pas pu être supprimé.", error);
    }

    if (args[0] === 'start') {
      if (antilinkServers[guildId]) {
        return await message.channel.send(":link: Le système de suppression de liens est déjà activé sur ce serveur.");
      }

      antilinkServers[guildId] = true;
      saveAntilinkServers();
      await message.channel.send(":link: Système de suppression de liens activé sur ce serveur.");

      if (!activeListeners.has(guildId)) {
        activeListeners.add(guildId);
        client.on('messageCreate', (msg) => handleMessage(client, msg));
      }

      return;
    }

    if (args[0] === 'stop') {
      if (!antilinkServers[guildId]) {
        return await message.channel.send(":link: Le système de suppression de liens est déjà désactivé sur ce serveur.");
      }

      delete antilinkServers[guildId];
      saveAntilinkServers();
      await message.channel.send(":link: Système de suppression de liens désactivé sur ce serveur.");

      if (activeListeners.has(guildId)) {
        activeListeners.delete(guildId);
      }

      return;
    }

    return await message.channel.send("Commande non reconnue. Utilisez `&antilink start` ou `&antilink stop`.");
  }
};

async function handleMessage(client, msg) {
  if (msg.author.bot || !antilinkServers[msg.guild?.id]) return;

  const containsLink = /https?:\/\/\S+/i.test(msg.content);
  if (containsLink) {
    try {
      if (msg.deletable) {
        await msg.delete();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du message :', error);
    }
  }
}

function saveAntilinkServers() {
  try {
    fs.writeFileSync(storagePath, JSON.stringify(antilinkServers, null, 2), 'utf8');
  } catch (error) {
    console.error("Erreur lors de la sauvegarde dans antilink_servers.json :", error);
  }
}
