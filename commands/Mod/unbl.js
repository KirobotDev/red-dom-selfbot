const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'unbl',
  description: 'Retire un utilisateur de la liste noire',
  usage: '<@utilisateur> ou <ID>',
  run: async (client, message, args) => {
    try {
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.channel.send('Vous n\'avez pas les autorisations nécessaires pour utiliser cette commande.');
      }

      let userId;
      if (message.mentions.users.size > 0) {
        const user = message.mentions.users.first();
        userId = user.id;
      } else if (args[0]) {
        userId = args[0]; 
      }

      if (!userId) {
        return message.channel.send('Veuillez mentionner un utilisateur ou fournir un ID à retirer de la liste noire.');
      }

      const blacklistFile = path.join(__dirname, 'blacklist.json');

      let blacklist = {};
      if (fs.existsSync(blacklistFile)) {
        try {
          blacklist = JSON.parse(fs.readFileSync(blacklistFile, 'utf8'));

          if (typeof blacklist !== 'object' || Array.isArray(blacklist)) {
            console.error('Le fichier blacklist.json ne contient pas un objet valide. Réinitialisation à un objet vide.');
            blacklist = {};
          }
        } catch (error) {
          console.error(`Erreur lors de la lecture du fichier ${blacklistFile}: ${error.message}`);
        }
      }

      if (!blacklist[userId]) {
        return message.channel.send(`L'utilisateur avec l'ID ${userId} n'est pas dans la liste noire.`);
      }

      delete blacklist[userId];

      try {
        fs.writeFileSync(blacklistFile, JSON.stringify(blacklist, null, 2), 'utf8');
        message.channel.send(`L'utilisateur avec l'ID ${userId} a été retiré de la liste noire.`);
      } catch (error) {
        console.error(`Erreur lors de l'écriture dans le fichier ${blacklistFile}: ${error.message}`);
        message.channel.send(`Une erreur s'est produite lors du retrait de l'utilisateur de la liste noire. Détails : ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur lors du retrait d\'un utilisateur de la liste noire :', error);
      message.channel.send(`Une erreur s'est produite lors du retrait de l'utilisateur de la liste noire. Détails : ${error.message}`);
    }
  },
};
