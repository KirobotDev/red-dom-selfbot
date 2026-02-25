const Discord = require("discord.js");

module.exports = {
    name: "edit",
    description: "Modifie un certain nombre de vos messages précédents dans le canal actuel",
    run: async (client, message, args) => {
        await message.delete()
        if (message.author.id !== client.user.id) return;

        const numberOfMessages = parseInt(args[0]);
        const newText = args.slice(1).join(" ");

        if (!numberOfMessages || isNaN(numberOfMessages) || numberOfMessages <= 0) {
            return message.channel.send("Veuillez spécifier un nombre valide de messages à modifier.");
        }

        if (!newText) {
            return message.channel.send("Veuillez fournir le texte de remplacement.");
        }

        // Récupérer les derniers messages de l'utilisateur dans le canal
        const messages = await message.channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(msg => msg.author.id === client.user.id).first(numberOfMessages);

        // Éditer les messages
        for (const userMessage of userMessages) {
            await userMessage.edit(newText).catch(console.error);
        }
    }
};
