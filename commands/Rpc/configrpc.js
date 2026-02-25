const { RichPresence, SpotifyRPC, CustomStatus } = require('safeness-sb-new');
const chalk = require('chalk');
const { language, savedb } = require("../../fonctions");

module.exports = {
    name: "configrpc",
    description: "Configurer votre RPC avec gestion des erreurs",
    run: async (client, message, args, db) => {
        try {
            const isValidUrl = (url) => {
                try {
                    new URL(url);
                    return true;
                } catch {
                    return false;
                }
            };

            const isValidImage = (img) => {
                return typeof img === 'string' && img.trim() !== '';
            };

            async function updateRPC() {
                try {
                    if (!db.streaming || String(db.streaming).toLowerCase() === 'off') {
                        if (!db.rpctitle || typeof db.rpctitle !== 'string' || db.rpctitle.trim() === '') {
                            await message.edit("Aucun nom (name) configuré pour le RPC. Utilisez `&configrpc name <texte>` pour en définir un.");
                            return;
                        }

                        const rpc = new RichPresence(client);

                        db.rpconoff = 'on';

                        if (typeof db.rpctitle === 'string' && db.rpctitle.trim()) {
                            rpc.setName(db.rpctitle.trim());
                        }

                        if (typeof db.rpcdetails === 'string' && db.rpcdetails.trim()) {
                            rpc.setDetails(db.rpcdetails.trim());
                        }

                        if (typeof db.rpcstate === 'string' && db.rpcstate.trim()) {
                            rpc.setState(db.rpcstate.trim());
                        }
                        
                        if (db.appid) rpc.setApplicationId(db.appid);

                        if (typeof db.rpcminparty === 'number' && 
                            typeof db.rpcmaxparty === 'number' && 
                            db.rpcmaxparty > 0) {
                            rpc.setParty({
                                max: db.rpcmaxparty,
                                current: db.rpcminparty
                            });
                        }

                        if (db.rpctime) { 
                            const timestamp = typeof db.rpctime === 'object' && db.rpctime instanceof Date 
                                ? db.rpctime.getTime() 
                                : Number(db.rpctime);
                            
                            if (!isNaN(timestamp) && timestamp > 0) {
                                rpc.setStartTimestamp(timestamp);
                            }
                        }

                        try {
                            if (db.rpclargeimage && isValidImage(db.rpclargeimage)) {
                                rpc.setAssetsLargeImage(db.rpclargeimage);
                                if (db.rpclargeimagetext) {
                                    rpc.setAssetsLargeText(db.rpclargeimagetext);
                                }
                            }

                            if (db.rpcsmallimage && isValidImage(db.rpcsmallimage)) {
                                rpc.setAssetsSmallImage(db.rpcsmallimage);
                                if (db.rpcsmallimagetext) {
                                    rpc.setAssetsSmallText(db.rpcsmallimagetext);
                                }
                            }
                        } catch (imageError) {
                            console.error("Erreur d'image RPC:", imageError);
                        }

                        try {
                            if (db.buttontext1 && db.buttonlink1 && isValidUrl(db.buttonlink1)) {
                                rpc.addButton(db.buttontext1, db.buttonlink1);
                            }
                            if (db.buttontext2 && db.buttonlink2 && isValidUrl(db.buttonlink2)) {
                                rpc.addButton(db.buttontext2, db.buttonlink2);
                            }
                        } catch (buttonError) {
                            console.error("Erreur de bouton RPC:", buttonError);
                        }

                        if (db.rpctype && ['PLAYING', 'WATCHING', 'LISTENING', 'STREAMING', 'COMPETING'].includes(db.rpctype)) {
                            rpc.setType(db.rpctype);
                        }

                        if (db.rpcplatform && ['xbox', 'ps5', 'desktop'].includes(db.rpcplatform)) {
                            rpc.setPlatform(db.rpcplatform);
                        }

                        const currentActivities = client.user.presence.activities.filter(activity => {
                            return activity.name !== 'Custom Status' && 
                                   !(activity.constructor.name === 'RichPresence');
                        });
                        
                        const newActivities = [...currentActivities, rpc];
                        
                        await client.user.setPresence({
                            activities: newActivities,
                            status: client.user.presence.status
                        }); 

                    } else {
                        const activities = [];
                        await client.user.setPresence({ activities: [] });

                        if (String(db.rpconoff).toLowerCase() === 'on') {
                            try {
                                if (!db.rpctitle || typeof db.rpctitle !== 'string' || db.rpctitle.trim() === '') {
                                    await message.edit("Aucun nom (name) configuré pour le RPC. Utilisez `&configrpc name <texte>` pour en définir un.");
                                    return;
                                }

                                const rpcActivity = new RichPresence(client);
                                
                                if (db.rpctitle) rpcActivity.setName(db.rpctitle);
                                if (db.rpcdetails) rpcActivity.setDetails(db.rpcdetails);
                                if (db.rpcstate) rpcActivity.setState(db.rpcstate);
                                
                                if (db.appid) {
                                    const appId = db.appid.toString().replace(/\D/g, '');
                                    if (appId.length > 0) rpcActivity.setApplicationId(appId);
                                }
                                
                                const activityTypes = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'];
                                if (db.rpctype && activityTypes.includes(db.rpctype.toUpperCase())) {
                                    rpcActivity.setType(db.rpctype.toUpperCase());
                                }
                                
                                if (db.rpctype && db.rpctype.toUpperCase() === "STREAMING" && db.twitch) {
                                    rpcActivity.setURL(db.twitch);
                                } else {
                                    if (db.buttontext1 && db.buttonlink1 && isValidUrl(db.buttonlink1)) {
                                        rpcActivity.addButton(db.buttontext1, db.buttonlink1);
                                    }
                                    if (db.buttontext2 && db.buttonlink2 && isValidUrl(db.buttonlink2)) {
                                        rpcActivity.addButton(db.buttontext2, db.buttonlink2);
                                    }
                                }
                                
                                if (db.rpcminparty && db.rpcmaxparty) {
                                    rpcActivity.setParty({
                                        max: db.rpcmaxparty,
                                        current: db.rpcminparty
                                    });
                                }
                                
                                if (db.rpctype && db.rpctype.toUpperCase() === "STREAMING") {
                                } else {
                                    if (db.rpctime) {
                                        const timestamp = typeof db.rpctime === 'object' && db.rpctime instanceof Date 
                                            ? db.rpctime.getTime() 
                                            : Number(db.rpctime);
                                        
                                        if (!isNaN(timestamp) && timestamp > 0) {
                                            rpcActivity.setStartTimestamp(timestamp);
                                        } else {
                                            rpcActivity.setStartTimestamp(Date.now());
                                        }
                                    }
                                }
                                
                                if (db.rpclargeimage && isValidImage(db.rpclargeimage)) {
                                    rpcActivity.setAssetsLargeImage(db.rpclargeimage);
                                    if (db.rpclargeimagetext) {
                                        rpcActivity.setAssetsLargeText(db.rpclargeimagetext);
                                    }
                                }

                                if (db.rpcsmallimage && isValidImage(db.rpcsmallimage)) {
                                    rpcActivity.setAssetsSmallImage(db.rpcsmallimage);
                                    if (db.rpcsmallimagetext) {
                                        rpcActivity.setAssetsSmallText(db.rpcsmallimagetext);
                                    }
                                }

                                if (db.rpcplatform && ['xbox', 'ps5', 'desktop'].includes(db.rpcplatform)) {
                                    rpcActivity.setPlatform(db.rpcplatform);
                                }

                                activities.push(rpcActivity);
                            } catch (err) {
                                console.error(chalk.red('[RPC Error]'), err);
                            }
                        }

                        if (activities.length > 0) {
                            await client.user.setPresence({
                                activities: activities,
                                status: client.user.presence.status
                            });
                            await message.edit("RPC configuré avec succès !");
                        } else {
                            await message.edit("Aucun RPC configuré. Vérifiez que vous avez défini un nom (name) avec `&configrpc name <texte>`");
                        }
                    }

                    await savedb(client, db);

                } catch (rpcError) {
                    console.error("Erreur critique dans updateRPC:", rpcError);
                    await message.edit("Erreur lors de la mise à jour du RPC");
                }
            }

            if (!args[0]) {
                return message.edit(`
**Guide d'utilisation du RPC**:

⚠️ **IMPORTANT** : Vous devez définir un nom (name) pour que le RPC fonctionne !

\`${db.prefix}configrpc name <texte>\` - Modifie le nom du RPC (OBLIGATOIRE)
\`${db.prefix}configrpc details <texte>\` - Modifie les détails
\`${db.prefix}configrpc state <texte>\` - Modifie l'état
\`${db.prefix}configrpc party <actuel>/<max>\` - Configure le groupe
\`${db.prefix}configrpc type <PLAYING/WATCHING/LISTENING/STREAMING/COMPETING>\` - Type d'activité
\`${db.prefix}configrpc streaming <on/off>\` - Quand le type du rpc est streaming, ça met le rond violet.
\`${db.prefix}configrpc largeimage <lien> [texte]\` - Grande image
\`${db.prefix}configrpc smallimage <lien> [texte]\` - Petite image
\`${db.prefix}configrpc platform <xbox/desktop/ps5>\` - Plateforme du rpc
\`${db.prefix}configrpc button <lien> <texte>\` - Bouton 1
\`${db.prefix}configrpc button2 <lien> <texte>\` - Bouton 2
\`${db.prefix}configrpc twitch <lien>\` - Lien Twitch/YouTube pour le streaming
\`${db.prefix}configrpc time <valeur><j/h/m/s>\` - Durée (ex: 5h)

Pour supprimer un élément: \`${db.prefix}configrpc <élément> delete\`
`);
            }

            switch (args[0].toLowerCase()) {
                case 'name':
                    db.rpctitle = args[1]?.toLowerCase() === 'delete' ? '' : args.slice(1).join(' ');
                    await savedb(client, db);
                    await message.edit(`Nom du RPC ${db.rpctitle ? 'mis à jour' : 'supprimé'}`);
                    await updateRPC();
                    break;

                case 'details':
                    db.rpcdetails = args[1]?.toLowerCase() === 'delete' ? '' : args.slice(1).join(' ');
                    await savedb(client, db);
                    await message.edit(`Détails du RPC ${db.rpcdetails ? 'mis à jour' : 'supprimés'}`);
                    await updateRPC();
                    break;

                case 'state':
                    db.rpcstate = args[1]?.toLowerCase() === 'delete' ? '' : args.slice(1).join(' ');
                    await savedb(client, db);
                    await message.edit(`État du RPC ${db.rpcstate ? 'mis à jour' : 'supprimé'}`);
                    await updateRPC();
                    break;

                case 'party':
                    if (!args[1] || args[1].toLowerCase() === 'delete') {
                        db.rpcminparty = 0;
                        db.rpcmaxparty = 0;
                    } else {
                        const party = args[1].split('/');
                        if (party.length !== 2 || party.some(isNaN)) {
                            return message.edit("Format invalide. Utilisez: `actuel/max` (ex: 3/5)");
                        }
                        db.rpcminparty = parseInt(party[0]);
                        db.rpcmaxparty = parseInt(party[1]);
                    }
                    await savedb(client, db);
                    await message.edit(`Groupe du RPC ${db.rpcmaxparty > 0 ? 'mis à jour' : 'supprimé'}`);
                    await updateRPC();
                    break;

                case 'type':
                    if (!args[1] || args[1].toLowerCase() === 'delete') {
                        db.rpctype = '';
                    } else {
                        const validTypes = ['PLAYING', 'WATCHING', 'LISTENING', 'STREAMING', 'COMPETING'];
                        const type = args[1].toUpperCase();
                        if (!validTypes.includes(type)) {
                            return message.edit("Type invalide. Choisissez: PLAYING, WATCHING, LISTENING, STREAMING ou COMPETING");
                        }
                        db.rpctype = type;
                        
                        if (type === 'STREAMING' && !db.twitch) {
                            message.edit(`Type mis à jour en **STREAMING**. N'oubliez pas de configurer un lien avec \`${db.prefix}configrpc twitch <lien>\``);
                        }
                    }
                    await savedb(client, db);
                    await message.edit(`Type du RPC ${db.rpctype ? 'mis à jour' : 'supprimé'}`);
                    await updateRPC();
                    break;

                case 'streaming':
                    if (!args[1]) {
                        return message.edit("Utilisez: `streaming on` pour activer le mode streaming ou `streaming off` pour le désactiver");
                    }
                    
                    if (args[1].toLowerCase() === 'on') {
                        db.streaming = 'on';
                        db.rpctype = 'STREAMING';
                        if (!db.twitch) {
                            await message.edit(`Mode streaming activé. Configurez un lien avec \`${db.prefix}configrpc twitch <lien>\``);
                        } else {
                            await message.edit("Mode streaming activé avec le lien configuré");
                        }
                    } else if (args[1].toLowerCase() === 'off') {
                        db.streaming = 'off';
                        await message.edit("Mode streaming désactivé - utilisation de l'ancien système RPC");
                    } else {
                        return message.edit("Utilisez: `streaming on` ou `streaming off`");
                    }
                    await savedb(client, db);
                    await updateRPC();
                    break;
                    
                case 'platform':
                    if (!args[1]) {
                        return message.edit("Veuillez spécifier une plateforme : xbox, ps5 ou desktop");
                    } else {
                        const validPlatforms = ['xbox', 'ps5', 'desktop'];
                        const platform = args[1].toLowerCase();
                        if (!validPlatforms.includes(platform)) {
                            return message.edit("Plateforme invalide. Choisissez: xbox, ps5 ou desktop");
                        }
                        db.rpcplatform = platform;
                    }
                    await savedb(client, db);
                    await message.edit(`Plateforme du RPC mise à jour en **${db.rpcplatform}**`);
                    await updateRPC();
                    break;

                case 'largeimage':
                    if (!args[1] || args[1].toLowerCase() === 'delete') {
                        db.rpclargeimage = '';
                        db.rpclargeimagetext = '';
                    } else {
                        db.rpclargeimage = args[1];
                        db.rpclargeimagetext = args[2] || '';
                    }
                    await savedb(client, db);
                    await message.edit(`Grande image du RPC ${db.rpclargeimage ? 'mise à jour' : 'supprimée'}`);
                    await updateRPC();
                    break;

                case 'smallimage':
                    if (!args[1] || args[1].toLowerCase() === 'delete') {
                        db.rpcsmallimage = '';
                        db.rpcsmallimagetext = '';
                    } else {
                        db.rpcsmallimage = args[1];
                        db.rpcsmallimagetext = args[2] || '';
                    }
                    await savedb(client, db);
                    await message.edit(`Petite image du RPC ${db.rpcsmallimage ? 'mise à jour' : 'supprimée'}`);
                    await updateRPC();
                    break;
                    
                case 'twitch':
                    const url = args[1];
                    if (!url) return message.edit("Tu dois fournir un lien Twitch ou YouTube.");
                    
                    const twitchRegex = /^https?:\/\/(www\.)?twitch\.tv\/[a-zA-Z0-9_]{4,25}$/i;
                    const youtubeRegex = /^https?:\/\/(www\.)?youtube\.com\/(live|watch)\?v=[\w-]{11}/i;

                    if (!twitchRegex.test(url) && !youtubeRegex.test(url)) {
                        return message.edit("Lien invalide. Utilise un lien Twitch ou YouTube live.");
                    }

                    db.twitch = url;
                    await savedb(client, db);
                    await message.edit(`Lien de streaming mis à jour : ${url}`);
                    await updateRPC();
                    break;

                case 'button':
                    if (!args[1] || args[1].toLowerCase() === 'delete') {
                        db.buttontext1 = '';
                        db.buttonlink1 = '';
                    } else {
                        if (!args[2]) return message.edit("Format: `button <lien> <texte>`");
                        db.buttonlink1 = args[1];
                        db.buttontext1 = args.slice(2).join(' ');
                    }
                    await savedb(client, db);
                    await message.edit(`Bouton 1 du RPC ${db.buttontext1 ? 'mis à jour' : 'supprimé'}`);
                    await updateRPC();
                    break;

                case 'button2':
                    if (!args[1] || args[1].toLowerCase() === 'delete') {
                        db.buttontext2 = '';
                        db.buttonlink2 = '';
                    } else {
                        if (!args[2]) return message.edit("Format: `button2 <lien> <texte>`");
                        db.buttonlink2 = args[1];
                        db.buttontext2 = args.slice(2).join(' ');
                    }
                    await savedb(client, db);
                    await message.edit(`Bouton 2 du RPC ${db.buttontext2 ? 'mis à jour' : 'supprimé'}`);
                    await updateRPC();
                    break;

                case 'time':
                    if (!args[1] || args[1].toLowerCase() === 'delete') {
                        db.rpctime = null;
                    } else {
                        const timeRegex = /^(\d+)([jhms])$/i;
                        const match = args[1].match(timeRegex);
                        if (!match) return message.edit("Format invalide. Exemples: 5h, 30m, 1j");

                        const value = parseInt(match[1]);
                        const unit = match[2].toLowerCase();
                        const date = new Date();

                        switch (unit) {
                            case 'j': date.setDate(date.getDate() - value); break;
                            case 'h': date.setHours(date.getHours() - value); break;
                            case 'm': date.setMinutes(date.getMinutes() - value); break;
                            case 's': date.setSeconds(date.getSeconds() - value); break;
                        }
            
                        db.rpctime = date.getTime();
                    }
                    await savedb(client, db);
                    await message.edit(`Temps du RPC ${db.rpctime ? 'mis à jour' : 'supprimé'}`);
                    await updateRPC();
                    break;

                default:
                    return message.edit("Commande inconnue. Utilisez la commande sans arguments pour l'aide.");
            }

        } catch (error) {
            console.error("Erreur dans configrpc:", error);
            message.edit("Une erreur est survenue lors de la configuration du RPC.");
        }
    }
};