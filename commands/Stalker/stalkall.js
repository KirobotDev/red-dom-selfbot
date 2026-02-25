module.exports = {
  name: 'stalkall',
  description: 'Surveille les messages d\'un user spécifique dans TOUS les salons/DMs',
  run: async (client, message, args, db) => {
    const target = message.mentions.users.first();
  
    if (!client._stalkAllUsers) client._stalkAllUsers = new Set();
    if (!client._stalkAllListeners) client._stalkAllListeners = new Map();
    if (!client._lastStalkedAllMessages) client._lastStalkedAllMessages = new Map();

    const stalkChannel = message.channel;
 
    if (args[0]?.toLowerCase() === 'stop') {
      if (!target) { 
        client._stalkAllUsers.clear();
         
        for (const [userId, listener] of client._stalkAllListeners.entries()) {
          client.off('stalkedMessageAll', listener);
        }
        
        client._stalkAllListeners.clear();
        client._lastStalkedAllMessages.clear();
        return message.edit('Stalkall stoppé');
      }
 
      if (!client._stalkAllUsers.has(target.id)) {
        return message.edit(`Aucun stalkall actif sur ${target.tag}.`);
      }

      client._stalkAllUsers.delete(target.id);
      
      if (client._stalkAllListeners.has(target.id)) {
        const listener = client._stalkAllListeners.get(target.id);
        client.off('stalkedMessageAll', listener);
        client._stalkAllListeners.delete(target.id);
      }
      
      client._lastStalkedAllMessages.delete(target.id);

      return message.edit(`Stalkall arrêté`);
    }
 
    if (!target) return message.edit('Veuillez mentionner un utilisateur à stalkall.');
    if (target.id === message.author.id) return message.channel.send("Imagine t'es tellement con t'essayes de te stalkall toi même :/");
    if (client._stalkAllUsers.has(target.id)) return message.edit("Cet utilisateur est déjà stalkall");
  
    client._stalkAllUsers.add(target.id);

    message.edit(`Stalkall activé sur ${target.tag}`);
 
    const listener = async (stalkedMessage) => { 
      try {  

        if (stalkedMessage.author.id !== target.id) return;
         
        const lastMessageId = client._lastStalkedAllMessages.get(target.id);
        if (lastMessageId === stalkedMessage.id) {
          return;  
        }
         
        client._lastStalkedAllMessages.set(target.id, stalkedMessage.id);
          
        if (stalkedMessage.author.id === client.user.id) return;
        
        const prefix = db.prefix

        if (stalkedMessage.content && stalkedMessage.content.startsWith(prefix)) {
          return; 
        }
          
        let contentToSend = stalkedMessage.content || '';
         
        if (stalkedMessage.attachments && stalkedMessage.attachments.size > 0) {
          const attachments = Array.from(stalkedMessage.attachments.values());
          const attachmentUrls = attachments.map(a => a.url);
          if (contentToSend) {
            contentToSend += '\n' + attachmentUrls.join('\n');
          } else {
            contentToSend = attachmentUrls.join('\n');
          }
        }
         
        if (stalkedMessage.embeds && stalkedMessage.embeds.length > 0) {
          if (contentToSend) {
            contentToSend += `\n[${stalkedMessage.embeds.length} embed(s)]`;
          } else {
            contentToSend = `[${stalkedMessage.embeds.length} embed(s)]`;
          }
        }
         
        if (!contentToSend.trim()) {
          contentToSend = '.';
        }

        await stalkedMessage.channel.send(contentToSend);
        
      } catch (err) {
        console.error('[STalkall] Impossible d\'envoyer le message stalké :', err);
      }
    };
 
    client._stalkAllListeners.set(target.id, listener);
    client.on('stalkedMessageAll', listener);
  },
};