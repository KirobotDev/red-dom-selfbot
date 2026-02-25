module.exports = {
    name: "deleteuser",
    description: "Supprime un certain nombre de messages d'un utilisateur mentionné.",
    run: async (client, message, args) => {
        try {
            // Supprimer le message de commande
            await message.delete().catch(() => false);

            // Vérifier si l'auteur a les permissions pour gérer les messages
            if (!message.member.permissions.has('MANAGE_MESSAGES')) {
                return message.channel.send("Vous n'avez pas les permissions nécessaires pour supprimer des messages.");
            }

            // Vérifier si un utilisateur est mentionné
            const userToDelete = message.mentions.users.first();
            if (!userToDelete) {
                return message.channel.send("Veuillez mentionner un utilisateur valide.");
            }

            // Vérifier si le dernier argument est un nombre
            const deleteAmount = parseInt(args[1]);
            if (isNaN(deleteAmount) || deleteAmount < 1 || deleteAmount > 100) {
                return message.channel.send("Veuillez spécifier un nombre valide de messages à supprimer (entre 1 et 100).");
            }

            let i = 0; // Compteur de suppressions

            const fetchAndDelete = async (lastMessageId = null) => {
                const options = { limit: 100 };
                if (lastMessageId) {
                    options.before = lastMessageId;
                }

                // Récupérer les messages
                const messages = await message.channel.messages.fetch(options);

                // Si aucun message n'est trouvé, on arrête
                if (messages.size === 0) {
                    return;
                }

                // Parcourir les messages récupérés
                for (const singleMessage of messages.values()) {
                    if (i >= deleteAmount) break; // Arrêter si le nombre de suppressions est atteint

                    // Vérifier si le message appartient à l'utilisateur cible
                    if (singleMessage.author.id === userToDelete.id) {
                        await singleMessage.delete().catch(() => {}); // Supprimer le message
                        i++; // Incrémenter le compteur
                    }
                }

                // Continuer la suppression si la limite n'est pas atteinte
                if (i < deleteAmount) {
                    await fetchAndDelete(messages.last().id); // Appel récursif pour continuer à supprimer
                }
            };

            // Lancer le processus de suppression
            await fetchAndDelete();

            // Message de confirmation (optionnel)
            message.channel.send(`**${i}** messages supprimés de ${userToDelete.tag}.`).then(msg => setTimeout(() => msg.delete(), 2000));
        } catch (error) {
            return message.channel.send("Utilise la commande sur un serveur bg.");
        }
    }
};
