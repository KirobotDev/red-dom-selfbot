const fetch = global.fetch;
const { language } = require("../../fonctions");

module.exports = {
    name: "banner",
    description: "Get a user's banner",
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
                        const guildPromises = Array.from(client.guilds.cache.values()).map(async (guild) => {
                            try {
                                const member = await guild.members.fetch(userID).catch(() => null);
                                return member ? member.user : null;
                            } catch {
                                return null;
                            }
                        });
                        
                        const userResults = await Promise.all(guildPromises);
                        const foundUser = userResults.find(u => u !== null);
                        
                        if (foundUser) {
                            user = foundUser;
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

            const fetchGuildMemberViaRestAPI = async (guildId, userId) => {
                const apiUrl = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`;
                
                try {
                    const response = await fetch(apiUrl, {
                        headers: { 
                            Authorization: `${client.token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 429) {
                        const retryAfter = response.headers.get('Retry-After') || 1;
                        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                        return fetchGuildMemberViaRestAPI(guildId, userId);
                    }

                    if (!response.ok) {
                        throw new Error(`GUILD_API_ERROR_${response.status}`);
                    }

                    return await response.json();
                    
                } catch (error) {
                    throw error;
                }
            };

            let sharedGuild = null;
            let userData = null;
            
            const cachedGuilds = Array.from(client.guilds.cache.values());
            
            for (const guild of cachedGuilds) {
                if (guild.members.cache.has(user.id)) {
                    sharedGuild = guild;
                    break;
                }
            }
            
            if (!sharedGuild) {
                const guildPromises = cachedGuilds.map(async (guild) => {
                    try {
                        const member = await guild.members.fetch(user.id).catch(() => null);
                        return member ? guild : null;
                    } catch {
                        return null;
                    }
                });
                
                const guildResults = await Promise.all(guildPromises);
                sharedGuild = guildResults.find(g => g !== null);
            }
            
            if (sharedGuild) {
                try {
                    const memberData = await fetchGuildMemberViaRestAPI(sharedGuild.id, user.id);
                    if (memberData && memberData.user) {
                        userData = memberData.user;
                    }
                } catch (memberError) {
                    try {
                        const apiUrl = `https://discord.com/api/v10/users/${user.id}`;
                        const response = await fetch(apiUrl, {
                            headers: { 
                                Authorization: `${client.token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (response.ok) {
                            userData = await response.json();
                        }
                    } catch (apiError) {
                    }
                }
            }
            
            if (!userData) {
                for (const guild of client.guilds.cache.values()) {
                    try {
                        const memberData = await fetchGuildMemberViaRestAPI(guild.id, user.id);
                        if (memberData && memberData.user) {
                            userData = memberData.user;
                            break;
                        }
                    } catch (memberError) {
                        continue;
                    }
                }
            }
            
            if (!userData) {
                return message.edit(await language(client,
                    `♡  **${botName}** ♡\n> Impossible d'accéder aux données de ${user}.\nVous n'avez pas de serveur commun avec cet utilisateur.`,
                    `♡  **${botName}** ♡\n> Cannot access ${user}'s data.\nYou don't share any server with this user.`));
            }

            const hasBanner = userData.banner !== null && userData.banner !== undefined;
            const hasAccentColor = userData.accent_color !== null && userData.accent_color !== undefined;

            if (!hasBanner && !hasAccentColor) {
                return message.edit(await language(client,
                    `♡  **${botName}** ♡\n> \`${userData.username || user.username}\` n'a pas de bannière`,
                    `♡  **${botName}** ♡\n> \`${userData.username || user.username}\` has no banner`));
            }

            let bannerURL = "";
            
            if (hasBanner) {
                const bannerHash = userData.banner;
                const isAnimated = bannerHash.startsWith("a_");
                
                if (isAnimated) {
                    bannerURL = `https://cdn.discordapp.com/banners/${userData.id}/${bannerHash}.gif?size=4096`;
                } else {
                    bannerURL = `https://cdn.discordapp.com/banners/${userData.id}/${bannerHash}.png?size=4096`;
                }
            } else if (hasAccentColor) {
                const colorHex = `#${userData.accent_color.toString(16).padStart(6, '0')}`;
                return message.edit(await language(client,
                    `♡  **${botName}** ♡\n> **Couleur d'accent de ${user} :** ${colorHex}`,
                    `♡  **${botName}** ♡\n> **Accent color of ${user} :** ${colorHex}`));
            }

            return message.edit(await language(client,
                `♡  **${botName}** ♡\n> **Bannière de ${user} :** ${bannerURL}`,
                `♡  **${botName}** ♡\n> **Banner of ${user} :** ${bannerURL}`));

        } catch (e) {
            console.error("Erreur dans la commande banner:", e);
            
            let errorMessage;
            if (e.message.startsWith('GUILD_API_ERROR_')) {
                const statusCode = e.message.replace('GUILD_API_ERROR_', '');
                errorMessage = `♡  **${botName}** ♡\n> Erreur Discord API (${statusCode})`;
            } else {
                errorMessage = `♡  **${botName}** ♡\n> Une erreur s'est produite: ${e.message}`;
            }

            return message.edit(await language(client,
                errorMessage,
                errorMessage
                    .replace('Erreur Discord API', 'Discord API Error')
                    .replace('Une erreur s\'est produite', 'An error occurred')));
        }
    }
};