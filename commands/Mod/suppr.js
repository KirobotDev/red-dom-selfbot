module.exports = {
    name: "suppr",
    description: "Supprime tous les messages d'un utilisateur dans tous les salons du serveur.",
    run: async (client, message, args) => {
      try {
        // Supprimer le message de commande
        await message.delete();
  
        // Vérifier si un utilisateur est mentionné ou un ID est fourni
        const userId = args[0]?.replace('<@!', '').replace('<@', '').replace('>', '');
        const user = await message.guild.members.fetch(userId).catch(() => null);
  
        if (!user) {
          return message.channel.send("Veuillez mentionner un utilisateur valide ou fournir son ID.");
        }
  
        let i = 0; // Compteur de suppression
        const fetchAndDelete = async (channel, lastMessageId = null) => {
          // Récupérer jusqu'à 100 messages à la fois
          const options = { limit: 100 };
          if (lastMessageId) {
            options.before = lastMessageId;
          }
  
          const messages = await channel.messages.fetch(options);
  
          // Si aucun message n'est trouvé, on arrête
          if (messages.size === 0) {
            return;
          }
  
          // Parcourir les messages récupérés
          for (const singleMessage of messages.values()) {
            // Supprimer seulement les messages de l'utilisateur ciblé
            if (singleMessage.author.id === user.id) {
              await singleMessage.delete().catch(() => {}); // Supprimer le message
              i++; // Incrémenter le compteur
            }
          }
  
          // Continuer à supprimer tant que des messages sont trouvés
          if (messages.size === 100) {
            await fetchAndDelete(channel, messages.last().id); // Appel récursif pour continuer à supprimer
          }
        };
  
        // Parcourir tous les salons du serveur
        for (const [channelId, channel] of message.guild.channels.cache) {
          if (channel.isText()) { // Vérifier si c'est un salon texte
            await fetchAndDelete(channel);
          }
        }
  
        // Confirmation
        return message.channel.send(
          `Tous les messages de **${user.user.tag}** ont été supprimés dans tous les salons du serveur (si trouvés).`
        );
  
      } catch (error) {
        console.log("Erreur lors de la suppression des messages : ", error);
        return message.channel.send("Une erreur s'est produite lors de la suppression des messages.");
      }
    }
  };
  