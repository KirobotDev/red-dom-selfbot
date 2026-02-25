module.exports = {
  name: "mute",
  description: "Mettre en sourdine un membre du serveur pour un certain temps ou indéfiniment.",
  run: async (client, message, args) => {
    if (!message.guild) {
        return message.edit('Cette commande ne marche que sur un serveur.')
    }

    if (args.length < 1) {
      return message.edit(`Veuillez mentionner un membre à mettre en sourdine après la commande.`);
    }

    let member = message.mentions.members.first();
    if (!member) {
      return message.edit(`Membre non trouvé.`);
    }

    let muteDuration = args[1] ? parseInt(args[1]) : null;  

    if (muteDuration && isNaN(muteDuration)) {
      return message.edit(`Durée invalide. Veuillez entrer un nombre valide pour la durée en minutes.`);
    }
 
    let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) {
      try {
        muteRole = await message.guild.roles.create({
          name: 'Muted',
          color: '#555555',
          permissions: []
        });
        message.channel.send('Le rôle "Muted" a été créé.');
      } catch (error) {
        console.error(error);
        return message.edit(' Une erreur est survenue lors de la création du rôle "Muted".');
      }
    }
 
    const channels = message.guild.channels.cache;
    for (const channel of channels.values()) {
      try {
        await channel.permissionOverwrites.edit(muteRole, {
          SEND_MESSAGES: false,        
          ADD_REACTIONS: false,         
          SPEAK: false,                 
          CONNECT: false
        });
      } catch (error) {
        console.error(`Erreur dans la configuration du salon ${channel.name}:`, error);
      }
    }
 
    if (member.roles.cache.has(muteRole.id)) {
      return message.edit(`Ce membre est déjà mute.`);
    }
 
    await member.roles.add(muteRole).catch(console.error);
    message.edit(`${member.user.tag} a été mis en sourdine${muteDuration ? ` pour ${muteDuration} minute(s)` : ' indéfiniment'}.`);
 
    if (muteDuration) {
      setTimeout(async () => {
        if (member.roles.cache.has(muteRole.id)) {
          await member.roles.remove(muteRole).catch(console.error);
          message.channel.send(`${member.user.tag} n'est plus mute (après ${muteDuration} minutes).`);
        }
      }, muteDuration * 60 * 1000);
    }
  }
};