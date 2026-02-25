let clearingStatus = {}; 

module.exports = {
    name: "cleardm",
    description: "Supprime tous vos messages envoyés dans les DM avec un utilisateur spécifique.",
    run: async (client, message, args) => {
        const userId = message.author.id;

        if (args[0] === "stop") {
            if (!clearingStatus[userId] || !clearingStatus[userId].isClearing) {
                return message.reply("Aucun processus de suppression en cours.");
            }
            clearingStatus[userId].isClearing = false; 
            return message.reply("La suppression des messages a été arrêtée.");
        }

        const targetUserId = args[0]; 

        if (!targetUserId) {
            return message.reply("Veuillez fournir l'ID de l'utilisateur pour supprimer vos messages dans les DMs.\nUtilisation : `&cleardm <id_utilisateur> [nombre]`");
        }

        let messageLimit = null;
        if (args[1] && !isNaN(args[1]) && parseInt(args[1]) > 0) {
            messageLimit = parseInt(args[1]);
        }

        try {
            const user = await client.users.fetch(targetUserId);

            if (!user) {
                return message.reply("Utilisateur introuvable.");
            }

			message.edit("En cours de suppression des messages...");
            const dmChannel = await user.createDM();
            let deletedCount = 0;
            let lastMessageId;

            if (!clearingStatus[userId]) {
                clearingStatus[userId] = {};
            }

            clearingStatus[userId].isClearing = true;

            while (clearingStatus[userId]?.isClearing) {
                const fetchOptions = { limit: 100 }; 
                if (lastMessageId) fetchOptions.before = lastMessageId;

                const messages = await dmChannel.messages.fetch(fetchOptions);
                const myMessages = messages.filter((msg) => msg.author.id === client.user.id);

                if (myMessages.size === 0) break; 

                for (const msg of myMessages.values()) {
                    if (!clearingStatus[userId]?.isClearing) break;
                    
                    if (messageLimit && deletedCount >= messageLimit) {
                        clearingStatus[userId].isClearing = false;
                        break;
                    }

                    try {
                        await msg.delete();
                        deletedCount++;
                        
                        if (messageLimit && deletedCount >= messageLimit) {
                            clearingStatus[userId].isClearing = false;
                            break;
                        }
                    } catch (err) {
                        console.error(`Erreur lors de la suppression du message : ${err}`);
                    }
                }

                lastMessageId = messages.last()?.id;

                if (messages.size < 100) break;
            }

            if (clearingStatus[userId]?.isClearing) {
                const limitText = messageLimit ? ` ${deletedCount}/${messageLimit}` : ` ${deletedCount}`;
                message.reply(`J'ai supprimé${limitText} de vos messages dans vos DMs avec <@${targetUserId}>.`);
            } else if (!clearingStatus[userId]?.isClearing && deletedCount > 0) {
                const limitText = messageLimit ? ` ${deletedCount}/${messageLimit}` : ` ${deletedCount}`;
                message.reply(`Suppression terminée. J'ai supprimé${limitText} de vos messages dans vos DMs avec <@${targetUserId}>.`);
            }
        } catch (error) {
            console.error("Erreur lors de la commande cleardm :", error);
            message.reply("Une erreur est survenue lors de l'exécution de la commande.");
        } finally {
            if (clearingStatus[userId]) {
                clearingStatus[userId].isClearing = false;
            }
        }
    },
};