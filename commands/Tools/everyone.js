module.exports = {
  name: 'everyone',
  description: 'Ping everyone in the server by splitting the messages if needed.',
  run: async (client, message) => {
    await message.delete();
    try { 
      if (!message.guild) {
        return message.channel.send('Cette commande doit être utilisée dans un serveur.');
      }

      if (message.guild.id === '1274437651759632484') {
        await message.channel.send('Pas ici mchef va tester ça ailleurs :)'); 
        return;
      }
 
      const members = await message.guild.members.fetch();
      const memberTags = members.map(member => `<@${member.user.id}>`);
 
      const MAX_CHARACTERS = 2000;
      const MENTIONS_PER_MESSAGE = 50;  
       
      const tagGroups = [];
      for (let i = 0; i < memberTags.length; i += MENTIONS_PER_MESSAGE) {
        tagGroups.push(memberTags.slice(i, i + MENTIONS_PER_MESSAGE));
      }
  
      for (const tagGroup of tagGroups) {
        let messageContent = tagGroup.join(' ');
         
        if (messageContent.length > MAX_CHARACTERS) {
          messageContent = messageContent.substring(0, MAX_CHARACTERS - 3) + '...';
        }
        
        try {
          const sentMessage = await message.channel.send(messageContent);
          await sentMessage.delete(); 
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          if (error.code === 200000 && error.httpStatus === 400) {   
            await trySplitMentions(message, tagGroup, MENTIONS_PER_MESSAGE);
          } else { 
          }
        }
      }
    } catch (error) { 
      message.reply('Erreur :((').then(msg => {
        setTimeout(() => msg.delete(), 5000);
      });
    }
  }
};
 
async function trySplitMentions(message, tagGroup, originalLimit) {
  const MAX_CHARACTERS = 2000;
   
  const limitsToTry = [20, 10, 5];
  
  for (const currentLimit of limitsToTry) {
    try { 
      for (let i = 0; i < tagGroup.length; i += currentLimit) {
        const subGroup = tagGroup.slice(i, i + currentLimit);
        let messageContent = subGroup.join(' ');
        
        if (messageContent.length > MAX_CHARACTERS) {
          messageContent = messageContent.substring(0, MAX_CHARACTERS - 3) + '...';
        }
        
        const sentMessage = await message.channel.send(messageContent);
        await sentMessage.delete();
         
        await new Promise(resolve => setTimeout(resolve, 300));
      }
       
      return true;
      
    } catch (error) { 
       
      if (currentLimit === 5) { 
        message.reply('Il y\'a une protection sur le serveur (automod) qui empêche la commande.').then(msg => {
          setTimeout(() => msg.delete(), 5000);
        });
        return false;
      }
    }
  }
  
  return false;
}