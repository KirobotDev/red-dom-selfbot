const { language } = require("../../fonctions");

module.exports = {
  name: "mutual",
  aliases: ["mutualservers", "commonservers"],
  description: "Affiche simplement la liste des serveurs en commun",
  run: async (client, message, args) => {
    if (!args[0]) {
        return message.edit('Vous devez mentionner un utilisateur.');
    }
    await message.edit("Recherche en cours...");
    try {
      let user;
 
      if (message.mentions.users.first()) {
        user = message.mentions.users.first();
      } else if (args[0]) {
        let userId = args[0].replace(/[<@!>]/g, '');
        
        if (userId) {
          user = client.users.cache.get(userId); 

          if (!user) {
            for (const guild of client.guilds.cache.values()) {
              try {
                const member = await guild.members.fetch(userId).catch(() => null);
                if (member) {
                  user = member.user;
                  break;
                }
              } catch (guildError) {
                console.log("Recherche dans guild échouée:", guildError);
              }
            }
          } 
           
          if (!user && userId.match(/^\d{17,19}$/)) {
            try {
              const fetch = global.fetch
              const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
                headers: { Authorization: `Bot ${client.token}` }
              });
              
              if (response.ok) {
                const data = await response.json();
                user = {
                  id: data.id,
                  username: data.username,
                  discriminator: data.discriminator,
                  tag: `${data.username}#${data.discriminator}`
                };
              }
            } catch (e) {
              console.log("API fetch échoué:", e);
            }
          }
        }
      } else {
        return message.edit("Vous devez mentionner un utilisateur.")
      }

      if (!user) return message.channel.send("❌ Utilisateur introuvable.");  
        
      const guildPromises = Array.from(client.guilds.cache.values()).map(async (guild) => {
        try {
          const member = guild.members.cache.get(user.id) || await guild.members.fetch(user.id).catch(() => null);
          return member ? guild : null;
        } catch {
          return null;
        }
      });
      
      const guildResults = await Promise.all(guildPromises);
      const mutualGuilds = guildResults.filter(g => g !== null); 
      
      if (mutualGuilds.length === 0) {
        return message.channel.send(`❌ Aucun serveur en commun avec **${user.tag || user.username || user.id}**.`);
      }
 
      const guildNames = mutualGuilds.map(g => `• ${g.name}`).join('\n');
       
      const response = `**${mutualGuilds.length} serveurs en commun avec ${user.tag || user.username || user.id} :**\n\n${guildNames}`;
       
      if (response.length > 2000) { 
        const chunks = [];
        let currentChunk = "";
        
        for (const line of guildNames.split('\n')) {
          if ((currentChunk + line + '\n').length > 2000) {
            chunks.push(currentChunk);
            currentChunk = line + '\n';
          } else {
            currentChunk += line + '\n';
          }
        }
        
        if (currentChunk) chunks.push(currentChunk);
        
        await message.channel.send(`**${mutualGuilds.length} serveurs en commun avec ${user.tag || user.username || user.id} :**\n`);
        for (let i = 0; i < chunks.length; i++) {
          await message.channel.send(chunks[i]);
        }
      } else {
        await message.channel.send(response);
      }

    } catch (error) {
      console.error("Erreur avec la commande mutual :", error);
      await message.channel.send("❌ Erreur lors de la recherche des serveurs.");
    }
  },
};