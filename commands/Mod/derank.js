module.exports = {
    name: "derank",
    description: "Enlève tous les rôles d'un utilisateur mentionné.",
    run: async (client, message, args) => {
        if (message.mentions.members.size === 0) {
            return message.edit("Veuillez mentionner l'utilisateur.");
        }

        const member = message.mentions.members.first();

        try {
            const rolesToRemove = member.roles.cache.filter(role => role.id !== message.guild.id);
            
            for (const role of rolesToRemove.values()) {
                await member.roles.remove(role).catch(console.error);
            }

            message.edit(`Tous les rôles ont été enlevés de \`${member.user.tag}.\``);
        } catch (error) {
            console.error(error);
            message.edit(`Error Syntaxe`);
        }
    }
};