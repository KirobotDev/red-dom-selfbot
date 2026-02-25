module.exports = {
    name: "stickers",
    run: async (client, message, args) => {
    	await message.delete();
        let guild = args[0] ? client.guilds.cache.get(args[0]) : message.guild;
        if (!guild) return message.channel.send("Serveur introuvable ou inaccessible.");

        const count = guild.stickers.cache.size;
        message.channel.send(`Le serveur **${guild.name}** possède **${count}** stickers.`);
    },
};