module.exports = {
    name: 'robbio',
    description: 'Prend la bio d\'un utilisateur et se l\'applique',
    run: async (client, message, args) => {
        await message.delete().catch(() => {});

        if (!args[0]) {
            return message.channel.send('Utilisation: &selfbio <userID>');
        }

        const targetUserId = args[0];

        try {
            const targetRes = await fetch(
                `https://discord.com/api/v9/users/${targetUserId}/profile?type=sidebar`,
                {
                    headers: {
                        "Authorization": client.token,
                        "Content-Type": "application/json"
                    }
                }
            );

            const targetData = await targetRes.json();

            if (!targetData.user) {
                return message.channel.send('Utilisateur introuvable.');
            }

            const targetBio = targetData.user.bio || "";
            
            if (!targetBio) {
                return message.channel.send('Cet utilisateur n\'a pas de bio.');
            }

            const updateRes = await fetch(
                `https://discord.com/api/v9/users/@me/profile`,
                {
                    method: 'PATCH',
                    headers: {
                        "Authorization": client.token,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        bio: targetBio,
                        accent_color: 0,
                        pronouns: "",
                        profile_effect: null,
                        collectibles: []
                    })
                }
            );

            if (!updateRes.ok) {
                return message.channel.send('Erreur lors de la mise à jour de la bio.');
            }

            message.channel.send(
                `Bio copiée avec succès depuis **${targetData.user.username}** !\n` +
                `Nouvelle bio :\n${targetBio}`
            );

        } catch (err) {
            console.error(err);
            message.channel.send('Erreur lors de la récupération ou de la mise à jour.');
        }
    },
};