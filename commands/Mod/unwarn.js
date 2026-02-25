const fs = require('fs');
const path = require('path');

const warnsFile = path.join(__dirname, 'warns.json');

function readWarns() {
  if (!fs.existsSync(warnsFile)) {
    console.log("Fichier warns.json non trouve, creation du fichier.");
    fs.writeFileSync(warnsFile, '{}');
  }
  const data = fs.readFileSync(warnsFile, 'utf8');
  return JSON.parse(data);
}

function writeWarns(data) {
  fs.writeFileSync(warnsFile, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "unwarn",
  description: "Enleve un warn a un utilisateur",
  run: async (client, message, args) => {
    if (!message.guild) {
      console.log("Commande utilisee en dehors d un serveur.");
      return message.edit("Cette commande ne peut etre utilisee que dans un serveur.");
    }

    if (!message.member.permissions.has('ADMINISTRATOR') && message.author.id !== message.guild.ownerId) {
      return message.edit("Vous devez avoir les permissions administratives ou etre le proprietaire du serveur pour utiliser cette commande.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      console.log("Aucun utilisateur mentionne.");
      return message.edit("Veuillez mentionner l utilisateur dont vous voulez enlever un warn.");
    }

    if (user.id === message.guild.ownerId) {
      return message.edit("Vous ne pouvez pas unwarn le proprietaire du serveur.");
    }

    const member = message.guild.members.cache.get(user.id);
    if (member && (member.roles.highest.position >= message.member.roles.highest.position) && message.author.id !== message.guild.ownerId) {
      return message.edit("Vous ne pouvez pas unwarn un utilisateur ayant un role superieur ou egal au votre.");
    }

    console.log("Chargement des warns depuis le fichier JSON.");
    const warns = readWarns();
    console.log("Warns charges:", warns);

    const guildId = message.guild.id;
    console.log("Verification des warns pour le serveur:", guildId);

    if (!warns[guildId] || !warns[guildId][user.id]) {
      console.log("L utilisateur n a pas de warns.");
      return message.channel.send(user.tag + " n a pas de warns.");
    }

    console.log("Enlevement d un warn pour " + user.tag);
    warns[guildId][user.id] -= 1;

    if (warns[guildId][user.id] <= 0) {
      delete warns[guildId][user.id];
      if (Object.keys(warns[guildId]).length === 0) {
        delete warns[guildId];
      }
      console.log("Sauvegarde des warns mis a jour.");
      writeWarns(warns);

      let logChannel = message.guild.channels.cache.find(ch => ch.name === "logs-warns");
      if (logChannel) {
        await logChannel.send(user.tag + " a ete unwarn et n a plus de warns.");
      }
    } else {
      console.log("Sauvegarde des warns mis a jour.");
      writeWarns(warns);

      let logChannel = message.guild.channels.cache.find(ch => ch.name === "logs-warns");
      if (logChannel) {
        await logChannel.send(user.tag + " a ete unwarn (" + warns[guildId][user.id] + "/3).");
      }
    }

    message.channel.send(user.tag + " a maintenant " + (warns[guildId][user.id] || 0) + " warnings.");
  }
};