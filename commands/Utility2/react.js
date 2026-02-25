module.exports = {
    name: 'react',
    description: 'Ajoute des réactions au dernier message de l\'utilisateur et supprime la commande',
    run: async (client, message, args) => {
      try {
        // Récupère les messages du canal, le paramètre 2 limite la récupération à 2 messages
        const messages = await message.channel.messages.fetch({ limit: 2 });
  
        // Le premier message est toujours celui de la commande actuelle, donc on prend le second
        const lastMessage = messages.find(m => m.id !== message.id);
  
        if (!lastMessage) {
          return message.channel.send('Impossible de trouver votre dernier message.');
        }
  
        // Ajoute les réactions ✅ et ❌ au dernier message de l'utilisateur
        await lastMessage.react('✅');
        await lastMessage.react('❌');
  
        console.log(`Réactions ajoutées au message de ${lastMessage.author.tag}`);
  
        // Supprime le message de commande après avoir ajouté les réactions
        await message.delete();
      } catch (error) {
        console.error('Erreur lors de l\'ajout des réactions :', error);
        message.channel.send('Une erreur est survenue lors de l\'ajout des réactions.').then(msg => {
          setTimeout(() => msg.delete(), 5000); // Supprime le message d'erreur après 5 secondes
        });
      }
    },
  };
  