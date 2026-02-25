module.exports = {
  name: "permc",
  description: "Gérer les permissions d'un salon pour le rôle @everyone",
  run: async (client, message, args) => {
    const channel = message.channel;
    const guild = message.guild;

    const everyoneRoleId = guild.roles.cache.find(role => role.name === '@everyone').id;

    const role = guild.roles.cache.get(everyoneRoleId);
    if (!role) {
      return message.edit("Rôle @everyone non trouvé.");
    }

    const permissions = channel.permissionsFor(role).serialize();
    const permissionNames = {
      VIEW_CHANNEL: "Voir le salon",
      MANAGE_CHANNELS: "Gérer le salon",
      MANAGE_WEBHOOKS: "Gérer les webhooks",
      CREATE_INSTANT_INVITE: "Créer une invitation",
      SEND_MESSAGES: "Envoyer des messages",
      SEND_MESSAGES_IN_THREADS: "Envoyer des messages dans un fil",
      CREATE_PUBLIC_THREADS: "Créer des fils publics",
      CREATE_PRIVATE_THREADS: "Créer des fils privés",
      EMBED_LINKS: "Intégrer des liens",
      ATTACH_FILES: "Joindre des fichiers",
      ADD_REACTIONS: "Ajouter des réactions",
      USE_EXTERNAL_EMOJIS: "Utiliser des emojis externes",
      USE_EXTERNAL_STICKERS: "Utiliser des autocollants externes",
      MENTION_EVERYONE: "Mentionner everyone, here et tous les rôles",
      MANAGE_MESSAGES: "Gérer les messages",
      READ_MESSAGE_HISTORY: "Voir les anciens messages",
      SPEAK: "Parler",
      CONNECT: "Se connecter",
      USE_APPLICATION_COMMANDS: "Utiliser les commandes de l'application",
    };

    let response = `Permissions pour le rôle \`${role.name}\` dans ce salon:\n`;
    Object.entries(permissionNames).forEach(([key, name], index) => {
      const status = permissions[key] ? ':white_check_mark:' : ':x:';
      response += `${index + 1}. ${status} ${name}\n`;
    });

    response += "\nVeuillez choisir une ou plusieurs permissions en utilisant les numéros correspondants, suivis de 'vert' ou 'rouge'.";

    const initialMessage = await message.edit(response);

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { time: 60000 });

    collector.on('collect', async m => {
      const input = m.content.split(' ');

      if (input.length < 2) return;

      const numbers = input.slice(1, -1).map(num => parseInt(num)).filter(num => !isNaN(num));
      const color = input[input.length - 1].toLowerCase();

      if (!numbers.length || (color !== 'vert' && color !== 'rouge')) return;

      const permissionFlags = Object.keys(permissionNames);
      const permissionOverwrites = {};

      for (const number of numbers) {
        const permissionKey = permissionFlags[number - 1];
        if (permissionKey) {
          permissionOverwrites[permissionKey] = (color === 'vert'); 
        }
      }

      try {
        await channel.permissionOverwrites.edit(role, permissionOverwrites);
        
        message.channel.send(`Permissions mises à jour pour le rôle \`${role.name}\`.`);
      } catch (error) {
        console.error(error);
      }

      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.channel.send("Aucune permission n'a été mise à jour.");
      }
    });
  }
};