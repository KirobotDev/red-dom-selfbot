module.exports = {
  name: "lock",
  description: "Verrouille le canal ou tous les canaux pour empêcher les messages.",
  run: async (client, message, args, db, prefix) => {
    try {
      if (args[0] && args[0].toLowerCase() === 'all') {
        const channels = message.guild.channels.cache.filter(channel => channel.type === 0);

        for (const channel of channels.values()) {
          await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SEND_MESSAGES: false
          }).catch(error => console.error(`Erreur lors du verrouillage du canal ${channel.name} :`, error));
        }

        return message.edit("Tous les canaux texte ont été verrouillés. Les membres ne peuvent plus envoyer de messages.");
      } 
      
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SEND_MESSAGES: false
      });

      message.edit(`Les membres ne peuvent plus parler dans <#${message.channel.id}>.`);
    } catch (error) {
      console.error("Erreur lors du verrouillage du canal :", error);
      message.edit("Une erreur s'est produite lors du verrouillage du canal.");
    }
  },
};