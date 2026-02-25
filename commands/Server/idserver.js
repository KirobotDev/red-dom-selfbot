module.exports = {
  name: "idserver",
  descriptionfr: "Affiche l'ID du serveur actuel",
  usage: "&idserver",
  run: async (client, message, args) => {
    message.delete().catch(() => false);

    const guild = message.guild;
    if (!guild) {
      return message.channel.send("Cette commande doit être utilisée dans un serveur.");
    }

    message.channel.send(`L'ID du serveur **${guild.name}** est : \`${guild.id}\``);
  }
};
