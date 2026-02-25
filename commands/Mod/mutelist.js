module.exports = {
  name: "mutelist",
  description: "Affiche la liste des membres actuellement en sourdine dans le serveur.",
  run: async (client, message, args) => {
    let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) {
      return message.edit(`\`❌\` Aucun rôle "Muted" n'a été trouvé dans ce serveur.`);
    }

    let mutedMembers = message.guild.members.cache.filter(member => member.roles.cache.has(muteRole.id));

    if (mutedMembers.size === 0) {
      return message.edit(`\`✅\` Aucun membre n'est actuellement en sourdine.`);
    }

    let muteList = mutedMembers.map(member => `${member.user.tag}`).join('\n');
    message.edit(`\`✅\` Membres actuellement en sourdine :\n${muteList}`);
  }
};