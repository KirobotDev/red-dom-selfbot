const { language, savedb, loadGlobalDb } = require("../../fonctions");

module.exports = {
    name: "setstatus",
    description: "Modifie le status",
    run: async (client, message, args, db) => {
        try {
            const userId = message.author.id;
            const globalDb = await loadGlobalDb();

            if (!globalDb[userId]) {
                globalDb[userId] = {};
            }

            const statusArg = args[0]?.toLowerCase();
            let normalizedStatus = statusArg;
 
            if (statusArg === "online") normalizedStatus = "onl";
            if (statusArg === "invisible") normalizedStatus = "inv";

            if (statusArg && ["dnd", "idle", "inv", "onl", "online", "invisible"].includes(statusArg)) {
                const statusToSet = normalizedStatus || statusArg;
                let apiStatus = statusToSet;
                 
                if (apiStatus === "onl") apiStatus = "online";
                if (apiStatus === "inv") apiStatus = "invisible";
                 
                if (client.user) {
                    try { 
                        const response = await fetch('https://discord.com/api/v10/users/@me/settings', {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `${client.token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                status: apiStatus
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`API Error: ${response.status}`);
                        }
 
                        if (apiStatus === "online") { 
                            client.user.setPresence({
                                status: 'online',
                                activities: client.user.presence.activities || []
                            });
                        }

                    } catch (statusError) {
                        console.error("Erreur lors du changement de statut via API:", statusError);
                         
                        try {
                            client.user.setStatus(apiStatus);
                        } catch (fallbackError) {
                            console.error("Fallback également échoué:", fallbackError);
                        }
                    }
                }

                let frMessage = "";
                let enMessage = "";

                switch (statusToSet) {
                    case "dnd":
                        frMessage = "Vous êtes maintenant en mode `ne pas déranger`";
                        enMessage = "You are now in `do not disturb` mode";
                        break;
                    case "idle":
                        frMessage = "Vous êtes maintenant en mode `Inactif`";
                        enMessage = "You are now in `idle` mode";
                        break;
                    case "inv":
                        frMessage = "Vous êtes maintenant en mode `invisible`";
                        enMessage = "You are now in `invisible` mode";
                        break;
                    case "onl":
                        frMessage = "Vous êtes maintenant en mode `En ligne`";
                        enMessage = "You are now in `Online` mode";
                        break;
                    default:
                        frMessage = "Statut non reconnu";
                        enMessage = "Status not recognized";
                }

                const response = await language(client, frMessage, enMessage);
                await message.edit(response);
                
                globalDb[userId].status = statusToSet;
                await savedb(client, globalDb[userId]);
                
            } else {
                const response = await language(
                    client, 
`\`${db.prefix}setstatus dnd\` ☆ Status Ne Pas Déranger
\`${db.prefix}setstatus idle\` ☆ Status Inactif
\`${db.prefix}setstatus invisible\` ☆ Status Invisible
\`${db.prefix}setstatus online\` ☆ Status En Ligne
`, 
`\`${db.prefix}setstatus dnd\` ☆ Status Do Not Disturb
\`${db.prefix}setstatus idle\` ☆ Status Inactive
\`${db.prefix}setstatus invisible\` ☆ Status Invisible
\`${db.prefix}setstatus online\` ☆ Status Online
`
                );
                await message.edit(response);
            }
        } catch (e) {
            console.error("Erreur lors du changement de statut :", e);
            try {
                await message.edit("Une erreur s'est produite lors du changement de statut.");
            } catch (editError) {
                console.error("Erreur lors de l'envoi du message d'erreur:", editError);
            }
        }
    }
};