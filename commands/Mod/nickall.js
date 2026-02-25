const fs = require('fs');
const path = require('path');

module.exports = {
  name: "nickall",
  description: "Change le pseudo de tous les membres d'un serveur.",
  run: async (client, message, args) => {

    // Vérifier si l'utilisateur a la permission de gérer les membres
    if (!message.member.permissions || !message.member.permissions.has('MANAGE_GUILD')) {
      return message.reply("Tu n'as pas la permission de gérer les membres.");
    }

    // Vérifier si le bot a la permission de gérer les membres
    if (!message.guild.members.me.permissions || !message.guild.members.me.permissions.has('MANAGE_GUILD')) {
      return message.reply("Je n'ai pas la permission de gérer les membres.");
    }

    // Vérifier si un pseudo a été fourni
    const newNickname = args.join(' ');
    if (!newNickname) {
      return message.reply("Tu dois fournir un pseudo à attribuer à tous les membres.");
    }

    // Boucler à travers tous les membres du serveur
    try {
      // Utiliser fetch() pour récupérer tous les membres, y compris ceux hors ligne
      const members = await message.guild.members.fetch();

      // Filtrer les membres à ne pas modifier (le bot lui-même et les membres avec des rôles plus élevés)
      const membersToNick = members.filter(member => member.id !== client.user.id && member.manageable);

      if (membersToNick.size === 0) {
        return message.reply("Il n'y a aucun membre à modifier.");
      }

      // Changer le pseudo de chaque membre
      for (const [memberId, member] of membersToNick) {
        try {
          await member.setNickname(newNickname);
        } catch (err) {
          console.error(`Erreur en modifiant le pseudo de ${member.user.tag}:`, err);
        }
      }

      message.reply(`Tous les pseudos ont été changés en **${newNickname}**.`);
    } catch (err) {
      console.error("Erreur lors de la modification des pseudos:", err);
      message.reply("Une erreur est survenue lors du changement des pseudos.");
    }
  },
};
