module.exports = {
  name: 'debanall',
  description: 'Débannir tous les membres du serveur',
  run: async (client, message, args) => {
    // Vérifie si l'utilisateur a la permission de gérer les bannissements
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('Désolé, vous n\'avez pas la permission de bannir des membres.');
    }

    // Vérifie si le bot a la permission de gérer les bannissements
    if (!message.guild.me.permissions.has('BAN_MEMBERS')) {
      return message.reply('Je n\'ai pas la permission de bannir des membres.');
    }

    // Récupère la liste des membres bannis
    try {
      const bans = await message.guild.bans.fetch();

      // Si aucun membre n'est banni
      if (bans.size === 0) {
        return message.reply('Il n\'y a aucun membre banni sur ce serveur.');
      }

      // Débannit tous les membres
      await Promise.all(
        bans.map(async (ban) => {
          await message.guild.members.unban(ban.user);
        })
      );

      return message.reply('Tous les membres bannis ont été débannis avec succès.');
    } catch (error) {
      console.error(error);
      return message.reply('Il y a eu une erreur en essayant de débannir les membres.');
    }
  },
};
