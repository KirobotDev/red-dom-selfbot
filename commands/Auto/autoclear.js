const autoclearUsers = {};
const path = require('path');
const fs = require('fs');

module.exports = {
    name: "autoclear",
    description: "Supprime en continu les messages du bot jusqu'à arrêt",
    run: async (client, message, args) => {
        
        await message.delete()
        const senderId = message.author.id;

        if (args[0] && args[0].toLowerCase() === "stop") {
            if (!autoclearUsers[senderId]?.active) {
                return message.channel
                    .send("Aucun autoclear actif à arrêter.")
                    .catch(() => false);
            }

            autoclearUsers[senderId].active = false;
            return message.channel
                .send("Autoclear arrêté.")
                .catch(() => false);
        }

        if (autoclearUsers[senderId]?.active) {
            return message.channel
                .send("Autoclear est déjà en cours. Utilisez `&autoclear stop` pour l'arrêter.")
                .catch(() => false);
        }

        autoclearUsers[senderId] = { active: true };

        const autoclearMessage = await message.channel
            .send("Autoclear activé. Utilisez `&autoclear stop` pour arrêter.")
            .catch(() => false);

        while (autoclearUsers[senderId]?.active) {
            try {
                const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });

                const messagesToDelete = fetchedMessages.filter(msg => 
                    msg.author.id === client.user.id && 
                    msg.id !== message.id &&    
                    msg.id !== autoclearMessage?.id  
                );

                for (const [msgId, msg] of messagesToDelete) {
                    if (!autoclearUsers[senderId]?.active) break; 
                    await msg.delete().catch(err => console.error(`Impossible de supprimer : ${err}`));
                }

                if (messagesToDelete.size === 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); 
                }

            } catch (error) {
                console.error(`Erreur dans autoclear : ${error}`);
                break;
            }
        }
    },
};
