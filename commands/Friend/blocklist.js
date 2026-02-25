module.exports = {
    name: 'blocklist',
    description: 'Affiche la liste des utilisateurs bloqués.',
    run: async (client, message) => {
        try {
            
            const blockedUsers = client.relationships.blockedCache;

            if (blockedUsers.size === 0) {
                return message.channel.send("Aucun utilisateur n'est actuellement bloqué.");
            }

            const blockedList = blockedUsers
                .map((value, key) => `<@${key}>`)
                .join(', ');

            return message.channel.send(`Utilisateurs bloqués : ${blockedList}`);
        } catch (error) {
            console.error('Erreur lors de l\'affichage de la liste des utilisateurs bloqués :', error);
            return message.channel.send("Une erreur est survenue lors de l'affichage de la liste des utilisateurs bloqués.");
        }
    },
};
