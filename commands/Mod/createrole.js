module.exports = {
  name: 'createrole',
  description: 'Créer un rôle avec un nom et des permissions personnalisées',
  run: async (client, message, args) => {
    const roleName = args.shift();
    
    if (!roleName) {
      return message.channel.send('Veuillez fournir un nom pour le rôle. Exemple : &createrole [nom]');
    }

    if (!args.length) {
      const permissionsList = [
        { name: 'Administrateur', value: 'ADMINISTRATOR' },
        { name: 'Voir les logs d\'audit', value: 'VIEW_AUDIT_LOG' },
        { name: 'Gérer le serveur', value: 'MANAGE_GUILD' },
        { name: 'Gérer les rôles', value: 'MANAGE_ROLES' },
        { name: 'Gérer les salons', value: 'MANAGE_CHANNELS' },
        { name: 'Expulser des membres', value: 'KICK_MEMBERS' },
        { name: 'Bannir des membres', value: 'BAN_MEMBERS' },
        { name: 'Créer une invitation instantanée', value: 'CREATE_INSTANT_INVITE' },
        { name: 'Gérer les messages', value: 'MANAGE_MESSAGES' },
        { name: 'Voir les salons', value: 'VIEW_CHANNEL' },
        { name: 'Envoyer des messages', value: 'SEND_MESSAGES' },
        { name: 'Gérer les pseudos', value: 'MANAGE_NICKNAMES' },
        { name: 'Mentionner tout le monde', value: 'MENTION_EVERYONE' },
        { name: 'Utiliser des emojis externes', value: 'USE_EXTERNAL_EMOJIS' },
      ];

      const permissionMessage = permissionsList.map((p, index) => `${index + 1}: ${p.name}`).join('\n');
      return message.channel.send(
        `Veuillez sélectionner les permissions pour le rôle **${roleName}** en utilisant les numéros correspondants.\n\n${permissionMessage}\n\nExemple : &createrole ${roleName} 1 3 5`
      );
    }

    const permissionsList = [
      { name: 'Administrateur', value: 'ADMINISTRATOR' },
      { name: 'Voir les logs d\'audit', value: 'VIEW_AUDIT_LOG' },
      { name: 'Gérer le serveur', value: 'MANAGE_GUILD' },
      { name: 'Gérer les rôles', value: 'MANAGE_ROLES' },
      { name: 'Gérer les salons', value: 'MANAGE_CHANNELS' },
      { name: 'Expulser des membres', value: 'KICK_MEMBERS' },
      { name: 'Bannir des membres', value: 'BAN_MEMBERS' },
      { name: 'Créer une invitation instantanée', value: 'CREATE_INSTANT_INVITE' },
      { name: 'Gérer les messages', value: 'MANAGE_MESSAGES' },
      { name: 'Voir les salons', value: 'VIEW_CHANNEL' },
      { name: 'Envoyer des messages', value: 'SEND_MESSAGES' },
      { name: 'Gérer les pseudos', value: 'MANAGE_NICKNAMES' },
      { name: 'Mentionner tout le monde', value: 'MENTION_EVERYONE' },
      { name: 'Utiliser des emojis externes', value: 'USE_EXTERNAL_EMOJIS' },
    ];

    const selectedPermissions = args.map(num => {
      const index = parseInt(num) - 1;
      return permissionsList[index] ? permissionsList[index].value : null;
    }).filter(Boolean);

    if (selectedPermissions.length === 0) {
      return message.channel.send('Aucune permission valide sélectionnée.');
    }

    try {
      const role = await message.guild.roles.create({
        name: roleName,
        permissions: selectedPermissions,
        reason: `Rôle créé par ${message.author.tag}`
      });

      message.channel.send(`Le rôle **${roleName}** a été créé avec succès avec les permissions : ${args.join(', ')}.`);
    } catch (error) {
      console.error('Erreur lors de la création du rôle :', error);
      message.channel.send('Une erreur est survenue lors de la création du rôle.');
    }
  }
};