module.exports = {
    name: 'unblock',
    description: 'Debloque un utilisateur.',
    run: async (client, message, args) => {
        
        const user = message.mentions.users.first();

        if (!user) {
            return message.channel.send("Veuillez mentionner un utilisateur à débloquer.");
        }

        try {
            
            const success = await client.relationships.deleteBlocked(user.id); 

            if (success) {
                return message.channel.send(`Vous avez débloqué ${user.tag}.`);
            } else {
                return message.channel.send("Cet utilisateurn'est pas bloqué.");
            }
        } catch (error) {
            console.error('Erreur lors du deblocage de l\'utilisateur :', error);
            return message.channel.send("Une erreur est survenue lors du deblocage de l'utilisateur.");
        }
    },
};
