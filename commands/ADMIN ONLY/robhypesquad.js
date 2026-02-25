module.exports = {
    name: 'robhypesquad',
    description: "Copie la maison HypeSquad d'un utilisateur",
    aliases: ['robhype'],
    run: async (client, message, args) => {
        await message.delete().catch(() => {});

        if (!args[0]) {
            return message.channel.send('Utilisation: &robhypesquad <userID>');
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

            const user = targetData.user;
            
            let house = null;
            let houseName = 'Aucune';

            if (targetData.badges) {
                const houseBadge = targetData.badges.find(b => 
                    b.id === 'hypesquad_house_1' || 
                    b.id === 'hypesquad_house_2' || 
                    b.id === 'hypesquad_house_3'
                );

                if (houseBadge) {
                    switch(houseBadge.id) {
                        case 'hypesquad_house_1':
                            house = 1;
                            houseName = 'Bravery';
                            break;
                        case 'hypesquad_house_2':
                            house = 2;
                            houseName = 'Brilliance';
                            break;
                        case 'hypesquad_house_3':
                            house = 3;
                            houseName = 'Balance';
                            break;
                    }
                }
            }

            if (!house) {
                const publicFlags = user.public_flags || 0;
                if (publicFlags & 64) {
                    house = 1;
                    houseName = 'Bravery';
                } else if (publicFlags & 128) {
                    house = 2;
                    houseName = 'Brilliance';
                } else if (publicFlags & 256) {
                    house = 3;
                    houseName = 'Balance';
                }
            }

            if (!house) {
                return message.channel.send(`${user.username} n'a pas de maison HypeSquad.`);
            }

            const updateRes = await fetch(
                `https://discord.com/api/v9/hypesquad/online`,
                {
                    method: 'POST',
                    headers: {
                        "Authorization": client.token,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        house_id: house
                    })
                }
            );

            if (!updateRes.ok) {
                const error = await updateRes.text();
                return message.channel.send(`Erreur ${updateRes.status}: Impossible de changer la maison.`);
            }

            const houses = {
                1: 'Bravery',
                2: 'Brilliance',
                3: 'Balance'
            };

            message.channel.send(`Maison HypeSquad de **${user.username}** copiée !\nNouvelle maison: **${houses[house]}**`);

        } catch (err) {
            console.error(err);
            message.channel.send('Erreur: ' + err.message);
        }
    },
};