const fs = require('fs');
const path = require('path');

async function fetchChannelMessages(channel) {
    let allMessages = [];

    const options = { limit: 100 };
    const messages = await channel.messages.fetch(options);
    allMessages = [...allMessages, ...messages.values()];

    return allMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        username: msg.member ? msg.member.displayName : msg.author.username, 
        avatar: msg.author.displayAvatarURL(), 
        embeds: msg.embeds,
        attachments: msg.attachments.map(att => ({
            id: att.id,
            name: att.name,
            url: att.url,
        })),
        pinned: msg.pinned,
        timestamp: msg.createdTimestamp,
    }));
}
const resolvePermissionOverwrite = (overwrite, roleMap, guild) => {
    const resolvedId = (overwrite.id === 'everyone') ? guild.id : (roleMap.get(overwrite.id) || overwrite.id);

    const isValid = guild.roles.cache.has(resolvedId) || guild.members.cache.has(resolvedId);

    if (!isValid) {
        console.warn(`PermissionOverwrite: ID non valide trouvé pour ${overwrite.id}`);
        return null;
    }

    return {
        id: resolvedId,
        allow: BigInt(overwrite.allow),
        deny: BigInt(overwrite.deny),
    };
};

const resolveFile = (file) => {
    return {
        attachment: file.url,
        name: file.name,
    };
};

