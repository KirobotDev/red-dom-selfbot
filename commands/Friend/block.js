module.exports = {
    name: 'block',
    description: 'Bloque un utilisateur.',
    run: async (client, message, args) => {
        const user = message.mentions.users.first();

        if (!user) {
            return message.channel.send("Veuillez mentionner un utilisateur à bloquer.");
        }

        try {
            const success = await client.relationships.addBlocked(user.id);

            if (success) {
                return message.edit(`Vous avez bloqué ${user.tag}.`);
            } else {
                return message.channel.send("Cet utilisateur est déjà bloqué.");
            }
        } catch (error) {
            console.error('Erreur lors du blocage de l\'utilisateur :', error);
            return message.channel.send("Une erreur est survenue lors du blocage de l'utilisateur.");
        }
    },
};
