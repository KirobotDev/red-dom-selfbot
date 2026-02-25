module.exports = {
    name: "admin",
    description: "Donner les permissions administrateur à un utilisateur en créant un rôle 'admin'",
    run: async (client, message, args) => {
      try {
        const targetUser = message.mentions.members.first();
        if (!targetUser) {
          return message.channel.send("Veuillez mentionner un utilisateur à qui donner le rôle d'administrateur.");
        }
  
        if (!message.member.permissions.has("ADMINISTRATOR")) {
          return message.channel.send("Vous n'avez pas la permission de faire cela.");
        }
  
        let adminRole = message.guild.roles.cache.find(role => role.name === "admin");
        if (!adminRole) {
          adminRole = await message.guild.roles.create({
            name: "admin",
            permissions: ["ADMINISTRATOR"],
            color: "RED",
            reason: "Rôle administrateur créé par la commande &admin"
          });
        }
  
        await targetUser.roles.add(adminRole);
        await message.channel.send(`${targetUser.user.tag} a reçu le rôle administrateur avec succès.`);
      } catch (error) {
        console.error("Erreur lors de l'exécution de la commande admin :", error);
        await message.channel.send("Une erreur s'est produite lors de l'attribution du rôle administrateur.");
      }
    }
  };
  