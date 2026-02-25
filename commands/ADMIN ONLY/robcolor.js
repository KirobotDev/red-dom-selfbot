module.exports = {
    name: 'robcolor',
    description: 'Copie la couleur d\'accent/bannière d\'un utilisateur',
    aliases: ['getcolor', 'copycolor', 'accent'],
    run: async (client, message, args) => {
        await message.delete().catch(() => {});

        if (!args[0]) {
            return message.channel.send('Utilisation: &robcolor <userID>');
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

            const accentColor = targetData.user.accent_color || targetData.user.accentColor || 0;
            
            if (!accentColor || accentColor === 0) {
                return message.channel.send(`${targetData.user.username} n'a pas de couleur d'accent.`);
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

            const updateData = {
                accent_color: accentColor
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

            const hexColor = '#' + accentColor.toString(16).padStart(6, '0');
            
            message.channel.send(
                `Couleur de bannière de **${targetData.user.username}** copiée !\n` +
                `Couleur: ${hexColor} (${accentColor})`
            );

        } catch (err) {
            console.error(err);
            message.channel.send('Erreur: ' + err.message);
        }
    },
};