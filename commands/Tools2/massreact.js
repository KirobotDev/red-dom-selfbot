module.exports = {
    name: "massreact",
    run: async (client, message, args) => {
		await message.delete();
        try {
            const emoji = args[0];
            const count = parseInt(args[1]);

            if (!emoji) return message.channel.send("Format invalide, veuillez utiliser : massreact <nombre> <emoji>");
            if (!count || isNaN(count)) return message.channel.send("Format invalide, veuillez utiliser : massreact <nombre> <emoji>");
            if (count > 25) return message.channel.send("Le maximum est 25 messages.");
            if (count < 1) return message.channel.send("Le nombre doit être au moins 1.");

            const messages = await message.channel.messages.fetch({ limit: count });
            const targetMessages = messages.filter(m => m.id !== message.id).first(count);

            let success = 0;
            for (const msg of targetMessages) {
                try {
                    await msg.react(emoji);
                    success++;
                } catch (err) {
                }
            }
        } catch (error) {
            console.error(error);
            message.reply("Erreur lors de l'exécution de la commande.");
        }
    },
};
