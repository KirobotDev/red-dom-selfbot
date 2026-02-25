module.exports = {
  name: "addrole",
  description: "Ajoute un rôle à un utilisateur spécifié.",
  run: async (client, message, args) => {
    const member = message.mentions.members?.first();
    const roleId = args[1]?.replace(/[<@&>]/g, '');

    if (!member || !roleId) {
      return message.edit(`Veuillez mentionner un utilisateur et spécifier un rôle après la commande.`);
    }

    await message.guild.roles.fetch();
    const role = message.guild.roles.cache.get(roleId);

    if (!role) {
      return message.edit(`\`❌\` Rôle non trouvé.`);
    }

    try {
      await member.roles.add(role);
      message.edit(`Le rôle "${role.name}" a été ajouté à ${member.user.tag}.`);
    } catch (error) {
      message.edit(`Erreur lors de l'ajout du rôle.`);
    }
  }
};