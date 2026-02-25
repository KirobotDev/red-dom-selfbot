const fs = require('fs');
const path = require('path');

module.exports = {
  name: "nick",
  description: "Change le pseudo d'un membre spécifique.",
  run: async (client, message, args) => {

    // Vérifier si l'utilisateur a la permission de gérer les pseudos
    if (!message.member.permissions || !message.member.permissions.has('MANAGE_NICKNAMES')) {
      return message.reply("Tu n'as pas la permission de gérer les pseudos.");
    }

    // Vérifier si le bot a la permission de gérer les pseudos
    if (!message.guild.members.me.permissions || !message.guild.members.me.permissions.has('MANAGE_NICKNAMES')) {
      return message.reply("Je n'ai pas la permission de gérer les pseudos.");
    }

    // Vérifier si un utilisateur est mentionné
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return message.reply("Veuillez mentionner un utilisateur valide ou fournir son ID.");
    }

    // Vérifier si un nouveau pseudo a été fourni
    const newNickname = args.slice(1).join(' ');
    if (!newNickname) {
      return message.reply("Veuillez fournir un nouveau pseudo pour cet utilisateur.");
    }

    // Vérifier si le bot peut gérer le membre mentionné
    if (!member.manageable) {
      return message.reply("Je ne peux pas changer le pseudo de cet utilisateur.");
    }

    // Changer le pseudo de l'utilisateur mentionné
    try {
      await member.setNickname(newNickname); // Appliquer le nouveau pseudo
      message.reply(`Le pseudo de ${member.user.tag} a été changé en **${newNickname}**.`);
    } catch (err) {
      console.error(`Erreur en changeant le pseudo de ${member.user.tag}:`, err);
      message.reply("Une erreur est survenue lors du changement du pseudo.");
    }
  },
};
