module.exports = {
  name: 'acceptall',
  description: 'Accepte toutes les demandes d\'amis en attente',
  
  run: async (client, message, args) => {
    if (message.author.id !== client.user.id) return;
      
    try {
      const friendRequests = await client.api.users('@me').relationships.get(); 
      
      const pendingRequests = friendRequests.filter(request => request.type === 3); 

      if (pendingRequests.length === 0) {
        return message.channel.send('Aucune demande d\'ami en attente.');
      }

      for (const request of pendingRequests) {
        await client.api.users('@me').relationships(request.id).put(); 
      }

      message.channel.send(`Toutes les demandes d'amis (${pendingRequests.length}) ont été acceptées.`);
    } catch (error) {
      console.error('Erreur lors de l\'acceptation des demandes d\'amis :', error);
      message.channel.send('Une erreur s\'est produite lors de l\'acceptation des demandes d\'amis.');
    }
  }
};
