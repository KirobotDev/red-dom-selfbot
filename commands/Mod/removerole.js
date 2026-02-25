module.exports = {
  name: "removerole",
  description: "Retire un role d un utilisateur specifie.",
  run: async (client, message, args) => {
    if (!message.member.permissions.has("MANAGE_ROLES")) {
      return message.edit("Vous n avez pas la permission de gerer les roles.");
    }

    if (message.mentions.members.size === 0 || args.length < 2) {
      return message.edit("Veuillez mentionner un utilisateur et specifier un role apres la commande.");
    }

    const member = message.mentions.members.first();
    const roleMention = args.find(arg => arg.startsWith('<@&') && arg.endsWith('>'));

    if (!roleMention) {
      return message.edit("Veuillez mentionner un role valide.");
    }

    const roleId = roleMention.replace(/[<@&>]/g, '');
    await message.guild.roles.fetch();
    const role = message.guild.roles.cache.get(roleId);

    if (!role) {
      return message.edit("Role avec ID " + roleId + " non trouve.");
    }

    try {
      await member.roles.remove(role);
      message.edit("Le role " + role.name + " a ete retire de " + member.user.tag + ".");
    } catch (error) {
      console.error("Erreur lors du retrait du role :", error);
      message.edit("Erreur lors du retrait du role.");
    }
  }
};