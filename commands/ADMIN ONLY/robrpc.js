const fetch = global.fetch;

module.exports = {
    name: 'robrpc',
    descriptionfr: 'Copie la RPC',
    descriptionen: 'Copy RPC',
    usage: "<ID_utilisateur>",
    run: async (client, message, args) => {
        await message.delete().catch(() => false);

        if (!args[0]) {
            return message.channel.send("Utilisation: `robrpc <ID_utilisateur>`");
        }

        const userId = args[0].replace(/[<@!>]/g, '');
        
        if (!/^\d{17,20}$/.test(userId)) {
            return message.channel.send("ID utilisateur invalide.");
        }

        const loadingMsg = await message.channel.send('Recherche...');

        try {
            
            let targetMember = null;
            let targetGuild = null;

            for (const guild of client.guilds.cache.values()) {
                try {
                    const member = guild.members.cache.get(userId) || 
                                  await guild.members.fetch(userId).catch(() => null);
                    if (member) {
                        targetMember = member;
                        targetGuild = guild;
                        break;
                    }
                } catch (e) {}
            }
 
            const targetUserId = targetMember?.user?.id || userId;
            const userName = targetMember?.user?.tag || targetUserId;

            let rpcData = targetMember?.presence;

            if (!rpcData || !rpcData.activities) {
                await loadingMsg.delete().catch(() => {});
                return message.channel.send(`Ouvrez le mp avec <@${targetUserId}> puis refaites la commande ici.`);
            }

            await loadingMsg.delete().catch(() => {});

            if (!rpcData || !rpcData.activities || rpcData.activities.length === 0) {
                return message.channel.send(`${userName} n'a pas de RPC.`);
            }

            const rpcActivities = rpcData.activities.filter(act => {
                let actType = act.type;
                if (typeof actType === 'string') {
                    const typeMap = {
                        'PLAYING': 0,
                        'STREAMING': 1,
                        'LISTENING': 2,
                        'WATCHING': 3,
                        'CUSTOM': 4,
                        'COMPETING': 5
                    };
                    actType = typeMap[actType] ?? 4;
                }
                
                const validTypes = [0, 1, 2, 3, 5];
                const isSpotify = act.name === 'Spotify' || act.id === 'spotify:1';
                
                return validTypes.includes(actType) && !isSpotify;
            });

            if (rpcActivities.length === 0) {
                return message.channel.send(`Pas de RPC à copier pour ${userName}.`);
            }

            const newActivities = rpcActivities.map(act => {
                let type = act.type;
                if (typeof type === 'string') {
                    const typeMap = {
                        'PLAYING': 0,
                        'STREAMING': 1,
                        'LISTENING': 2,
                        'WATCHING': 3,
                        'COMPETING': 5
                    };
                    type = typeMap[type] || 0;
                }
                
                return {
                    name: act.name,
                    type: type,
                    url: act.url || null,
                    state: act.state || null,
                    details: act.details || null,
                    timestamps: act.timestamps || null,
                    application_id: act.application_id || act.applicationId,
                    party: act.party || null,
                    assets: act.assets ? {
                        large_image: act.assets.large_image || act.assets.largeImage,
                        large_text: act.assets.large_text || act.assets.largeText,
                        small_image: act.assets.small_image || act.assets.smallImage,
                        small_text: act.assets.small_text || act.assets.smallText
                    } : null,
                    buttons: act.buttons || null
                };
            });

            await client.user.setPresence({ activities: newActivities });

            let response = `${rpcActivities.length} RPC de ${userName} copié.\n\n`;

            rpcActivities.forEach((act, i) => {
                const typeNames = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'];
                const typeDisplay = typeNames[act.type] || act.type;
                
                response += `${typeDisplay} ${act.name}`;
                if (act.details) response += `\n${act.details}`;
                if (act.state) response += `\n${act.state}`;
                if (i < rpcActivities.length - 1) response += '\n';
            }); 
            
            message.channel.send(response);

        } catch (error) {
            console.error("Erreur robrpc:", error);
            await loadingMsg.delete().catch(() => {});
            message.channel.send("Erreur: " + error.message);
        }
    }
};