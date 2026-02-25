const { language } = require('../../fonctions')

module.exports = {
    name: "rename",
    description: "Rename a channel",
    run: async (client, message, args, db, prefix) => {
        if (!message.guild) return message.edit(await language(client, `Cette commande est utilisable sur un serveur uniquement`, `This command is usable only in a guild`))
        if (!message.member.permissions.has("MANAGE_CHANNELS")) return message.edit(await language(client, `Permissions insuffisantes pour utiliser cette commande`, `You don't have the permissions for using this command`))

        await message.guild.channels.fetch()
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel
        
        const newName = args.slice(0).join(" ").replace(/ /g, "-")
        
        if (!newName) return message.edit(await language(client, "Veuillez spécifier un nouveau nom pour le salon", "Please specify a new name for the channel"))

        try {
            await channel.setName(newName, `Salon renommé par ${message.author.tag} (${message.author.id})`)
            
            message.edit(await language(client, 
                `Salon renommé en **${newName}** avec succès`, 
                `Channel renamed to **${newName}** successfully`
            ))
        } catch (error) {
            message.edit(await language(client, 
                "Je n'ai pas pu renommer le salon. Vérifiez mes permissions et que le nom est valide", 
                "I couldn't rename the channel. Check my permissions and that the name is valid"
            ))
        }
    }
}