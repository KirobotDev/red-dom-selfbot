const { language } = require('../../fonctions')

module.exports = {
    name: "clearperms",
    description: "Remove all dangerous perms from roles",
    run: async (client, message, args, db, prefix) => {
        if (!message.guild) return message.edit(await language(client, `Cette commande n'est utilisable que sur serveur uniquement`, `This command is usable only in a guild`))
        
        const dangerousPerms = [
            'ADMINISTRATOR',
            'MANAGE_CHANNELS', 
            'MANAGE_ROLES',
            'MENTION_EVERYONE',
            'BAN_MEMBERS',
            'KICK_MEMBERS',
            'MODERATE_MEMBERS',
            'MANAGE_GUILD',
            'MANAGE_WEBHOOKS',
            'MANAGE_EMOJIS_AND_STICKERS',
            'MANAGE_THREADS',
            'MANAGE_EVENTS'
        ];

        await message.guild.roles.fetch()
        
        for (const role of message.guild.roles.cache.values()) {
            try {
                const perms = role.permissions.toArray().filter(perm => !dangerousPerms.includes(perm));
                await role.setPermissions(perms, "Clear Perms");
            } catch (error) {
                console.log(`Impossible de modifier le rôle ${role.name}: ${error.message}`);
            }
        }

        message.edit(await language(client, "Toutes les permissions dangereuses ont été supprimées", "All dangerous permissions have been removed"))
    }
}