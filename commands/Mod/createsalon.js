module.exports = {
  name: 'createsalon',
  description: 'Créer un salon avec un nom donné dans une catégorie spécifiée.',
  run: async (client, message, args, db) => {
    if (!message.guild) {
      return message.channel.send('Cette commande doit être utilisée dans un serveur.');
    }

    if (args[0] === 'list' || args[0] === 'categories') {
      const categories = message.guild.channels.cache.filter(ch => 
        ch.type === 'GUILD_CATEGORY' || ch.type === 4
      );
      
      if (categories.size === 0) {
        return message.channel.send('Aucune catégorie trouvée dans ce serveur.');
      }
      
      const categoryList = categories.map(cat => 
        `• **${cat.name}** (ID: \`${cat.id}\`)`
      ).join('\n');
      
      return message.channel.send(`**Catégories disponibles (${categories.size}) :**\n${categoryList}`);
    }

    if (args.length === 0) {
      return message.channel.send(
        `Usage: ${db.prefix}createsalon <nom du salon> ou ${db.prefix}createsalon <id_catégorie> <nom du salon>\n
        Pour lister les catégories: {db.prefix}createsalon list`
      );
    }

    let categorie = null;
    let salonNom;

    const possibleCategoryId = args[0];
    const isPossibleId = /^\d{17,20}$/.test(possibleCategoryId);

    if (isPossibleId && args.length > 1) {
      categorie = message.guild.channels.cache.get(possibleCategoryId);
      
      if (categorie) {
        const isCategory = categorie.type === 'GUILD_CATEGORY' || categorie.type === 4;
        
        if (!isCategory) {
          return message.channel.send(
            `\`${possibleCategoryId}\` n'est pas une catégorie. C'est un **${categorie.name}** (type: ${categorie.type}).\n` +
            `Utilisez \`&createsalon list\` pour voir les catégories disponibles.`
          );
        }
        salonNom = args.slice(1).join(' ');
      } else {
        return message.channel.send(
          `Aucun salon/catégorie trouvé avec l'ID \`${possibleCategoryId}\`.\n` +
          `Utilisez \`&createsalon list\` pour voir les catégories disponibles.`
        );
      }
    } else {
      salonNom = args.join(' ');
    }

    if (!salonNom.trim()) {
      return message.channel.send('Veuillez fournir un nom valide pour le salon.');
    }

    if (salonNom.length > 100) {
      return message.channel.send('Le nom du salon ne peut pas dépasser 100 caractères.');
    }

    try {
      const salon = await message.guild.channels.create(salonNom.trim(), {
        type: 'GUILD_TEXT',
        parent: categorie ? categorie.id : undefined
      });

      message.channel.send(`Salon **${salon.name}** créé${categorie ? ` dans la catégorie **${categorie.name}**` : ''}.`);
    } catch (error) {
      message.channel.send(`Erreur: ${error.message || 'Impossible de créer le salon'}`);
    }
  }
};