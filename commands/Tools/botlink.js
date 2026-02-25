module.exports = {
    name: 'botlink',
    description: 'Génère le lien d\'invitation du bot',
    aliases: ['botlien'],
    run: async (client, message, args) => {

        message.delete().catch(console.error);

        const botId = args[0] || client.user.id;

        if (!botId) {
            return message.channel.send('Veuillez utiliser la commande de cette manière : `&botlink [id]`.')
        }

        if (!/^\d+$/.test(botId)) {
            return message.channel.send('ID de bot invalide. L\'ID doit contenir uniquement des chiffres.')
        }

        const botInviteLink = `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&integration_type=0&scope=bot`;

        message.channel.send(`**Lien d'invitation du bot** :\n${botInviteLink}`)
    },
};