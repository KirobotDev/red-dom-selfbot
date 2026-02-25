let clearingStatus = {}; // Objet pour suivre l'état de la suppression par utilisateur

module.exports = {
    name: "clearsalon",
    description: "Supprime tous vos messages dans un salon sur un serveur.",
    run: async (client, message, args) => {
        const userId = message.author.id; // ID de l'utilisateur qui exécute la commande

        // Vérifier si un ID de salon est fourni
        if (!args[0]) {
            return message.reply("Veuillez fournir l'ID du salon où vous souhaitez supprimer vos messages.");
        }

        const targetChannelId = args[0];

        // Arrêter la suppression
        if (targetChannelId === "stop") {
            if (!clearingStatus[userId] || !clearingStatus[userId].isClearing) {
                return message.reply("Aucun processus de suppression en cours.");
            }
            clearingStatus[userId].isClearing = false;
            return message.reply("La suppression des messages a été arrêtée.");
        }

        try {
            // Récupérer le salon cible
            const targetChannel = await client.channels.fetch(targetChannelId).catch(() => null);
            if (!targetChannel) {
                return message.reply("Salon non trouvé.");
            }

            let deletedCount = 0;
            let lastMessageId;

            // Initialiser l'état de suppression pour cet utilisateur
            clearingStatus[userId] = { isClearing: true };

            // Supprimer tous les messages envoyés par le bot dans le salon
            while (clearingStatus[userId]?.isClearing) {
                const fetchOptions = { limit: 100 }; // Discord limite à 100 messages par requête
                if (lastMessageId) fetchOptions.before = lastMessageId;

                const messages = await targetChannel.messages.fetch(fetchOptions);
                const myMessages = messages.filter((msg) => msg.author.id === client.user.id);

                if (myMessages.size === 0) break; // Arrêter si aucun message à supprimer n'est trouvé

                for (const msg of myMessages.values()) {
                    try {
                        await msg.delete();
                        deletedCount++;
                    } catch (err) {
                        console.error(`Erreur lors de la suppression du message : ${err}`);
                    }
                }

                lastMessageId = messages.last()?.id;
                if (messages.size < 100) break; // Arrêter si moins de 100 messages sont récupérés
            }

            if (clearingStatus[userId]?.isClearing) {
                message.reply(`J'ai supprimé ${deletedCount} de vos messages dans le salon <#${targetChannelId}>.`);
            }
        } catch (error) {
            console.error("Erreur lors de la commande clearsalon :", error);
            message.reply("Une erreur est survenue lors de l'exécution de la commande.");
        } finally {
            if (clearingStatus[userId]) {
                clearingStatus[userId].isClearing = false;
            }
        }
    },
};
