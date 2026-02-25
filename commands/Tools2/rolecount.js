module.exports = {
    name: "rolecount",
    description: "Affiche le nombre de membres d'un rôle spécifique",
    run: async (client, message, args, db, prefix) => {

        if (!args[0]) {
            return message.edit("Veuillez fournir un ID de rôle ou mentionner un rôle.");
        }

        let roleId = args[0];
        if (roleId.startsWith('<@&') && roleId.endsWith('>')) {
            roleId = roleId.slice(3, -1);
        }

        const guild = args[1] ? client.guilds.cache.get(args[1]) : message.guild;

        if (!guild) {
            return message.edit("Serveur non trouvé.");
        }

        const role = guild.roles.cache.get(roleId);
        if (!role) {
            return message.edit("Rôle non trouvé dans ce serveur.");
        }

        try {
            await guild.members.fetch();

            const memberCount = guild.members.cache.filter(member => member.roles.cache.has(roleId)).size;

            message.edit(`Le rôle **${role.name}** a ${memberCount} membre(s).`);
        } catch (error) {
            console.error("Erreur lors de la récupération des membres :", error);
            message.edit("Une erreur s'est produite en récupérant les membres du serveur.");
        }
    }
};