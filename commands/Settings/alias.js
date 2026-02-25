module.exports = {
    name: 'alias',
    description: 'Affiche tous les aliases des commandes',
    aliases: ['aliases'],
    run: async (client, message, args) => {
        message.delete().catch(console.error);

        const commands = Array.from(client.commands.values())
            .filter(cmd => cmd.aliases && cmd.aliases.length > 0)
            .sort((a, b) => a.name.localeCompare(b.name));

        if (commands.length === 0) {
            return message.channel.send('❌ Aucun alias trouvé.') 
        }
 
        let response = '```md\n';
        response += '📋 ALIASES DES COMMANDES\n\n';
        
        commands.forEach(cmd => {
            response += `• ${cmd.name.padEnd(15)} → ${cmd.aliases.join(', ')}\n`;
        });

        response += '```';

        message.channel.send(response) 
    },
};