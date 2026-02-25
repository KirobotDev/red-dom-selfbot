module.exports = {
  name: "unmute",
  description: "Rendre la parole a un membre mis en sourdine.",
  run: async (client, message, args) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) {
      return message.edit("Vous n avez pas la permission de gerer les roles.");
    }

    if (args.length < 1) {
      return message.edit("Veuillez mentionner un membre a rendre la parole apres la commande.");
    }

    let member = message.mentions.members.first();
    if (!member) {
      return message.edit("Membre non trouve.");
    }

    const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) {
      return message.edit("Aucun role Muted trouve dans ce serveur.");
    }

    if (!member.roles.cache.has(muteRole.id)) {
      return message.edit("Ce membre n est pas en sourdine.");
    }

    await member.roles.remove(muteRole).catch(console.error);
    message.edit(member.user.tag + " a retrouve la parole.");
  }
};