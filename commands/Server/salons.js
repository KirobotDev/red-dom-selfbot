module.exports = {
    name: "salons",
    run: async (client, message, args) => {
		await message.delete();
        
        try {
            let guild;

            if (args[0]) {
                guild = client.guilds.cache.get(args[0]);
                if (!guild) return message.channel.send("Serveur introuvable ou inaccessible.");
            } else {
                if (!message.guild) return message.channel.send("Cette commande doit être utilisée dans un serveur.");
                guild = message.guild;
            }

            const salonCount = guild.channels.cache.size;
            message.channel.send(`Le serveur **${guild.name}** possède **${salonCount}** salons.`);
        } catch (error) {
            console.error(error);
            message.channel.send("Erreur lors de la récupération des salons.");
        }
    },
};