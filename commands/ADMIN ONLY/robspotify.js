const { SpotifyRPC } = require("safeness-sb-new");
const fetch = global.fetch;

module.exports = {
    name: 'robspotify',
    descriptionfr: 'Copie l\'activité Spotify',
    descriptionen: 'Copy Spotify activity',
    usage: "<ID_utilisateur>",
    run: async (client, message, args) => {
        await message.delete().catch(() => false);

        if (!args[0]) {
            return message.channel.send("Utilisation: `robspotify <ID_utilisateur>`");
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
                return message.channel.send(`Ouvrez le mp avec <@${targetUserId}> puis refaites la commande.`);
            }

            await loadingMsg.delete().catch(() => {});

            if (!rpcData || !rpcData.activities || rpcData.activities.length === 0) {
                return message.channel.send(`${userName} n'a pas d'activité.`);
            }

            const spotifyActivity = rpcData.activities.find(act => {
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
                    actType = typeMap[actType] ?? -1;
                }
                
                const isListening = actType === 2;
                const isSpotify = act.name === 'Spotify' || act.id === 'spotify:1';
                
                return isListening && isSpotify;
            });

            if (!spotifyActivity) {
                return message.channel.send(`${userName} n'écoute pas Spotify.`);
            }

            const spotify = new SpotifyRPC(client);

            if (spotifyActivity.details) {
                spotify.setDetails(spotifyActivity.details);
            }

            if (spotifyActivity.state) {
                spotify.setState(spotifyActivity.state);
            }

            if (spotifyActivity.assets?.largeText) {
                spotify.setAssetsLargeText(spotifyActivity.assets.largeText);
            }

            if (spotifyActivity.assets?.largeImage) {
                spotify.setAssetsLargeImage(spotifyActivity.assets.largeImage);
            }

            spotify.setAssetsSmallImage("spotify:");
            spotify.setAssetsSmallText("Spotify");

            if (spotifyActivity.syncId) {
                spotify.setSongId(spotifyActivity.syncId);
            }

            if (spotifyActivity.timestamps) {
                if (spotifyActivity.timestamps.start) {
                    spotify.setStartTimestamp(spotifyActivity.timestamps.start);
                }
                if (spotifyActivity.timestamps.end) {
                    spotify.setEndTimestamp(spotifyActivity.timestamps.end);
                }
            }

            const currentActivities = client.user.presence?.activities.filter(activity => {
                return activity.name !== 'Custom Status' && 
                       !(activity.constructor?.name === 'SpotifyRPC') &&
                       activity.name !== 'Spotify';
            }) || [];

            const newActivities = [...currentActivities, spotify];

            await client.user.setPresence({
                activities: newActivities,
                status: client.user.presence?.status || 'online'
            });

            let response = `Spotify de ${userName} copié.\n\n`;
            
            response += `🎵 ${spotifyActivity.details}\n`;
            response += `👤 ${spotifyActivity.state}\n`;
            
            if (spotifyActivity.assets?.largeText) {
                response += `💿 ${spotifyActivity.assets.largeText}\n`;
            }
             
            if (spotifyActivity.timestamps?.start && spotifyActivity.timestamps?.end) {
                const total = Math.floor((spotifyActivity.timestamps.end - spotifyActivity.timestamps.start) / 1000);
                const current = Math.floor((Date.now() - spotifyActivity.timestamps.start) / 1000);
                
                const totalMinutes = Math.floor(total / 60);
                const totalSeconds = total % 60;
                
                const currentMinutes = Math.floor(current / 60);
                const currentSeconds = current % 60;
                
                response += `⏱️ ${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}\n`;
            }
            
            if (spotifyActivity.syncId) {
                response += `🔗 https://open.spotify.com/track/${spotifyActivity.syncId}`;
            }

            message.channel.send(response);

        } catch (error) {
            console.error("Erreur robspotify:", error);
            await loadingMsg.delete().catch(() => {});
            message.channel.send("Erreur: " + error.message);
        }
    }
};