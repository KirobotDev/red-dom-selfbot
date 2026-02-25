module.exports = {
    name: 'membres',
    run: async (client, message, args) => { 
        await message.delete().catch(() => {});
 
        if (!message.guild) {
            return message.channel.send("Cette commande ne peut être utilisée que dans un serveur.");
        }
 
        message.channel.send(`Nombre de membres : **${message.guild.memberCount}**`);
    }
};
