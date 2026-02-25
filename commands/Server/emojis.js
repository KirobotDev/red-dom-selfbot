module.exports = {
    name: "emojis",
    run: async (client, message, args) => {
		await message.delete();
        let guild = args[0] ? client.guilds.cache.get(args[0]) : message.guild;
        if (!guild) return message.channel.send("Serveur introuvable ou inaccessible.");

        const total = guild.emojis.cache.size;
        const animated = guild.emojis.cache.filter(e => e.animated).size;
        const staticE = total - animated;

        message.channel.send(`Le serveur **${guild.name}** possède **${total}** émojis (**${staticE}** statiques, **${animated}** animés).`);
    },
};