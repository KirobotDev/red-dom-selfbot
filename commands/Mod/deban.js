const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const fetch = global.fetch;

module.exports = {
  name: "deban",
  description: "Débannir un membre du serveur.",

  run: async (client, message, args) => {
	const mysqlManager = global.mysqlManager;
    try {
      if (!message.member.permissions.has('BAN_MEMBERS')) {
        return message.edit("`❌` Vous n'avez pas la permission de débannir des membres.");
      }

      if (args.length < 1) {
        return message.edit("`❗` Veuillez spécifier l'ID de l'utilisateur à débannir après la commande.");
      }

      const userId = args[0];
      if (isNaN(userId)) return message.edit("`❌` L'ID spécifié n'est pas valide.");

      let user;
      try {
        user = await client.users.fetch(userId).catch(() => null);
        if (!user) {
          // Récupérer le token du bot principal depuis MySQL silencieusement
          let mainBotToken;
          try {
            mainBotToken = await mysqlManager.getMainBotToken();
            if (!mainBotToken) {
              return message.edit("`❌` Impossible de récupérer les informations de l'utilisateur.");
            }
          } catch {
            return message.edit("`❌` Impossible de récupérer les informations de l'utilisateur.");
          }

          const res = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: { Authorization: `Bot ${mainBotToken}` }
          });
          if (!res.ok) return message.edit("`❌` Impossible de récupérer cet utilisateur via l'API.");
          const data = await res.json();
          user = {
            id: data.id,
            username: data.username,
            discriminator: data.discriminator,
            tag: `${data.username}#${data.discriminator}`
          };
        }
      } catch {
        return message.edit("`❌` Impossible de récupérer l'utilisateur.");
      }

      const bans = await message.guild.bans.fetch({ limit: 1000 });
      if (!bans.has(user.id)) {
        return message.edit("`❌` Cet utilisateur n'est pas banni.");
      }

      await message.guild.members.unban(user.id, args.slice(1).join(" ") || "Aucune raison spécifiée.")
        .then(() => message.edit(`\`✅\` ${user.tag} a été débanni du serveur.`))
        .catch(err => {
          console.error(err);
          message.edit(`\`❌\` Impossible de débannir ${user.tag}.`);
        });

    } catch (err) {
      console.error(err);
      message.edit("`❌` Une erreur inattendue est survenue.");
    }
  }
};