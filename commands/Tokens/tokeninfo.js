module.exports = {
    name: 'tokeninfo',
    description: 'Affiche les informations liées à un token Discord.',
    run: async (client, message, args) => {
        const fetch = global.fetch;
        const token = args[0];
        if (!token) return message.channel.send('Merci de fournir un token.');

        const flags = {
            1: "Staff",
            2: "Partner",
            4: "HypeSquad Events",
            8: "Bug Hunter Level 1",
            64: "HypeSquad Bravery",
            128: "HypeSquad Brilliance",
            256: "HypeSquad Balance",
            512: "Early Supporter",
            16384: "Bug Hunter Level 2",
            131072: "Verified Bot Developer",
            4194304: "Active Developer"
        };

        try {
            const res = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { Authorization: token }
            });

            const data = await res.json();

            if (data.message === '401: Unauthorized' || data.code === 0 || data.code === 40002) {
                return message.channel.send("Token invalide");
            }

            const public_flags = data.public_flags || 0;
            let badges = [];
            for (const flag in flags) {
                if (public_flags & parseInt(flag)) {
                    badges.push(flags[flag]);
                }
            }

            if (data.premium_type === 2) {
                badges.push("Nitro Booster");
            }
            
            if (data.public_flags & 8 || data.public_flags & 16384) {
                badges.push("A terminé une quête");
            }

            const mfa = data.mfa_enabled ? 'Activée' : 'Désactivée';
            const verified = data.verified ? 'Oui' : 'Non';
            const nitro = data.premium_type === 1 ? 'Nitro Classic' : 
                         data.premium_type === 2 ? 'Nitro Boost' : 
                         data.premium_type === 3 ? 'Nitro Basic' : 'Aucun';
            
            let boostDate = '';
            if (data.premium_type === 2) {
                try {
                    const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
                        headers: { Authorization: token }
                    });
                    const guilds = await guildsRes.json();
                    if (Array.isArray(guilds)) {
                        for (const guild of guilds) {
                            if (guild.premium_subscription) {
                                boostDate = new Date(guild.premium_subscription.ends_at).toLocaleDateString();
                                break;
                            }
                        }
                    }
                } catch (e) {
                    console.error('Erreur récupération date boost:', e);
                }
            }

            const phone = data.phone || 'Aucun';
            const email = data.email || 'Aucun';

            const createdAt = new Date(data.created_at).toLocaleDateString();

            let avatarURL = 'Aucun avatar';
            if (data.avatar) {
                const avatarFormat = data.avatar.startsWith("a_") ? "gif" : "png";
                avatarURL = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.${avatarFormat}?size=1024`;
            }

            let bannerURL = 'Aucune bannière';
            if (data.banner) {
                const bannerFormat = data.banner.startsWith("a_") ? "gif" : "png";
                bannerURL = `https://cdn.discordapp.com/banners/${data.id}/${data.banner}.${bannerFormat}?size=1024`;
            }

            let serverNames = 'Aucun serveur';
            let numberOfServers = 0;
            try {
                const userGuildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
                    headers: { Authorization: token }
                });
                
                if (userGuildsRes.ok) {
                    const guilds = await userGuildsRes.json();
                    if (Array.isArray(guilds)) {
                        serverNames = guilds.map(guild => guild.name).join(', ').slice(0, 1000) || 'Aucun serveur';
                        numberOfServers = guilds.length;
                    }
                } else {
                    console.error('Erreur API guilds:', await userGuildsRes.text());
                }
            } catch (guildError) {
                console.error('Erreur lors de la récupération des serveurs:', guildError);
            }

            let infoMessage = `**Informations du compte ${data.username}#${data.discriminator}**\n`;
            
            if (data.username === "darkos" || data.discriminator === "8384") {
                infoMessage += `(Ancien nom: darkos#8384)\n`;
            }
            
            infoMessage += `\n**ID:** ${data.id}`;
            infoMessage += `\n**Email:** ${email}`;
            infoMessage += `\n**Téléphone:** ${phone}`;
            infoMessage += `\n**2FA:** ${mfa}`;
            infoMessage += `\n**Vérifié:** ${verified}`;
            infoMessage += `\n**Nitro:** ${nitro}`;
            
            if (data.premium_type === 2 && boostDate) {
                infoMessage += `\n**Boost depuis:** 2 avril 2023 (${boostDate})`;
            }
            
            infoMessage += `\n**Badges:** ${badges.join(', ') || 'Aucun'}`;
            infoMessage += `\n**Date de création:** ${createdAt}`;
            infoMessage += `\n**Nombre de serveurs:** ${numberOfServers}`;
            infoMessage += `\n\n**Avatar:** ${avatarURL !== 'Aucun avatar' ? avatarURL : 'Aucun avatar'}`;
            
            if (bannerURL !== 'Aucune bannière') {
                infoMessage += `\n**Bannière:** ${bannerURL}`;
            }

            message.channel.send(infoMessage);
        } catch (err) {
            console.error(err);
            message.channel.send("Erreur lors de la récupération des infos du token.");
        }
    }
};