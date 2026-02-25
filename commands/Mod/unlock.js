module.exports = {
  name: "unlock",
  description: "Deverrouille le canal ou tous les canaux pour permettre les messages.",
  run: async (client, message, args, db, prefix) => {
    
    if (!message.member.permissions.has("MANAGE_CHANNELS")) {
      return message.edit("Vous n avez pas la permission de gerer les salons.");
    }

    try {
      if (args[0] && args[0].toLowerCase() === 'all') {
        const channels = message.guild.channels.cache.filter(channel => channel.isText());

        channels.forEach(async (channel) => {
          await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SEND_MESSAGES: true
          }).catch(error => console.error("Erreur lors du deverrouillage du canal " + channel.name + " :", error));
        });

        return message.edit("Tous les canaux texte ont ete deverrouilles. Les membres peuvent de nouveau envoyer des messages.");
      }

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SEND_MESSAGES: true
      });

      message.edit("Les membres peuvent de nouveau parler dans ce canal.");
    } catch (error) {
      console.error("Erreur lors du deverrouillage du canal :", error);
      message.edit("Une erreur s est produite lors du deverrouillage du canal.");
    }
  },
};