const fetch = global.fetch
const { language } = require("../../fonctions");

module.exports = {
    name: "avatar",
    description: "Get a user's avatar",
    usage: "<membre>",
    run: async (client, message, args) => {
        const botName = "Reddom";
        
        try {
            let user;

            if (args.length > 0) {
                const mention = args[0];
                const userID = mention.replace(/\D/g, '');
 
                if (userID) { 
                    user = client.users.cache.get(userID);
                     
                    if (!user) {
                        try {
                            user = await client.users.fetch(userID);
                        } catch (fetchError) { 
                        }
                    }
                     
                    if (!user) { 
                        for (const guild of client.guilds.cache.values()) {
                            try {
                                const member = await guild.members.fetch(userID).catch(() => null);
                                if (member) {
                                    user = member.user;
                                    break;
                                }
                            } catch (guildError) { 
                            }
                        }
                    }
                     
                    if (!user) { 
                        if (!mention.startsWith('<@')) {
                            const searchTerm = mention.toLowerCase();
                             
                            const foundUser = client.users.cache.find(u => 
                                u.username.toLowerCase().includes(searchTerm) ||
                                u.tag.toLowerCase().includes(searchTerm)
                            );
                            
                            if (foundUser) {
                                user = foundUser;
                            }
                        }
                    }
                }

                if (!user) {
                    return message.edit(await language(client,
                        `♡  **${botName}** ♡\n> Utilisateur introuvable.\nEssayez avec une mention complète (@utilisateur) ou un ID d'utilisateur.`,
                        `♡  **${botName}** ♡\n> User not found.\nTry with a full mention (@user) or a user ID.`));
                }
            } else {
                user = message.author;
            }
 
            let avatarURL;
             
            if (message.guild && user.id !== message.author.id) {
                try {
                    const member = await message.guild.members.fetch(user.id).catch(() => null);
                    if (member && member.avatar) {
                        const format = member.avatar.startsWith("a_") ? "gif" : "png";
                        avatarURL = `https://cdn.discordapp.com/guilds/${message.guild.id}/users/${user.id}/avatars/${member.avatar}.${format}?size=4096`;
                    }
                } catch (e) { 
                }
            }
             
            if (!avatarURL) {
                avatarURL = user.displayAvatarURL({ 
                    dynamic: true, 
                    size: 4096,
                    format: user.avatar?.startsWith("a_") ? "gif" : "png"
                });
            }

            return message.edit(await language(client,
                `♡  **${botName}** ♡\n> **Avatar de ${user} :** ${avatarURL}`,
                `♡  **${botName}** ♡\n> **Avatar of ${user} :** ${avatarURL}`));

        } catch (e) {
            console.error("Erreur dans la commande avatar:", e);
            return message.edit(await language(client,
                `♡  **${botName}** ♡\n> Une erreur s'est produite.\nAssurez-vous que l'utilisateur existe et est accessible.`,
                `♡  **${botName}** ♡\n> An error occurred.\nMake sure the user exists and is accessible.`));
        }
    }
};