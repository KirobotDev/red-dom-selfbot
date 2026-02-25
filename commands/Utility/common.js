module.exports = {
    name: 'common',
    description: 'Affiche les membres en commun avec un autre serveur.',
    run: async (client, message, args) => {
		await message.delete();
        if (!message.guild) return message.channel.send('Cette commande doit être exécutée sur un serveur.');
        
        const targetServerId = args[0];
        if (!targetServerId) return message.channel.send('Veuillez fournir l\'id d\'un serveur.');
        
        const clientt = message.client;
        const targetGuild = clientt.guilds.cache.get(targetServerId);
        if (!targetGuild) return message.channel.send('Id invalide ou alors t\'es pas dans le serveur.');
        
        try {
            const currentMembers = await message.guild.members.fetch();
            const targetMembers = await targetGuild.members.fetch();
            
            const commonMembers = currentMembers.filter(member => targetMembers.has(member.id) && !member.user.bot);
            const commonNames = commonMembers.map(member => `- ${member.displayName}`).join('\n');

            if (!commonNames) {
                return message.channel.send('Aucun membre en commun trouvé.');
            }

            message.channel.send(`Membres en commun :\n${commonNames}`);
        } catch (error) {
            console.error(error);
            message.channel.send('Une erreur est survenue :/.');
        }
    }
};
