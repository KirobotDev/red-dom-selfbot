const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'kickall',
    description: 'Expulse tous les membres du serveur sauf le propriétaire et ceux avec des rôles spécifiques',
    run: async (client, message, args) => {
        // Vérifier les permissions
        if (!message.member.permissions.has("KICK_MEMBERS")) {
            return message.reply("Tu n'as pas la permission d'expulser des utilisateurs.");
        }

        const owner = message.guild.ownerId; // ID du propriétaire du serveur
        const excludedRoles = ["Admin", "Modérateur"]; // Remplacer par les noms des rôles à exclure

        try {
            // Fetch tous les membres du serveur (ceux qui ne sont pas en cache seront aussi récupérés)
            const members = await message.guild.members.fetch();

            let kickCount = 0; // Compteur des utilisateurs kickés

            members.forEach(member => {
                // Ne pas expulser le propriétaire du serveur ou les membres avec les rôles exclus
                if (member.id !== owner && !member.roles.cache.some(role => excludedRoles.includes(role.name)) && member.kickable) {
                    member.kick().then(() => {
                        kickCount++;
                        message.channel.send(`Expulsion de ${member.user.tag}`);
                    }).catch(err => {
                        console.error(`Impossible d'expulser ${member.user.tag}: ${err}`);
                    });
                }
            });

            if (kickCount === 0) {
                message.channel.send("Aucun membre n'a été expulsé.");
            } else {
                message.channel.send(`Tous les utilisateurs kickables ont été expulsés. Total : ${kickCount}`);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des membres:", error);
            message.channel.send("Une erreur est survenue lors de l'expulsion des membres.");
        }
    }
};
