module.exports = {
    name: 'reaction',
    description: 'Ajoute des réactions avec les emojis des indicateurs régionaux pour un texte donné.',
    run: async (client, message, args) => {

                    // Supprime le message de commande après avoir ajouté les réactions
                    await message.delete();
        try {
            if (!args.length) {
                return message.channel.send("Veuillez fournir un texte à convertir en réactions.");
            }

            // Récupère les messages du canal, le paramètre 2 limite la récupération à 2 messages
            const messages = await message.channel.messages.fetch({ limit: 2 });

            // Le premier message est toujours celui de la commande actuelle, donc on prend le second
            const lastMessage = messages.find(m => m.id !== message.id);

            if (!lastMessage) {
                return message.channel.send('Impossible de trouver votre dernier message.').then(msg => {
                    setTimeout(() => msg.delete(), 5000); // Supprime le message d'erreur après 5 secondes
                });
            }

            const text = args.join(" ").toUpperCase();
            const regionalIndicatorStart = 127462; // Code Unicode pour 🇦
            const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

            // Ajoute les réactions au texte
            for (const char of text) {
                if (/[A-Z]/.test(char)) {
                    const emoji = String.fromCodePoint(regionalIndicatorStart + char.charCodeAt(0) - 65);
                    await lastMessage.react(emoji).catch(console.error);
                } else if (char === " ") {
                    continue; // Ignore les espaces
                } else {
                    return message.channel.send("Seules les lettres et les espaces sont acceptés.").then(msg => {
                        setTimeout(() => msg.delete(), 5000); // Supprime le message d'erreur après 5 secondes
                    });
                }
                await delay(100); // Ajoute un petit délai pour éviter les limitations de l'API
            }

        } catch (error) {
            console.error('Erreur lors de l\'ajout des réactions :', error);
            message.channel.send('Une erreur est survenue lors de l\'ajout des réactions.').then(msg => {
                setTimeout(() => msg.delete(), 5000); // Supprime le message d'erreur après 5 secondes
            });
        }
    },
};
