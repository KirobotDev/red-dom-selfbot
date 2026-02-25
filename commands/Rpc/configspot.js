const { SpotifyRPC, RichPresence } = require("safeness-sb-new");
const chalk = require('chalk');
const { savedb, language } = require("../../fonctions");

module.exports = {
    name: "configspot",
    description: "Configurer votre présence Spotify avec gestion des erreurs",
    aliases: ["spotify", "spoti", "spot", "configspotify", "configspoti"],
    run: async (client, message, args, db) => {
        try {
            async function updateSpotify() {
                try {
                    const spotify = new SpotifyRPC(client)
                        .setAssetsLargeImage(db.spotifylargeimage || "spotify:default")
                        .setAssetsSmallImage(db.spotifysmallimage || "spotify:default");

                    if (db.spotifyalbumname) spotify.setAssetsLargeText(db.spotifyalbumname);
                    if (db.spotifyartists) spotify.setState(db.spotifyartists);
                    if (db.spotifysongname) spotify.setDetails(db.spotifysongname);

                    spotify.setStartTimestamp(Date.now());
                    if (db.spotifyendtimestamp) {
                        spotify.setEndTimestamp(Date.now() + db.spotifyendtimestamp);
                    }

                    if (db.spotifysongid) spotify.setSongId(db.spotifysongid);
                    if (db.spotifyalbumid) spotify.setAlbumId(db.spotifyalbumid);
                    if (db.spotifyartistids && Array.isArray(db.spotifyartistids)) {
                        spotify.setArtistIds(...db.spotifyartistids);
                    }

                    db.spotifyonoff = 'on';

                    const currentActivities = client.user.presence.activities.filter(activity => {
                        return activity.name !== 'Custom Status' && 
                               !(activity.constructor.name === 'SpotifyRPC');
                    });
                    
                    const newActivities = [...currentActivities, spotify];
                    
                    await client.user.setPresence({
                        activities: newActivities,
                        status: client.user.presence.status
                    });
                    
                    await savedb(client, db);

                } catch (spotifyError) {
                    console.error("Erreur critique dans updateSpotify:", spotifyError);
                    message.edit("Erreur lors de la mise à jour de Spotify");
                }
            }

            if (!args[0]) {
                return message.edit(`
**Guide d'utilisation du Config Spotify**:

\`${db.prefix}configspot song <nom>\` - Définit le nom du morceau
\`${db.prefix}configspot artists <artistes>\` - Définit les artistes
\`${db.prefix}configspot album <nom>\` - Définit l'album
\`${db.prefix}configspot largeimage <id>\` - Image large (cover album)
\`${db.prefix}configspot smallimage <id>\` - Image petite (logo)
\`${db.prefix}configspot songid <id>\` - ID du morceau
\`${db.prefix}configspot albumid <id>\` - ID de l'album
\`${db.prefix}configspot artistids <id1,id2,...>\` - IDs des artistes
\`${db.prefix}configspot duration <secondes>\` - Durée du morceau
\`${db.prefix}configspot on/off\` - Active ou désactive SpotifyRPC

Pour supprimer un élément: \`${db.prefix}configspot <élément> delete\`
`);
            }

            switch (args[0].toLowerCase()) {
                case "song":
                    db.spotifysongname = args[1]?.toLowerCase() === "delete" ? "" : args.slice(1).join(" ");
                    await savedb(client, db);
                    await updateSpotify();
                    message.edit(`Nom du morceau ${db.spotifysongname ? "mis à jour" : "supprimé"}`);
                    break;

                case "artists":
                    db.spotifyartists = args[1]?.toLowerCase() === "delete" ? "" : args.slice(1).join(" ");
                    await savedb(client, db);
                    await updateSpotify();
                    message.edit(`Artistes ${db.spotifyartists ? "mis à jour" : "supprimés"}`);
                    break;

                case "album":
                    db.spotifyalbumname = args[1]?.toLowerCase() === "delete" ? "" : args.slice(1).join(" ");
                    await savedb(client, db);
                    await updateSpotify();
                    message.edit(`Album ${db.spotifyalbumname ? "mis à jour" : "supprimé"}`);
                    break;

                case "largeimage":
                    db.spotifylargeimage = args[1]?.toLowerCase() === "delete" ? "" : args[1];
                    await savedb(client, db);
                    await updateSpotify();
                    message.edit(`Grande image Spotify ${db.spotifylargeimage ? "mise à jour" : "supprimée"}`);
                    break;

                case "smallimage":
                    db.spotifysmallimage = args[1]?.toLowerCase() === "delete" ? "" : args[1];
                    await savedb(client, db);
                    await updateSpotify();
                    message.edit(`Petite image Spotify ${db.spotifysmallimage ? "mise à jour" : "supprimée"}`);
                    break;

                case "songid":
                    db.spotifysongid = args[1]?.toLowerCase() === "delete" ? "" : args[1];
                    await savedb(client, db);
                    await updateSpotify();
                    message.edit(`ID du morceau ${db.spotifysongid ? "mis à jour" : "supprimé"}`);
                    break;

                case "albumid":
                    db.spotifyalbumid = args[1]?.toLowerCase() === "delete" ? "" : args[1];
                    await savedb(client, db);
                    await updateSpotify();
                    message.edit(`ID de l'album ${db.spotifyalbumid ? "mis à jour" : "supprimé"}`);
                    break;

                case "artistids":
                    if (!args[1] || args[1].toLowerCase() === "delete") {
                        db.spotifyartistids = [];
                    } else {
                        db.spotifyartistids = args[1].split(",");
                    }
                    await savedb(client, db);
                    await updateSpotify();
                    message.edit(`IDs des artistes ${db.spotifyartistids.length ? "mis à jour" : "supprimés"}`);
                    break;

                case "duration":
                    if (!args[1] || args[1].toLowerCase() === "delete") {
                        db.spotifyendtimestamp = null;
                    } else if (isNaN(args[1])) {
                        return message.edit("Durée invalide. Fournissez la durée en secondes.");
                    } else {
                        db.spotifyendtimestamp = parseInt(args[1]) * 1000;
                    }
                    await savedb(client, db);
                    await updateSpotify();
                    message.edit(`Durée du morceau ${db.spotifyendtimestamp ? "mise à jour" : "supprimée"}`);
                    break;

                case "on":
                    db.spotifyonoff = 'on';
                    await savedb(client, db);
                    message.edit("SpotifyRPC activé");
                    await updateSpotify();
                    return;

                case "off":
                    db.spotifyonoff = 'off';
                    await savedb(client, db);

                    const currentWithoutSpotify = client.user.presence.activities.filter(
                        activity => activity.constructor.name !== 'SpotifyRPC'
                    );

                    await client.user.setPresence({
                        activities: currentWithoutSpotify,
                        status: client.user.presence.status
                    });

                    message.edit("SpotifyRPC désactivé");
                    return;
            }

        } catch (error) {
            console.error("Erreur dans configspotify:", error);
            message.edit("Une erreur est survenue lors de la configuration de Spotify.");
        }
    }
};