const { savedb } = require('../../fonctions');
const { RichPresence } = require('safeness-sb-new');
 
async function setupPresence(client, db) {
    try {
        if (!db.rpctitle || typeof db.rpctitle !== 'string' || db.rpctitle.trim() === '') {
            console.error("[setupPresence] Impossible d'activer le RPC : aucun nom défini");
            throw new Error("NO_RPC_NAME");
        }

        if (!db.streaming || String(db.streaming).toLowerCase() === 'off') {
            const rpc = new RichPresence(client);

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
 
            const isValidImage = (img) => {
                return typeof img === 'string' && img.trim() !== '';
            };

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
                const isValidUrl = (url) => {
                    try {
                        new URL(url);
                        return true;
                    } catch {
                        return false;
                    }
                };

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
            
            try {
                const hasEssentialRPCContent = db.rpctitle || db.rpcdetails || db.rpcstate;
                
                if (hasEssentialRPCContent) {
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
                        const isValidUrl = (url) => {
                            try {
                                new URL(url);
                                return true;
                            } catch {
                                return false;
                            }
                        };
                        
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
                    
                    const isValidImage = (img) => {
                        return typeof img === 'string' && img.trim() !== '';
                    };
                    
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
                }
            } catch (err) {
                console.error('[RPC Error]', err);
            }

            if (activities.length > 0) {
                await client.user.setPresence({
                    activities: activities,
                    status: client.user.presence.status
                });
            }
        }

    } catch (rpcError) {
        console.error("Erreur critique dans setupPresence:", rpcError);
        throw rpcError;
    }
}

module.exports = {
  name: "activaterpc",
  description: "Activate the current Rich Presence (RPC)",
  run: async (client, message, args, db) => {
    try {
      if (!db.rpctitle || typeof db.rpctitle !== 'string' || db.rpctitle.trim() === '') {
        return message.edit(`**Impossible d'activer le RPC : aucun nom défini !**\n\nUtilisez d'abord : \`${db.prefix}configrpc name <votre_nom_rpc>\`\n\nExemple : \`${db.prefix}configrpc name Jeu Cool\``);
      }
      
      db.rpconoff = 'on';
      await savedb(client, db);
      await setupPresence(client, db);
      message.edit("**Le RPC a été activé avec succès !**\n\n(setrpc list pour voir les différents rpc)");
    } catch (e) {
      if (e.message === "NO_RPC_NAME") {
        return message.edit(`**Impossible d'activer le RPC : aucun nom défini !**\n\nUtilisez d'abord : \`${db.prefix}configrpc name <votre_nom_rpc>\`\n\nExemple : \`${db.prefix}configrpc name Jeu Cool\``);
      }
      
      console.error("Erreur lors de l'activation du RPC:", e);
      message.edit("Une erreur est survenue lors de la tentative d'activation du RPC.");
    }
  }
};