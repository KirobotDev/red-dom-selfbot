
module.exports = {
    name: 'messagecount',
    description: 'Obtenir le nombre exact de messages dans un salon.',
    run: async (client, message, args) => {
      message.edit(`Comptage en cours, cela peut prendre quelques minutes (selon le nombre de messages)`);
      const channel = message.mentions.channels.first() || message.channel;  // Utilise le salon mentionné ou le salon actuel
      try {
        let messages = await channel.messages.fetch({ limit: 100 }); // Charge les 100 derniers messages
        let totalMessages = messages.size;
  
        // Cette approche fonctionne uniquement pour récupérer les messages récents.
        // Discord ne permet pas de récupérer directement tous les messages de manière infinie.
  
        // Si vous avez besoin de récupérer plus de messages (au-delà des 100 derniers), vous devrez utiliser des "batches" successifs.
        while (messages.size === 100) {
          const lastMessage = messages.last();
          messages = await channel.messages.fetch({ limit: 100, before: lastMessage.id });
          totalMessages += messages.size;
        }
  
        message.channel.send(`Le salon ${channel.name} contient actuellement un total de ${totalMessages} messages.`);
      } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        message.channel.send('Une erreur s\'est produite lors de la récupération des messages.');
      }
    }
  };
  