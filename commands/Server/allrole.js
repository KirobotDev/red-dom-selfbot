const { language } = require("../../fonctions");

module.exports = {
  name: "allrole",
  description: "Affiche tous les rôles du serveur sauf @everyone",

  run: async (client, message, args) => {
      
    if (!message.guild) {
      return message.channel.send(await language(
        client,
        "Vous devez utiliser cette commande dans un serveur",
        "You must use this command in guild only"
      ));
    }

    const roles = message.guild.roles.cache
      .filter(role => role.id !== message.guild.id) 
      .sort((a, b) => b.position - a.position)
      .map(role => `**${role.name}** ||(ID: ${role.id})||`)
      .join("\n");

    if (!roles) {
      return message.channel.send(await language(
        client,
        "Aucun rôle trouvé dans ce serveur.",
        "No roles found in this server."
      ));
    }

    return message.channel.send(roles);
  }
};
