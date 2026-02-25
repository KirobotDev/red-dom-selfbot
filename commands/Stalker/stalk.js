module.exports = {
  name: 'stalk',
  description: 'Surveille les messages d\'un user spécifique dans ce salon',
  run: async (client, message, args, db) => {
    const target = message.mentions.users.first();
  
    if (!client._watchedUsers) client._watchedUsers = new Set();
    if (!client._stalkListeners) client._stalkListeners = new Map();
    if (!client._stalkChannels) client._stalkChannels = new Map();
    if (!client._lastStalkedMessages) client._lastStalkedMessages = new Map();

    const stalkChannel = message.channel;
 
    if (args[0]?.toLowerCase() === 'stop') {
      if (!target) { 
        client._watchedUsers.clear();
         
        for (const [userId, listener] of client._stalkListeners.entries()) {
          client.off('stalkedMessage', listener);
        }
        
        client._stalkListeners.clear();
        client._stalkChannels.clear();
        client._lastStalkedMessages.clear();
        return message.edit('Stalk stoppé');
      }
 
      if (!client._watchedUsers.has(target.id)) {
        return message.edit(`Aucun stalk actif sur ${target.tag}.`);
      }

      client._watchedUsers.delete(target.id);
      
      if (client._stalkListeners.has(target.id)) {
        const listener = client._stalkListeners.get(target.id);
        client.off('stalkedMessage', listener);
        client._stalkListeners.delete(target.id);
      }
      
      client._stalkChannels.delete(target.id);
      client._lastStalkedMessages.delete(target.id);

      return message.edit(`Stalk arrêté`);
    }
 
    if (!target) return message.edit('Veuillez mentionner un utilisateur à stalk.');
    if (target.id === message.author.id) return message.channel.send("Imagine t'es tellement con t'essayes de te stalk toi même :/");
    if (client._watchedUsers.has(target.id)) return message.edit("Cet utilisateur est déjà stalk");
  
    client._watchedUsers.add(target.id);
    client._stalkChannels.set(target.id, stalkChannel);

    message.edit(`Stalk activé sur ${target.tag}.`);
 
    const listener = async (stalkedMessage) => { 
      try { 
        const targetStalkChannel = client._stalkChannels.get(target.id);
        if (!targetStalkChannel) return;
         
        if (stalkedMessage.author.id !== target.id) return;
        
        const prefix = db.prefix

        if (stalkedMessage.content && stalkedMessage.content.startsWith(prefix)) {
          return; 
        }
         
        if (stalkedMessage.channel.id !== targetStalkChannel.id) return;
         
        const lastMessageId = client._lastStalkedMessages.get(target.id);
        if (lastMessageId === stalkedMessage.id) {
          return;  
        }
         
        client._lastStalkedMessages.set(target.id, stalkedMessage.id);
         
        if (stalkedMessage.author.id === client.user.id) return;
         
        let content = stalkedMessage.content || '';
         
        if (stalkedMessage.attachments && stalkedMessage.attachments.size > 0) {
          const attachments = Array.from(stalkedMessage.attachments.values());
          const attachmentUrls = attachments.map(a => a.url);
          if (content) {
            content += '\n' + attachmentUrls.join('\n');
          } else {
            content = attachmentUrls.join('\n');
          }
        }
         
        if (stalkedMessage.embeds && stalkedMessage.embeds.length > 0) {
          content += `\n[${stalkedMessage.embeds.length} embed(s) - voir le message original]`;
        }
        
        if (!content.trim()) {
          content = `[Message sans texte - ${stalkedMessage.attachments?.size || 0} pièce(s) jointe(s), ${stalkedMessage.embeds?.length || 0} embed(s)]`;
        }
          
        await targetStalkChannel.send(`${content}`);
        
      } catch (err) {
        console.error('[STALK] Impossible d\'envoyer le message stalké :', err);
      }
    };
 
    client._stalkListeners.set(target.id, listener);
    client.on('stalkedMessage', listener);
  },
};