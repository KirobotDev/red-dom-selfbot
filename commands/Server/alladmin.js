module.exports = {
    name: "alladmin",
    description: "Afficher tous les utilisateurs ayant la permission d'administrateur",
    run: async (client, message, args) => {
      try {
        if (!message.guild) {
          return message.channel.send("Cette commande ne peut être utilisée que dans un serveur.");
        }
  
        const admins = message.guild.members.cache.filter(member => member.permissions.has("ADMINISTRATOR"));
  
        if (admins.size === 0) {
          return message.channel.send("Aucun utilisateur avec la permission d'administrateur trouvé dans ce serveur.");
        }
  
        const adminList = admins.map(member => `- ${member.user.tag}`).join("\n");
  
        await message.channel.send(`Voici la liste des utilisateurs ayant la permission d'administrateur :\n${adminList}`);
      } catch (error) {
        console.error("Erreur lors de l'exécution de la commande alladmin :", error);
        await message.channel.send("Une erreur s'est produite lors de la récupération des administrateurs.");
      }
    }
  };
  