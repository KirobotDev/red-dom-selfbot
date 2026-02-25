module.exports = {
    name: 'robpronoms',
    description: 'Copie les pronoms d\'un utilisateur',
    aliases: ['getpronouns', 'pronouns'],
    run: async (client, message, args) => {
        await message.delete().catch(() => {});

        if (!args[0]) {
            return message.channel.send('Utilisation: &robpronouns <userID>');
        }

        const targetUserId = args[0];

        try {
            const targetRes = await fetch(
                `https://discord.com/api/v9/users/${targetUserId}/profile?type=popout&with_mutual_guilds=true`,
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
 
            const pronouns = targetData.user_profile?.pronouns || "";
            
            if (!pronouns) {
                return message.channel.send(`${targetData.user.username} n'a pas de pronoms définis.`);
            }

            const myProfileRes = await fetch(
                `https://discord.com/api/v9/users/@me/profile`,
                {
                    headers: {
                        "Authorization": client.token,
                        "Content-Type": "application/json"
                    }
                }
            );

            const myProfile = await myProfileRes.json();

            const updateData = {
                pronouns: pronouns
            };

            const updateRes = await fetch(
                `https://discord.com/api/v9/users/@me/profile`,
                {
                    method: 'PATCH',
                    headers: {
                        "Authorization": client.token,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updateData)
                }
            );

            if (!updateRes.ok) {
                return message.channel.send(`Erreur ${updateRes.status}`);
            }

            message.channel.send(
                `Pronoms de **${targetData.user.username}** copiés !\n` +
                `Pronoms: ${pronouns}`
            );

        } catch (err) {
            console.error(err);
            message.channel.send('Erreur: ' + err.message);
        }
    },
};