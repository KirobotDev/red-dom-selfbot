module.exports = {
    name: 'robtag',
    description: 'Prend le tag de clan d\'un utilisateur et se l\'applique',
    run: async (client, message, args) => {
        await message.delete().catch(() => {});

        if (!args[0]) {
            return message.channel.send('Utilisation: &robtag <userID>');
        }

        const targetUserId = args[0];

        try {
            
            const targetRes = await fetch(
                `https://discord.com/api/v9/users/${targetUserId}/profile?type=sidebar&with_mutual_guilds=true`,
                {
                    headers: {
                        "Authorization": client.token,
                        "Content-Type": "application/json"
                    }
                }
            );

            const targetData = await targetRes.json();

            if (!targetData.user) {
                return message.channel.send('❌ Utilisateur introuvable.');
            }
 
            const clanInfo = targetData.user.clan || targetData.user.primary_guild;
            
            if (!clanInfo || !clanInfo.identity_guild_id || !clanInfo.tag) {
                return message.channel.send(`❌ ${targetData.user.username} n'a pas de tag de clan actif.`);
            }

            const clanTag = clanInfo.tag;
            const guildId = clanInfo.identity_guild_id;
 
            const myProfileRes = await fetch(
                `https://discord.com/api/v9/users/@me`,
                {
                    headers: {
                        "Authorization": client.token,
                        "Content-Type": "application/json"
                    }
                }
            );

            const myProfile = await myProfileRes.json();
 
            const updateRes = await fetch(
                `https://discord.com/api/v9/users/@me/clan`,
                {
                    method: 'PUT',
                    headers: {
                        "Authorization": client.token,
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0"
                    },
                    body: JSON.stringify({
                        identity_guild_id: guildId,
                        identity_enabled: true
                    })
                }
            );

            if (!updateRes.ok) {
                const error = await updateRes.text();
                return message.channel.send(`❌ Erreur ${updateRes.status}: Impossible d'appliquer le tag. Vérifie que tu as bien accès à ce serveur.`);
            }
 
            message.channel.send({
                content: `Tag de **${targetData.user.username}** copié !`,
                embeds: [{
                    color: 0x5865F2,
                    title: `Tag: ${clanTag}`,
                    description: `Le tag a été appliqué à ton profil.`,
                    fields: [
                        { name: "Tag", value: clanTag, inline: true },
                        { name: "ID du serveur", value: guildId, inline: true }
                    ],
                    footer: { text: "Utilise &multitag pour gérer la rotation des tags" }
                }]
            });

        } catch (err) {
            console.error(err);
            message.channel.send('❌ Erreur: ' + err.message);
        }
    },
};