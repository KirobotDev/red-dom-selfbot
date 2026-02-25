module.exports = {
    name: 'test',
    description: 'Commande de test pour vérifier que le selfbot fonctionne.',
    run: async (client, message, args) => {
        await message.delete(); 

        message.channel.send('Test réussi !');
    },
};
