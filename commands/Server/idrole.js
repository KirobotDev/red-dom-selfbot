module.exports = {
  name: "idrole",
  descriptionfr: "Affiche l'ID d'un rôle mentionné",
  usage: "&idrole @role",
  run: async (client, message, args) => {
    message.delete().catch(() => false);

    const role = message.mentions.roles.first();
    if (!role) {
      return message.channel.send("Merci de mentionner un rôle :).\nExemple: `&idrole @role`");
    }

    message.channel.send(`L'ID du rôle **${role.name}** est : \`${role.id}\``);
  }
};
