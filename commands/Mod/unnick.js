const fs = require('fs');
const path = require('path');

module.exports = {
  name: "unnick",
  description: "Réinitialise le pseudo d'un membre spécifique.",
  run: async (client, message, args) => {

    const configPath = path.join(__dirname, '../../config.json'); 

    let config;

    try {
      // Lecture du fichier config.json
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
      console.error("Erreur lors de la lecture du fichier config.json", err);
      return message.edit("Erreur lors de la lecture de la configuration.");
    }

    if (!config.premiumUsers.includes(message.author.id)) {
      return message.edit("*Vous n'êtes pas éligible au mode :* `premium`");
    }

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

    // Vérifier si le bot peut gérer le membre mentionné
    if (!member.manageable) {
      return message.reply("Je ne peux pas réinitialiser le pseudo de cet utilisateur.");
    }

    // Réinitialiser le pseudo de l'utilisateur mentionné
    try {
      await member.setNickname(null); // Réinitialiser le pseudo
      message.reply(`Le pseudo de ${member.user.tag} a été réinitialisé avec succès.`);
    } catch (err) {
      console.error(`Erreur en réinitialisant le pseudo de ${member.user.tag}:`, err);
      message.reply("Une erreur est survenue lors de la réinitialisation du pseudo.");
    }
  },
};
