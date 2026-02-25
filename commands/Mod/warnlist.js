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

module.exports = {
  name: "warnlist",
  description: "Affiche la liste des warns pour chaque utilisateur dans le serveur.",
  run: async (client, message, args) => {
    console.log("Commande warnlist executee.");

    if (!message.guild) {
      console.log("Commande utilisee en dehors d un serveur.");
      return message.edit("Cette commande ne peut etre utilisee que dans un serveur.");
    }

    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.edit("Vous devez avoir les permissions administratives pour utiliser cette commande.");
    }

    const warns = readWarns();
    console.log("Warns charges :", warns);

    const guildId = message.guild.id;

    if (!warns[guildId] || Object.keys(warns[guildId]).length === 0) {
      return message.channel.send("Aucun warn trouve dans ce serveur.");
    }

    let warnList = "Liste des warns pour ce serveur :\n";
    for (const [userId, warnCount] of Object.entries(warns[guildId])) {
      try {
        const user = await message.guild.members.fetch(userId);
        warnList += user.user.tag + ": " + warnCount + " warn(s)\n";
      } catch (error) {
        console.error("Impossible de recuperer les informations de l utilisateur " + userId + ":", error);
        warnList += "Utilisateur avec ID " + userId + ": " + warnCount + " warn(s)\n";
      }
    }

    message.channel.send(warnList);
  }
};