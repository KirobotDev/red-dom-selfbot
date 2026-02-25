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
  name: "warn",
  description: "Ajoute un warn a un utilisateur. Apres 3 warns, l utilisateur sera banni.",
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
      return message.edit("Veuillez mentionner l utilisateur que vous voulez warn.");
    }
    message.edit(user + " a ete warn.");

    if (user.id === message.guild.ownerId) {
      return message.edit("Vous ne pouvez pas warn le proprietaire du serveur.");
    }

    const member = message.guild.members.cache.get(user.id);
    if (member && (member.roles.highest.position >= message.member.roles.highest.position) && message.author.id !== message.guild.ownerId) {
      return message.edit("Vous ne pouvez pas warn un utilisateur ayant un role superieur ou egal au votre.");
    }

    const warns = readWarns();
    console.log("Warns charges :", warns);

    let logChannel = message.guild.channels.cache.find(ch => ch.name === "logs-warns");
    if (!logChannel) {
      logChannel = await message.guild.channels.create("logs-warns", {
        type: "GUILD_TEXT",
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: ['VIEW_CHANNEL'],
          },
          {
            id: message.author.id,
            allow: ['VIEW_CHANNEL'],
          }
        ],
      });
      message.channel.send("Le salon des logs pour les warnings a ete cree.");
    }

    const guildId = message.guild.id;
    if (!warns[guildId]) {
      warns[guildId] = {};
    }

    if (!warns[guildId][user.id]) {
      warns[guildId][user.id] = 0;
    }

    warns[guildId][user.id] += 1;

    if (warns[guildId][user.id] > 3) {
      warns[guildId][user.id] = 3;
    }

    writeWarns(warns);

    await logChannel.send(user.tag + " a ete warn (" + warns[guildId][user.id] + "/3)");

    if (warns[guildId][user.id] >= 3) {
      try {
        await message.guild.members.ban(user.id, { reason: "Accumulation de 3 warnings." });
        await logChannel.send(user.tag + " a ete banni pour avoir accumule 3 warnings.");
        delete warns[guildId][user.id];
        writeWarns(warns);
      } catch (error) {
        console.error("Erreur lors du ban :", error);
        logChannel.send("Impossible de bannir l utilisateur.");
      }
    }
  }
};