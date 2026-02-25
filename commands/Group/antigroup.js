const chalk = require("chalk");
const { language, savedb } = require("../../fonctions");

module.exports = {
    name: "antigroup",
    description: "Protection contre l'ajout en groupe",

    setupAntiGroup: (client) => {
        const userId = client.user.id;

        client.on("channelCreate", async (channel) => {
            try {            
                const { loadGlobalDb } = require("../../fonctions");
                const globalDb = await loadGlobalDb();
                const db = globalDb[userId] || {};
                
                if (!db.noaddgrp) return;
                if (channel.type !== "GROUP_DM") return;
 
                try {
                    const channelInfo = await client.api.channels(channel.id).get(); 
                    if (channelInfo.owner_id === client.user.id) { 
                        return;  
                    }
                } catch (err) { 
                }

                if (db.noaddgrptext) {
                    try {
                        await channel.send(db.noaddgrptext);
                    } catch (err) { 
                    }
                }

                try {
                    await client.api.channels(channel.id).delete({
                        query: {
                            silent: true
                        }
                    });
                } catch (err) { 
                }
            } catch (err) { 
            }
        });
    },

    run: async (client, message, args, db) => {
        try {
            if (!args[0]) {
                const response = await language(client,
                    `⛧__**RD - ANTIGROUP**__⛧
\`${db.prefix}antigroup on\` ➜ **Active la protection contre l'ajout en groupe**
\`${db.prefix}antigroup off\` ➜ **Désactive la protection contre l'ajout en groupe**
\`${db.prefix}antigroup message [texte]\` ➜ **Définit le message envoyé avant de quitter un groupe**
\`${db.prefix}antigroup info\` ➜ **Affiche les infos de votre antigroup (activé/désactivé, message défini)**`,
                    
                    `⛧__**RD - ANTIGROUP**__⛧
\`${db.prefix}antigroup on\` ➜ **Enable group protection**
\`${db.prefix}antigroup off\` ➜ **Disable group protection**
\`${db.prefix}antigroup message [text]\` ➜ **Set message sent before leaving a group**
\`${db.prefix}antigroup info\` ➜ **Show your antigroup info (enabled/disabled, defined message)**`
                );
                return message.edit(response);
            }

            if (args[0] === "on") {
                if (db.noaddgrp === true) {
                    const response = await language(client, 
                        "L'antigroupe est déjà activé", 
                        "Antigroup is already enabled"
                    );
                    return message.edit(response);
                }
                db.noaddgrp = true;
                await savedb(client, db);
                const response = await language(client, 
                    "**Antigroupe activé**", 
                    "**Antigroup enabled**"
                );
                return message.edit(response);
            }

            if (args[0] === "off") {
                if (db.noaddgrp === false) {
                    const response = await language(client, 
                        "L'antigroupe est déjà désactivé", 
                        "Antigroup is already disabled"
                    );
                    return message.edit(response);
                }
                db.noaddgrp = false;
                await savedb(client, db);
                const response = await language(client, 
                    "**Antigroupe désactivé**", 
                    "**Antigroup disabled**"
                );
                return message.edit(response);
            }
            
            if (args[0] === "info") {
                const response = await language(client,
                    `État: **${db.noaddgrp ? "activé" : "désactivé"}**
Message: ${db.noaddgrptext ? `\`${db.noaddgrptext}\`` : "aucun"}`,
                    
                    `Status: **${db.noaddgrp ? "enabled" : "disabled"}**
Message: ${db.noaddgrptext ? `\`${db.noaddgrptext}\`` : "none"}`
                );
                return message.edit(response);
            }

            if (args[0] === "message") {
                const msg = args.slice(1).join(" ");
                if (!msg) {
                    const response = await language(client,
                        "Vous devez spécifier un message (exemple : `&antigroup message Salut, je ne veux pas de groupes !`)",
                        "You must specify a message (example: `&antigroup message Hi, I don't want groups!`)"
                    );
                    return message.edit(response);
                }

                if (msg === "remove") {
                    db.noaddgrptext = null;
                    await savedb(client, db);
                    const response = await language(client,
                        `Message supprimé`,
                        `Message deleted`
                    );
                    return message.edit(response);
                }
                
                db.noaddgrptext = msg;
                await savedb(client, db);
                const response = await language(client,
                    `Message défini: \`${msg}\``,
                    `Message set: \`${msg}\``
                );
                return message.edit(response);
            }

            const response = await language(client,
                `⛧__**RD - ANTIGROUP**__⛧
\`${db.prefix}antigroup on\` ➜ **Active la protection contre l'ajout en groupe**
\`${db.prefix}antigroup off\` ➜ **Désactive la protection contre l'ajout en groupe**
\`${db.prefix}antigroup message [texte]\` ➜ **Définit le message envoyé avant de quitter un groupe**
\`${db.prefix}antigroup info\` ➜ **Affiche les infos de votre antigroup (activé/désactivé, message défini)**`,
                
                `⛧__**RD - ANTIGROUP**__⛧
\`${db.prefix}antigroup on\` ➜ **Enable group protection**
\`${db.prefix}antigroup off\` ➜ **Disable group protection**
\`${db.prefix}antigroup message [text]\` ➜ **Set message sent before leaving a group**
\`${db.prefix}antigroup info\` ➜ **Show your antigroup info (enabled/disabled, defined message)**`
            );
            return message.edit(response);
            
        } catch (err) { 
            const response = await language(client,
                "Une erreur est survenue avec la commande antigroup",
                "An error occurred with the antigroup command"
            );
            message.edit(response);
        }
    },
};