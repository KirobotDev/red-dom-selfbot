const { PermissionsBitField, ChannelType } = require('discord.js');
const { language, loadGlobalDb } = require("../../fonctions");
const path = require('path');
const themes = require(path.join(__dirname, '..', 'Help', 'themes.js'));

const vocCommands = {
    "autovoc": "🎙️ Afk dans un vocal",
    "setdeaf": "🎧 Mute casque",
    "setmute": "🎤 Mute micro",
	"setwebcam": "📷 Active la cam",
    "setstream": "📺 Active le stream",
    "voc deaf": "🔇 Mute casque un user",
    "voc hide": "👻 Cache le salon vocal",
    "voc kick": "👢 Kick un user d'un vc",
    "voc limit": "🔢 Limite le nb d'users",
    "voc lock": "🔒 Verrouille le voc",
    "voc massdeaf": "🔇 Assourdi tous users",
    "voc masskick": "👢 Kick tous les users",
    "voc massmove": "🚚 Déplace tous users",
    "voc massmute": "🔇 Mute tous les users",
    "voc massundeaf": "🔊 Rend l'ouïe à tlm",
    "voc massunmute": "🔊 Rend la voix à tlm",
    "voc move": "🚚 Déplace un user",
    "voc mute": "🔇 Mute un user",
    "voc rename": "🏷️ Renomme le voc",
    "voc undeaf": "🔊 Redonne l'ouïe",
    "voc unhide": "👀 Révèle le salon",
    "voc unlock": "🔓 Déverrouille le voc",
    "voc unmute": "🔊 Redonne la voix"
};

const englishVocCommands = {
    "autovoc": "🎙️ Afk in a voice room",
    "setdeaf": "🎧 Mute your headset",
    "setmute": "🎤 Mute your microphone",
	"setwebcam": "📷 Activate the cam",
    "setstream": "📺 Activate the stream",
    "voc deaf": "🔇 Deafen user",
    "voc hide": "👻 Hide voice channel",
    "voc kick": "👢 Kick user from vc",
    "voc limit": "🔢 Set user limit",
    "voc lock": "🔒 Lock voice channel",
    "voc massdeaf": "🔇 Deafen all users",
    "voc masskick": "👢 Kick all users",
    "voc massmove": "🚚 Move all users",
    "voc massmute": "🔇 Mute all users",
    "voc massundeaf": "🔊 Undeafen all users",
    "voc massunmute": "🔊 Unmute all users",
    "voc move": "🚚 Move user to a vc",
    "voc mute": "🔇 Mute user",
    "voc rename": "🏷️ Rename voice channel",
    "voc undeaf": "🔊 Undeafen user",
    "voc unhide": "👀 Unhide voice channel",
    "voc unlock": "🔓 Unlock voice channel",
    "voc unmute": "🔊 Unmute user"
};

function generateVocMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishVocCommands : vocCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "voc",
	aliases: ["voice"],
    description: "🎤 Gestion des salons vocaux",
    run: async (client, message, args, db) => {
        try {
            await message.delete().catch(() => {});

            const subCommand = args[0]?.toLowerCase();
            const target = args[1];
            const channelArg = args[2];
            const limitArg = args[2];

            if (!subCommand) {
                const globalDb = await loadGlobalDb();
                const userId = client.user.id;
                
                if (!globalDb[userId]) {
                    globalDb[userId] = { langue: "fr", theme: "default" };
                }
                const userDb = globalDb[userId];
                
                const theme = userDb.theme || "default";
                const vocMessage = generateVocMessage(theme, db.prefix, userId, 'fr');
                const englishMessage = generateVocMessage(theme, db.prefix, userId, 'en');

                return message.channel.send(await language(client, vocMessage, englishMessage));
            }

const validSubCommands = ['kick', 'move', 'mute', 'unmute', 'deaf', 'undeaf', 'lock', 'unlock', 'hide', 'unhide', 'rename', 'massmove', 'massmute', 'massunmute', 'masskick', 'massdeaf', 'massundeaf', 'limit'];

if (subCommand && !validSubCommands.includes(subCommand)) {
    const globalDb = await loadGlobalDb();
    const userId = client.user.id;
    
    if (!globalDb[userId]) {
        globalDb[userId] = { langue: "fr", theme: "default" };
    }
    const userDb = globalDb[userId];
    
    const theme = userDb.theme || "default";
    const vocMessage = generateVocMessage(theme, db.prefix, userId, 'fr');
    const englishMessage = generateVocMessage(theme, db.prefix, userId, 'en');

    return message.channel.send(await language(client, vocMessage, englishMessage));
}

if (!message.member.permissions.has(PermissionsBitField.Flags.MoveMembers) && 
    !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers) &&
    !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    return message.channel.send('Tu n\'as pas les permissions nécessaires pour gérer le vocal');
}

            const noTargetCommands = ['lock', 'unlock', 'hide', 'unhide', 'massmute', 'massunmute', 'masskick', 'massdeaf', 'massundeaf'];
            const requiresChannel = ['massmove', 'rename', 'limit'];
            
            if (!noTargetCommands.includes(subCommand) && !requiresChannel.includes(subCommand) && !target) {
                return message.channel.send('Veuillez mentionner un utilisateur ou fournir un ID');
            }

            const requiresUserInVoice = ['kick', 'move', 'mute', 'unmute', 'deaf', 'undeaf'];
            
            if (requiresUserInVoice.includes(subCommand)) {
                let targetUser;
                if (message.mentions.users.first()) {
                    targetUser = message.mentions.users.first();
                } else {
                    try {
                        targetUser = await client.users.fetch(target);
                    } catch {
                        return message.channel.send('Utilisateur introuvable');
                    }
                }

                const targetMember = await message.guild.members.fetch(targetUser.id).catch(() => null);
                if (!targetMember) {
                    return message.channel.send('Cet utilisateur n\'est pas sur ce serveur');
                }

                const targetVoiceChannel = targetMember.voice.channel;
                if (!targetVoiceChannel) {
                    return message.channel.send('Cet utilisateur n\'est pas dans un salon vocal');
                }

                switch (subCommand) {
                    case 'kick':
                    case 'expulser':
                    case 'k':
                        try {
                            await targetMember.voice.disconnect();
                            message.channel.send(`${targetUser.tag} a été expulsé du vocal`).then(msg => setTimeout(() => msg.delete(), 3000));
                        } catch (error) {
                            await message.channel.send('Impossible d\'expulser cet utilisateur');
                        }
                        break;

                    case 'move':
                    case 'deplacer':
                    case 'm':
                        if (!channelArg) {
                            return message.channel.send('Veuillez spécifier un salon vocal');
                        }

                        try {
                            let targetChannel;
                            
                            const channelMention = message.mentions.channels.first();
                            if (channelMention) {
                                targetChannel = channelMention;
                            } 
                            
                            else if (/^\d+$/.test(channelArg)) {
                                targetChannel = await message.guild.channels.fetch(channelArg).catch(() => null);
                            }
                            
                            else {
                                targetChannel = message.guild.channels.cache.find(
                                    channel => 
                                        (channel.name.toLowerCase().includes(channelArg.toLowerCase()) || 
                                         channel.id === channelArg) && 
                                        channel.type === ChannelType.GuildVoice
                                );
                            }

                            if (!targetChannel) {
                                return message.channel.send(`Salon vocal "${channelArg}" introuvable`);
                            }

                            if (!targetChannel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.Connect)) {
                                return message.channel.send('Je n\'ai pas la permission de me connecter à ce salon vocal');
                            }

                            await targetMember.voice.setChannel(targetChannel);
                            message.channel.send(`${targetUser.tag} a été déplacé vers ${targetChannel.name}`).then(msg => setTimeout(() => msg.delete(), 3000));
                        } catch (error) {
                            await message.channel.send('Impossible de déplacer cet utilisateur');
                        }
                        break;
                        
                    case 'mute':
                    case 'sourdine':
                        try {
                            await targetMember.voice.setMute(true);
                            message.channel.send(`${targetUser.tag} a été mis en sourdine`).then(msg => setTimeout(() => msg.delete(), 3000));
                        } catch (error) {
                            await message.channel.send('Impossible de mettre en sourdine cet utilisateur');
                        }
                        break;

                    case 'unmute':
                    case 'unsourdine':
                    case 'um':
                        try {
                            await targetMember.voice.setMute(false);
                            message.channel.send(`Sourdine retirée pour ${targetUser.tag}`).then(msg => setTimeout(() => msg.delete(), 3000));
                        } catch (error) {
                            await message.channel.send('Impossible de retirer la sourdine');
                        }
                        break;

                    case 'deaf':
                    case 'sourdine':
                    case 'sourd':
                    case 'deafen':
                    case 'c':
                        try {
                            await targetMember.voice.setDeaf(true);
                            message.channel.send(`Mise en sourdine pour ${targetUser.tag}`).then(msg => setTimeout(() => msg.delete(), 3000));
                        } catch (error) {
                            await message.channel.send('Impossible de mettre en sourdine cet utilisateur');
                        }
                        break;

                    case 'undeaf':
                    case 'unsourd':
                    case 'undeafen':
                    case 'uc':
                        try {
                            await targetMember.voice.setDeaf(false);
                            message.channel.send(`Sourdine retirée pour ${targetUser.tag}`).then(msg => setTimeout(() => msg.delete(), 3000));
                        } catch (error) {
                            await message.channel.send('Impossible d\'enlever la sourdine');
                        }
                        break;
                }
            }

            async function getVoiceChannel(channelId, authorChannel) {
                if (channelId && /\d{15,20}/.test(channelId)) {
                    try {
                        const channel = await message.guild.channels.fetch(channelId.match(/\d{15,20}/)[0]);
                        if (channel && channel.type === 'GUILD_VOICE') {
                            return channel;
                        }
                    } catch (error) {
                        return null;
                    }
                }
                return authorChannel;
            }

            const authorVoiceChannel = message.member.voice.channel;
            let targetVoiceChannel = authorVoiceChannel;
            
            switch (subCommand) {
                case 'lock':
                case 'verrouiller':
                    targetVoiceChannel = await getVoiceChannel(target, authorVoiceChannel);
                    if (!targetVoiceChannel) {
                        return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                    }
                    
                    try {
                        if (!targetVoiceChannel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
                            return message.channel.send('Je n\'ai pas la permission de gérer ce salon vocal');
                        }

                        const { Connect } = PermissionsBitField.Flags;
                        await targetVoiceChannel.permissionOverwrites.edit(message.guild.id, {
                            [Connect]: false
                        });
                        message.channel.send('Le salon a bien été lock').then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible de verrouiller le salon');
                    }
                    break;

                case 'unlock':
                case 'deverrouiller':
                    targetVoiceChannel = await getVoiceChannel(target, authorVoiceChannel);
                    if (!targetVoiceChannel) {
                        return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                    }
                    
                    try {
                        if (!targetVoiceChannel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
                            return message.channel.send('Je n\'ai pas la permission de gérer ce salon vocal');
                        }

                        const { Connect } = PermissionsBitField.Flags;
                        await targetVoiceChannel.permissionOverwrites.edit(message.guild.id, {
                            [Connect]: true
                        });
                        message.channel.send('Le salon a bien été unlock').then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible de déverrouiller le salon');
                    }
                    break;

                case 'hide':
                    targetVoiceChannel = await getVoiceChannel(target, authorVoiceChannel);
                    if (!targetVoiceChannel) {
                        return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                    }
                    
                    try {
                        if (!targetVoiceChannel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
                            return message.channel.send('Je n\'ai pas la permission de gérer ce salon vocal');
                        }

                        const { ViewChannel } = PermissionsBitField.Flags;
                        await targetVoiceChannel.permissionOverwrites.edit(message.guild.id, {
                            [ViewChannel]: false
                        });
                        message.channel.send('Le salon a bien été hide').then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible de cacher le salon');
                    }
                    break;

                case 'unhide':
                    targetVoiceChannel = await getVoiceChannel(target, authorVoiceChannel);
                    if (!targetVoiceChannel) {
                        return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                    }
                    
                    try {
                        if (!targetVoiceChannel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
                            return message.channel.send('Je n\'ai pas la permission de gérer ce salon vocal');
                        }

                        const { ViewChannel } = PermissionsBitField.Flags;
                        await targetVoiceChannel.permissionOverwrites.edit(message.guild.id, {
                            [ViewChannel]: true
                        });
                        message.channel.send('Le salon a bien été unhide').then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible de montrer le salon');
                    }
                    break;

                case 'rename':
                    let channelToRename;
                    let newName;
                    
                    const lastArg = args[args.length - 1];
                    const idMatch = lastArg ? lastArg.match(/\d{15,20}/) : null;
                    
                    if (idMatch) {
                        const channelId = idMatch[0];
                        newName = args.slice(1, -1).join(' ');
                        
                        try {
                            channelToRename = await message.guild.channels.fetch(channelId);
                            if (!channelToRename || channelToRename.type !== 'GUILD_VOICE') {
                                return message.channel.send('Salon vocal introuvable');
                            }
                        } catch (error) {
                            return message.channel.send('Salon vocal introuvable');
                        }
                    } else {
                        channelToRename = authorVoiceChannel;
                        newName = args.slice(1).join(' ');
                        
                        if (!channelToRename) {
                            return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                        }
                    }
                    
                    if (!newName || newName.trim() === '') {
                        return message.channel.send('Veuillez spécifier un nouveau nom pour le salon');
                    }
                    
                    if (newName.length > 100) {
                        return message.channel.send('Le nom du salon ne peut pas dépasser 100 caractères');
                    }
                    
                    try {
                        if (!channelToRename.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
                            return message.channel.send('Je n\'ai pas la permission de gérer ce salon vocal');
                        }

                        await channelToRename.setName(newName);
                        message.channel.send(`Le salon a bien été renommé en : ${newName}`).then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible de renommer le salon');
                    }
                    break;

                case 'massmove':
                case 'mm':
                    if (!target) {
                        return message.channel.send('Veuillez spécifier l\'ID du salon de destination');
                    }
                    
                    try {
                        let targetChannel;
                        
                        if (/^\d+$/.test(target)) {
                            targetChannel = await message.guild.channels.fetch(target).catch(() => null);
                        } else {
                            targetChannel = message.guild.channels.cache.find(
                                channel => 
                                    channel.name.toLowerCase().includes(target.toLowerCase()) && 
                                    channel.type === ChannelType.GuildVoice
                            );
                        }

                        if (!targetChannel) {
                            return message.channel.send(`Salon vocal "${target}" introuvable`);
                        }

                        const sourceChannel = await getVoiceChannel(channelArg, authorVoiceChannel);
                        if (!sourceChannel) {
                            return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon source');
                        }

                        const members = sourceChannel.members;
                        if (members.size === 0) {
                            return message.channel.send('Aucun utilisateur dans le salon vocal source');
                        }

                        for (const member of members.values()) {
                            try {
                                await member.voice.setChannel(targetChannel);
                            } catch (error) {}
                        }
                        message.channel.send(`${members.size} utilisateurs ont été déplacés`).then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible d\'effectuer le déplacement de masse');
                    }
                    break;

                case 'massmute':
                case 'mmute':
                    targetVoiceChannel = await getVoiceChannel(target, authorVoiceChannel);
                    if (!targetVoiceChannel) {
                        return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                    }
                    
                    try {
                        const members = targetVoiceChannel.members;
                        let mutedCount = 0;
                        
                        for (const member of members.values()) {
                            try {
                                if (member.id !== message.author.id && !member.voice.serverMute) {
                                    await member.voice.setMute(true);
                                    mutedCount++;
                                }
                            } catch (error) {}
                        }
                        message.channel.send(`${mutedCount} utilisateurs ont été mutés`).then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible d\'effectuer la sourdine de masse');
                    }
                    break;

                case 'massunmute':
                case 'munmute':
                    targetVoiceChannel = await getVoiceChannel(target, authorVoiceChannel);
                    if (!targetVoiceChannel) {
                        return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                    }
                    
                    try {
                        const members = targetVoiceChannel.members;
                        let unmutedCount = 0;
                        
                        for (const member of members.values()) {
                            try {
                                if (member.voice.serverMute) {
                                    await member.voice.setMute(false);
                                    unmutedCount++;
                                }
                            } catch (error) {}
                        }
                        message.channel.send(`${unmutedCount} utilisateurs ont été unmutés`).then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible d\'effectuer le retrait de sourdine de masse');
                    }
                    break;

                case 'masskick':
                case 'mkick':
                    targetVoiceChannel = await getVoiceChannel(target, authorVoiceChannel);
                    if (!targetVoiceChannel) {
                        return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                    }
                    
                    try {
                        const members = targetVoiceChannel.members;
                        let kickedCount = 0;
                        
                        for (const member of members.values()) {
                            try {
                                if (member.id !== message.author.id) {
                                    await member.voice.disconnect();
                                    kickedCount++;
                                }
                            } catch (error) {}
                        }
                        message.channel.send(`${kickedCount} utilisateurs ont été kick`).then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible d\'effectuer l\'expulsion de masse');
                    }
                    break;

                case 'massdeaf':
                case 'mdeaf':
                    targetVoiceChannel = await getVoiceChannel(target, authorVoiceChannel);
                    if (!targetVoiceChannel) {
                        return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                    }
                    
                    try {
                        const members = targetVoiceChannel.members;
                        let casquedCount = 0;
                        
                        for (const member of members.values()) {
                            try {
                                if (member.id !== message.author.id && !member.voice.serverDeaf) {
                                    await member.voice.setDeaf(true);
                                    casquedCount++;
                                }
                            } catch (error) {}
                        }
                        message.channel.send(`${casquedCount} utilisateurs ont été mis en sourdine`).then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible d\'effectuer la sourdine de masse');
                    }
                    break;

                case 'massundeaf':
                case 'mundeaf':
                    targetVoiceChannel = await getVoiceChannel(target, authorVoiceChannel);
                    if (!targetVoiceChannel) {
                        return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                    }
                    
                    try {
                        const members = targetVoiceChannel.members;
                        let uncasquedCount = 0;
                        
                        for (const member of members.values()) {
                            try {
                                if (member.voice.serverDeaf) {
                                    await member.voice.setDeaf(false);
                                    uncasquedCount++;
                                }
                            } catch (error) {}
                        }
                        message.channel.send(`${uncasquedCount} utilisateurs ont été undeaf retiré`).then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible d\'effectuer l\'undeaf de masse');
                    }
                    break;

                case 'limit':
                case 'limite':
                    targetVoiceChannel = await getVoiceChannel(target, authorVoiceChannel);
                    if (!targetVoiceChannel) {
                        return message.channel.send('Vous devez être dans un salon vocal ou spécifier un ID de salon');
                    }
                    
                    const limit = parseInt(limitArg);
                    if (isNaN(limit) || limit < 0 || limit > 99) {
                        return message.channel.send('Veuillez spécifier une limite valide entre 0 et 99');
                    }
                    
                    try {
                        if (!targetVoiceChannel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
                            return message.channel.send('Je n\'ai pas la permission de gérer ce salon vocal');
                        }

                        await targetVoiceChannel.setUserLimit(limit);
                        const limitText = limit === 0 ? "illimité" : limit;
                        message.channel.send(`Limite du salon définie à ${limitText} utilisateurs`).then(msg => setTimeout(() => msg.delete(), 3000));
                    } catch (error) {
                        await message.channel.send('Impossible de modifier la limite du salon');
                    }
                    break;

                default:
                    if (!requiresUserInVoice.includes(subCommand)) {
                        await message.channel.send(`Sous-commande non reconnue\nUtilise \`${db.prefix}voc\` pour voir les commandes disponibles.`);
                    }
            }

        } catch (error) {
            await message.channel.send('Une erreur est survenue').catch(() => {});
        }
    }
};