module.exports = {
    name: "backupmsg",
    description: "Gérer les sauvegardes des messages, salons, rôles et emojis",
    run: async (client, message, args, prefix) => {
        const clientID = message.author.id;
        const userFolder = path.join(__dirname, "BackupMsg", `${clientID}`);

        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        const guildFolders = fs.readdirSync(userFolder).filter(folder => fs.lstatSync(path.join(userFolder, folder)).isDirectory());

        if (args[0] === "destroy") {
            if (args[1]) {
                if (args[1] === "all") {

                    guildFolders.forEach(folder => {
                        const folderPath = path.join(userFolder, folder);
                        try {
                            fs.rmSync(folderPath, { recursive: true, force: true });
                        } catch (err) {
                            console.error("Erreur lors de la suppression de la sauvegarde :", err);
                        }
                    });

                    return message.edit("*Toutes vos sauvegardes ont été supprimées avec succès.*");
                }

                const index = parseInt(args[1], 10) - 1;

                if (isNaN(index) || index < 0 || index >= guildFolders.length) {
                    return message.edit("*Index invalide. Veuillez vérifier la liste des sauvegardes avec &backupmsg remove.*");
                }

                const folderToRemove = path.join(userFolder, guildFolders[index]);
                try {
                    fs.rmSync(folderToRemove, { recursive: true, force: true });
                    return message.edit(`*La sauvegarde n°${index + 1} a été supprimée avec succès.*`);
                } catch (err) {
                    console.error("Erreur lors de la suppression de la sauvegarde :", err);
                    return message.edit("*Une erreur est survenue lors de la suppression de la sauvegarde.*");
                }
            } else {

                if (guildFolders.length === 0) {
                    return message.edit("*Aucune sauvegarde disponible.*");
                }

                const backupList = guildFolders.map((folder, idx) => {
                    const folderPath = path.join(userFolder, folder, 'server.json');
                    let serverName = "Nom inconnu";

                    if (fs.existsSync(folderPath)) {
                        const serverData = JSON.parse(fs.readFileSync(folderPath, 'utf8'));
                        serverName = serverData.name || "Nom inconnu";
                    }

                    return `${idx + 1}. ${serverName}`;
                }).join("\n");

                return message.edit(`*Voici la liste de vos sauvegardes :*

${backupList}

*Pour supprimer une sauvegarde, utilisez* &backupmsg remove (index).
*Pour supprimer toutes les sauvegardes, utilisez* &backupmsg remove all.`);
            }
        } else if (args[0] === "list") {

            if (guildFolders.length === 0) {
                return message.edit("*Aucune sauvegarde disponible.*");
            }

            const backupList = guildFolders.map((folder, idx) => {
                const folderPath = path.join(userFolder, folder, 'server.json');
                let serverName = "Nom inconnu";

                if (fs.existsSync(folderPath)) {
                    const serverData = JSON.parse(fs.readFileSync(folderPath, 'utf8'));
                    serverName = serverData.name || "Nom inconnu";
                }

                return `**Nom du serveur :** ${serverName}\n**ID de la sauvegarde :** ${folder}`;
            }).join("\n\n");

            return message.edit(`Voici la liste de vos sauvegardes :\n\n${backupList}`);
        } else if (args[0] === "load") {

            if (!args[1]) {
                return message.edit("*Veuillez fournir l'ID de la sauvegarde à charger.*");
            }
    
      		const clientID = message.author.id;
       		const userFolder = path.join(__dirname, "BackupMsg", `${clientID}`);
            const guildFolder = path.join(userFolder, args[1]);
    
            if (!fs.existsSync(guildFolder)) {
                return message.edit("*Aucune sauvegarde trouvée pour cet ID.*");
            }
    
            if (!message.guild) {
                return message.edit("*Cette commande doit être exécutée sur un serveur.*");
            }
    
            if (!message.guild.members.me.permissions.has("ADMINISTRATOR")) {
                return message.edit("*Vous n'avez pas les permissions nécessaires pour exécuter cette commande.*");
            }
    
            await message.edit(`*Chargement de la sauvegarde en cours...*`);
    
            try {

                message.guild.roles.cache
                    .filter(role => role.editable && role.id !== message.guild.id)
                    .forEach(role => role.delete("Chargement de la sauvegarde").catch(() => false));
    
                message.guild.channels.cache.forEach(channel => {
                    channel.delete("Chargement de la sauvegarde").catch(() => false);
                });
    
                const roles = JSON.parse(fs.readFileSync(path.join(guildFolder, 'roles.json'), 'utf8'));
                const channels = JSON.parse(fs.readFileSync(path.join(guildFolder, 'channels.json'), 'utf8'));
    
                const roleMap = new Map();
    
                message.guild.roles.cache
        .filter(role => role.editable && role.id !== message.guild.id)
        .forEach(async (role) => {
            try {
                await role.delete("Chargement de la sauvegarde");
            } catch (err) {
                console.warn(`Impossible de supprimer le rôle ${role.name} (${role.id}):`, err);
            }
        });
    
                const createdRoles = []; 
    
                for (const roleData of roles) {
                    const newRole = await message.guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        permissions: BigInt(roleData.permissions),
                        hoist: roleData.hoist,
                        mentionable: roleData.mentionable,
                    });
                    createdRoles.push({ id: newRole.id, position: roleData.position });
                    roleMap.set(roleData.id, newRole.id);
                }
                await message.guild.roles.setPositions(createdRoles);            
    
                const categoryMap = new Map();
    
                for (const channelData of channels) {
                    if (channelData.type === "GUILD_CATEGORY") {
                        const newCategory = await message.guild.channels.create(channelData.name, {
                            type: channelData.type,
                            position: channelData.position,
                        });
    
                        const overwrites = channelData.permissionOverwrites.map(perm => resolvePermissionOverwrite(perm, roleMap, message.guild)).filter(perm => perm !== null);
    
                        await newCategory.permissionOverwrites.set(overwrites);
                        categoryMap.set(channelData.id, newCategory.id);
                    }
    
                    if (channelData.type === "GUILD_TEXT" || channelData.type === "GUILD_VOICE") {
                        const parent = channelData.parentId ? categoryMap.get(channelData.parentId) : null;
    
                        const newChannel = await message.guild.channels.create(channelData.name, {
                            type: channelData.type,
                            position: channelData.position,
                            parent,
                        });
    
                        const overwrites = channelData.permissionOverwrites.map(perm => resolvePermissionOverwrite(perm, roleMap, message.guild)).filter(perm => perm !== null);
    
                        if (overwrites.length > 0) {
                            await newChannel.permissionOverwrites.set(overwrites);
                        }
    
                        if (channelData.type === "GUILD_TEXT") {
                            const messagesPath = path.join(guildFolder, `${channelData.id}.json`);
                            if (fs.existsSync(messagesPath)) {
                                const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
                                const reversedMessages = messages.reverse();
    
                                const webhook = await newChannel.createWebhook('MessagesBackup', {
                                    avatar: client.user.displayAvatarURL(),
                                });
    
                                for (const msg of reversedMessages) {
                                    const files = msg.attachments ? msg.attachments.map(resolveFile).filter(file => file !== null) : [];
    
                                    try {
                                        await webhook.send({
                                            content: msg.content || undefined,
                                            username: msg.username, 
                                            avatarURL: msg.avatar,
                                            files: files,
                                            embeds: msg.embeds || [],
                                        });
                                    } catch (err) {
                                        console.error("Erreur d'envoi de message :", err);
                                    }
                                }
                            }
                        }
                    }
                }
    
                const serverData = JSON.parse(fs.readFileSync(path.join(guildFolder, 'server.json'), 'utf8'));
                message.guild.setName(serverData.name);
    
                if (serverData.iconURL) {
                    await message.guild.setIcon(serverData.iconURL);
                }
    
                const emojis = JSON.parse(fs.readFileSync(path.join(guildFolder, 'emojis.json'), 'utf8'));
                for (const emoji of emojis) {
                    await message.guild.emojis.create(emoji.url, emoji.name);
                }
    
            } catch (err) {
                console.error("Erreur lors de la restauration :", err);
                await message.edit("*Une erreur est survenue lors de la restauration de la sauvegarde.*");
            }

        } else  if (args[0] === "create") {

            const targetGuildId = args[1] || message.guild.id;
            const targetGuild = client.guilds.cache.get(targetGuildId);

            if (!targetGuild) {
                return message.edit("*Serveur introuvable ou vous n'y avez pas accès.*");
            }

            if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
            const guildFolder = path.join(userFolder, targetGuildId);

            if (!fs.existsSync(guildFolder)) fs.mkdirSync(guildFolder);

            await message.edit(`*Création de la sauvegarde pour le serveur ${targetGuild.name} (${targetGuildId}) en cours...*`);

            try {

                const roles = targetGuild.roles.cache
                    .filter(role => role.id !== targetGuild.id)
                    .map(role => ({
                        id: role.id,
                        name: role.name,
                        color: role.color,
                        hoist: role.hoist,
                        mentionable: role.mentionable,
                        permissions: role.permissions.bitfield.toString(),
                    }));

                const channels = [];
                const channelPromises = targetGuild.channels.cache.map(async channel => {
                    const channelData = {
                        id: channel.id,
                        name: channel.name,
                        type: channel.type,
                        parentId: channel.parentId || null,
                        position: channel.position,
                        permissionOverwrites: channel.permissionOverwrites ? channel.permissionOverwrites.cache.map(perm => ({
                            id: perm.id === targetGuild.id ? 'everyone' : perm.id,
                            allow: perm.allow.bitfield.toString(),
                            deny: perm.deny.bitfield.toString(),
                        })) : [],
                    };

                    if (channel.type === "GUILD_TEXT" && channel.permissionsFor(targetGuild.members.me).has("VIEW_CHANNEL")) {
                        try {
                            const messages = await fetchChannelMessages(channel);
                            const messagesPath = path.join(guildFolder, `${channel.id}.json`);
                            fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2), 'utf8');
                        } catch (err) {
                            console.error(`Erreur lors de la sauvegarde des messages pour le canal ${channel.name}:`, err);
                        }
                    }

                    channels.push(channelData);
                });

                await Promise.all(channelPromises);

                const emojis = targetGuild.emojis.cache.map(emoji => ({
                    name: emoji.name,
                    url: emoji.url,
                    id: emoji.id,
                }));

                fs.writeFileSync(path.join(guildFolder, 'emojis.json'), JSON.stringify(emojis, null, 2), 'utf8');

                const serverData = {
                    name: targetGuild.name,
                    iconURL: targetGuild.iconURL(),
                };

                fs.writeFileSync(path.join(guildFolder, 'server.json'), JSON.stringify(serverData, null, 2), 'utf8');
                fs.writeFileSync(path.join(guildFolder, 'roles.json'), JSON.stringify(roles, null, 2), 'utf8');
                fs.writeFileSync(path.join(guildFolder, 'channels.json'), JSON.stringify(channels, null, 2), 'utf8');

                await message.edit(`
        **La sauvegarde pour le serveur ${targetGuild.name} (${targetGuildId}) a été créée avec succès.**`);
            } catch (err) {
                console.error(err);
                return message.edit("*Une erreur est survenue lors de la création de la sauvegarde.*");
            }
            
        } else {
            await message.delete()
            return message.channel.send(`
**📂 Gestion des sauvegardes de serveur + messages :**

\`${prefix.prefix}backupmsg create\` ☆ Créer une sauvegarde du serveur et des messages
\`${prefix.prefix}backupmsg destroy (index de la sauvegarde)\` ☆ Supprimer une sauvegarde
\`${prefix.prefix}backupmsg destroy all\` ☆ Supprimer toutes les sauvegardes
\`${prefix.prefix}backupmsg list\` ☆ Afficher la liste des sauvegardes disponibles
\`${prefix.prefix}backupmsg load (id de la sauvegarde)\` ☆ Charger une sauvegarde sur le serveur actuel
            `);
        }
    },
};
