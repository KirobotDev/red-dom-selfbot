module.exports = {
    name: "owner",
    run: async (client, message, args) => {
    	await message.delete();
        let guild = args[0] ? client.guilds.cache.get(args[0]) : message.guild;
        if (!guild) return message.channel.send("Serveur introuvable ou inaccessible.");

        const owner = await guild.fetchOwner().catch(() => null);
        if (!owner) return message.channel.send("Impossible de récupérer le propriétaire.");

        message.channel.send(`Propriétaire du serveur **${guild.name}** : **${owner.user.tag}** (\`${owner.id}\`).`);
    },
};