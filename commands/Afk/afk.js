const chalk = require("chalk");
const { WebhookClient, EmbedBuilder } = require('discord.js');
const { language, savedb, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, '..', 'Help', 'themes.js'));

function generateAfkHelp(theme, prefix, userId, lang = 'fr') {
    const afkCommands = {
        "afk message": "😴 Modif message AFK",
        "afk start": "▶️ Activer le mode AFK", 
        "afk stop": "⏹️ Enlève le mode AFK",
        "afk log": "📝 Gérer les logs"
    };

    const englishAfkCommands = {
        "afk message": "😴 Edit AFK message",
        "afk start": "▶️ Enable AFK mode", 
        "afk stop": "⏹️ Disable AFK mode",
        "afk log": "📝 Manage logs"
    };

    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishAfkCommands : afkCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: 'afk',
    description: 'Gérer le mode AFK',

initializeAfkListener: (client) => { 
    
    if (client._afkListenerAttached) {
        return;
    }
    
    client._afkListenerAttached = true;
    client._afkInitialized = true;  
    
    client.on('afkCheck', async (message) => {  
         
        if (!client._lastAfkMessage || client._lastAfkMessage !== message.id) {
            client._lastAfkMessage = message.id;
        } else { 
            return;
        }

        setTimeout(() => {
            if (client._lastAfkMessage === message.id) {
                client._lastAfkMessage = null;
            }
        }, 2000);

        if (message.author.bot || message.author.id === client.user.id) { 
            return;
        }

        const globalDb = await loadGlobalDb();
        const userId = client.user.id; 
        
        const userDb = globalDb[userId];  
        
        if (!userDb) { 
            return;
        }
        
        const prefix = userDb.prefix || '&';
        if (message.content && message.content.startsWith(prefix)) { 
            return;
        } 
         
        if (!userDb.afk) { 
            return;
        }

        const isDM = message.channel.type === 'DM';
        const hasMention = message.mentions.has(client.user.id); 
        
        if (!isDM && !hasMention) { 
            return;
        }
 
        await message.channel.send(userDb.afkmessage || "Je suis AFK, je te répondrai plus tard.");

        if (userDb.afkwebhook) { 
            const webhook = new WebhookClient({ url: userDb.afkwebhook });
            const channelType = isDM ? 'DM' : 'Mention';
            
            let messageLink;
            if (isDM) {
                messageLink = `https://discord.com/channels/@me/${message.channel.id}/${message.id}`;
            } else {
                messageLink = `https://discord.com/channels/${message.guild?.id || '@me'}/${message.channel.id}/${message.id}`;
            }

            const channelInfo = isDM 
                ? 'Message privé' 
                : `${message.channel.name} (${message.guild?.name || 'Serveur'})`;

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTitle(`📩 ${channelType}`)
                .addFields(
                    { name: 'Auteur', value: `${message.author} (${message.author.id})`, inline: false },
                    { name: 'Salon', value: channelInfo, inline: false },
                    { name: 'Contenu', value: message.content || 'Aucun contenu', inline: false },
                    { name: 'Lien', value: `[Voir](${messageLink})`, inline: false }
                )
                .setTimestamp();

            await webhook.send({ embeds: [embed] });
        }
    });
},

   run: async (client, message, args, db, prefix) => {
    try {  
        
        const globalDb = await loadGlobalDb();
        const userId = client.user.id; 
        
        if (!globalDb[userId]) { 
            await savedb(client, { langue: "fr", theme: "default" });
        }
        
        const userDb = globalDb[userId]; 
        
        const theme = userDb.theme || "default";
 
        if (typeof userDb.afk !== 'boolean') { 
            userDb.afk = false;
        }

        if (args.length === 0) { 
            const helpMessage = generateAfkHelp(theme, prefix, userId, 'fr');
            const englishMessage = generateAfkHelp(theme, prefix, userId, 'en');
            return message.edit(await language(client, helpMessage, englishMessage));
        }

        const subcommand = args[0].toLowerCase(); 

        if (subcommand === 'message') {
            if (args.length === 1) {
                if (userDb.afkmessage && userDb.afkmessage.trim() !== "") {
                    const response = await language(client,
                        `Ton message AFK est : "${userDb.afkmessage}"`,
                        `Your AFK message is: "${userDb.afkmessage}"`
                    );
                    return message.edit(response);
                } else {
                    const response = await language(client,
                        "Tu n'as pas encore défini de message AFK.",
                        "You haven't set an AFK message yet."
                    );
                    return message.edit(response);
                }
            }
            const newMsg = args.slice(1).join(' ');
            if (!newMsg) {
                const response = await language(client,
                    `Exemple : \`${db.prefix}afk message Je suis AFK\``,
                    `Example: \`${db.prefix}afk message I am AFK\``
                );
                return message.edit(response);
            }
            userDb.afkmessage = newMsg; 
            await savedb(client, userDb);
            const response = await language(client,
                `Message AFK : "${newMsg}"`,
                `AFK message: "${newMsg}"`
            );
            return message.edit(response);
        }

        else if (subcommand === 'start') {
            if (!userDb.afkmessage || userDb.afkmessage.trim() === "") {
                const response = await language(client,
                    `Définis d'abord un message AFK : \`${db.prefix}afk message <texte>\``,
                    `First set an AFK message: \`${db.prefix}afk message <text>\``
                );
                return message.edit(response);
            }

            if (userDb.afkwebhook) {
                try {
                    const webhookUrl = userDb.afkwebhook;
                    const parts = webhookUrl.split('/');
                    const webhookId = parts[parts.length - 2];
                    const webhookToken = parts[parts.length - 1];
                    await fetch(`https://discord.com/api/v10/webhooks/${webhookId}/${webhookToken}`);
                } catch (err) {
                    console.error("Webhook invalide :", err);
                }
            }

            userDb.afk = true;  
            await savedb(client, userDb);

            if (!client._afkInitialized) {
                module.exports.initializeAfkListener(client);
                client._afkInitialized = true;
            }

            const response = await language(client,
                `AFK activé : "${userDb.afkmessage}"`,
                `AFK enabled: "${userDb.afkmessage}"`
            );
            return message.edit(response);
        }

        else if (subcommand === 'stop') {
            userDb.afk = false;  
            await savedb(client, userDb);

            const response = await language(client,
                "AFK désactivé.",
                "AFK disabled."
            );
            return message.edit(response);
        }

        else if (subcommand === 'log') {
            const url = args[1];

            if (!url) {
                const response = await language(client,
                    `${db.prefix}afk log <webhook>\n${db.prefix}afk log message\n${db.prefix}afk log remove`,
                    `${db.prefix}afk log <webhook>\n${db.prefix}afk log message\n${db.prefix}afk log remove`
                );
                return message.edit(response);
            }

            if (url.toLowerCase() === "remove") {
                if (!userDb.afkwebhook) {
                    const response = await language(client,
                        "Pas de webhook.",
                        "No webhook."
                    );
                    return message.edit(response);
                }

                userDb.afkwebhook = null;
                await savedb(client, userDb);

                const response = await language(client,
                    "Webhook supprimé.",
                    "Webhook removed."
                );
                return message.edit(response);
            }

            if (url.toLowerCase() === "message") {
                if (userDb.afkwebhook) {
                    const response = await language(client,
                        `${userDb.afkwebhook}`,
                        `${userDb.afkwebhook}`
                    );
                    return message.edit(response);
                } else {
                    const response = await language(client,
                        `Pas de webhook.\n${db.prefix}afk log <webhook>`,
                        `No webhook.\n${db.prefix}afk log <webhook>`
                    );
                    return message.edit(response);
                }
            }

            if (!url.startsWith("https://discord.com/api/webhooks/")) {
                const response = await language(client,
                    "URL invalide.",
                    "Invalid URL."
                );
                return message.edit(response);
            }

            userDb.afkwebhook = url;
            await savedb(client, userDb);

            const response = await language(client,
                "Webhook enregistré.",
                "Webhook registered."
            );
            return message.edit(response);
        }

        else {
            const helpMessage = generateAfkHelp(theme, prefix, userId, 'fr');
            const englishMessage = generateAfkHelp(theme, prefix, userId, 'en');
            return message.edit(await language(client, helpMessage, englishMessage));
        }
    } catch (err) {
        console.error("[AFK RUN] Erreur afk:", err);
        const response = await language(client,
            "Erreur afk",
            "AFK error"
        );
        message.edit(response);
    }
},
}