module.exports = {
    name: "demande2",
    description: "Commandes liées aux amis.",
    run: async (client, message, args) => {
        
        if (args.length === 0) {
            return message.channel.send("Veuillez fournir un argument : 'nombre' ou 'nickname'.");
        }

        if (args[0] === "list" || args[0] === "liste") {
            try {
                
                const outgoingRequests = client.relationships.outgoingCache;

                if (outgoingRequests.size === 0) {
                    return message.channel.send("Aucune demande d'amis en attente.");
                }

                const messageChunks = [];
                let currentMessage = "Voici la liste de vos demandes d'amis :\n"; 

                outgoingRequests.forEach((value, key) => {
                    const ami = `<@${key}>`;

                    if ((currentMessage + ami + ", ").length > 2000) {
                        messageChunks.push(currentMessage.trim());
                        currentMessage = "Voici la liste de vos demandes d'amis :\n"; 
                    }
                    currentMessage += ami + ", "; 
                });

                if (currentMessage) {
                    messageChunks.push(currentMessage.trim());
                }

                for (const chunk of messageChunks) {
                    await message.channel.send(chunk);
                }
            } catch (error) {
                console.error('Erreur lors de l\'affichage de la liste des demandes d\'amis en attente :', error);
                return message.channel.send("Une erreur est survenue lors de l'affichage de la liste des demandes d'amis en attente.");
            }
        }
    }
};
