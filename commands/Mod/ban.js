const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const fetch = global.fetch;

module.exports = {
  name: "ban",
  description: "Bannir un membre du serveur.",
  run: async (client, message, args) => {

	const mysqlManager = global.mysqlManager;
    try {
      if (!message.member.permissions.has('BAN_MEMBERS')) {
        return message.edit("Vous n'avez pas la permission de bannir des membres.");
      }

      if (args.length < 1) {
        return message.edit("Veuillez spécifier l'ID ou mention du membre à bannir après la commande.");
      }

      let userId = args[0].replace(/[<@!>]/g, '');
      if (isNaN(userId)) return message.edit("L'ID spécifié n'est pas valide.");

      let mainBotToken;
      try {
        mainBotToken = await mysqlManager.getMainBotToken();
        if (!mainBotToken) {
        }
      } catch (error) {
        console.error(chalk.red('❌ Erreur récupération token MySQL:'), error);
        return message.edit("❌ Erreur de configuration. Veuillez contacter un administrateur.");
      }

      let user;
      try {
        user = await client.users.fetch(userId).catch(() => null);
        if (!user) {
          const res = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: { Authorization: `Bot ${mainBotToken}` }
          });
          if (!res.ok) return message.edit("Impossible de récupérer l'utilisateur via l'API.");
          const data = await res.json();
          user = { 
            id: data.id, 
            username: data.username, 
            discriminator: data.discriminator, 
            tag: `${data.username}#${data.discriminator}` 
          };
        }
      } catch {
        return message.edit("Impossible de récupérer l'utilisateur.");
      }

      let member;
      try {
        member = await message.guild.members.fetch(user.id).catch(() => null);
        if (!member) return message.edit("Membre non trouvé sur le serveur.");
        if (!member.bannable) return message.edit("Je n'ai pas la permission de bannir ce membre.");
      } catch {
        return message.edit("Impossible de vérifier le membre sur le serveur.");
      }

      await member.ban({ reason: args.slice(1).join(" ") || "Aucune raison spécifiée." }).catch(console.error);
      message.edit(`${user.tag} a été banni du serveur.`);

    } catch (err) {
      console.error(err);
      message.edit("Une erreur inattendue est survenue.");
    }
  }
};