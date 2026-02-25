module.exports = {
    name: "boosts",
    run: async (client, message, args) => {
    	await message.delete();
        let guild = args[0] ? client.guilds.cache.get(args[0]) : message.guild;
        if (!guild) return message.channel.send("Serveur introuvable ou inaccessible.");

        const boosts = guild.premiumSubscriptionCount || 0;
        const level = guild.premiumTier || 0;

        message.channel.send(`Le serveur **${guild.name}** a **${boosts}** boosts (niveau **${level}**).`);
    },
};