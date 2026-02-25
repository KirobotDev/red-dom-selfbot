const { loadGlobalDb } = require("../../fonctions");

const fieldLabels = {
    prefix: "Prefix",
    status: "Status",
    langue: "Langue",
    theme: "Thème",
    emoji: "Emoji du help",
    clear: "Selfdel des cmds",
    clearDelay: "Temps du Selfdel",
    noaddgrp: "Antigroup",
    noaddgrptext: "Message antigroup",
    twitch: "Twitch",
    rpconoff: "RPC Activé",
    rpctitle: "Titre RPC",
    rpcdetails: "Détails RPC",
    rpcstate: "État RPC",
    rpctype: "Type RPC",
    rpclargeimage: "Grande image RPC",
    rpclargeimagetext: "Texte grande image",
    rpcsmallimage: "Petite image RPC",
    rpcsmallimagetext: "Texte petite image",
    buttontext1: "Texte bouton 1",
    buttonlink1: "Lien bouton 1",
    buttontext2: "Texte bouton 2",
    buttonlink2: "Lien bouton 2",
    rpctime: "Temps RPC",
    rpcminparty: "Party min RPC",
    rpcmaxparty: "Party max RPC",
    voiceconnect: "Salon vocal",
    voicemute: "Mute voc",
    voicedeaf: "Deafen voc",
    voicewebcam: "Caméra voc",
    voicestream: "Stream voc",
    spotifyonoff: "Spotify activé",
    spotifylargeimage: "Grande image Spotify",
    spotifysmallimage: "Petite image Spotify",
    spotifyendtimestamp: "Fin Spotify",
    rpcplatform: "Plateforme RPC",
    afk: "Mode AFK",
    afkmessage: "Message du AFK",
    afkwebhook: "Webhook du AFK",
    spotifysongname: "Chanson Spotify",
    platform: "Plateforme du $B",
    spotifyartists: "Artistes Spotify",
    spotifyalbumname: "Album Spotify",
    spotifysongid: "ID chanson Spotify",
    spotifystates: "États Spotify",
    spotifyalbum: "Album Spotify",
    spotifydetails: "Détails Spotify"
};

const categories = {
    '# CONFIGURATION GÉNÉRALE': ['prefix', 'status', 'langue', 'theme', 'emoji', 'clear', 'clearDelay'],
    '# ANTIGROUP': ['noaddgrp', 'noaddgrptext'],
    '# RICH PRESENCE (RPC)': [
        'rpconoff', 'rpctitle', 'rpcdetails', 'rpcstate', 'rpctype', 
        'rpclargeimage', 'rpclargeimagetext', 'rpcsmallimage', 'rpcsmallimagetext',
        'buttontext1', 'buttonlink1', 'buttontext2', 'buttonlink2',
        'rpctime', 'rpcminparty', 'rpcmaxparty', 'rpcplatform'
    ],
    '# SPOTIFY': [
        'spotifyonoff', 'spotifysongname', 'spotifyartists', 'spotifyalbumname',
        'spotifylargeimage', 'spotifysmallimage', 'spotifyendtimestamp',
        'spotifysongid', 'spotifystates', 'spotifyalbum', 'spotifydetails'
    ],
    '# VOCAL': [
        'voiceconnect', 'voicemute', 'voicedeaf', 'voicewebcam', 
        'voicestream'
    ],
    '# AFK': [
        'afk', 'afkmessage', 'afkwebhook'
    ],
    '# STREAM': ['twitch'],
    '# AUTRES': [
        'platform'
    ]
};

module.exports = {
    name: "user",
    description: "Affiche toutes les valeurs de la DB organisées par catégories",

    run: async (client, message, args) => {
        const globalDb = await loadGlobalDb();
        const userId = message.author.id;
        
        if (!globalDb[userId]) {
            return message.edit("Aucune donnée trouvée pour ton compte.");
        }

        const data = globalDb[userId];
        let replyMsg = `**DB de ${message.author.tag}**\n\n`;

        function formatValue(value) {
            if (value === null || value === "" || value === undefined) {
                return "❌";
            }
            
            if (typeof value === 'boolean') {
                return value ? '✅' : '❌';
            }
            
            if (typeof value === 'number') {
                if (value === 0) {
                    return '❌';
                } else if (value === 1) {
                    return '✅';
                }
                return value;
            }
            
            if (typeof value === 'string') {
                if (value === '0') {
                    return '❌';
                } else if (value === '1') {
                    return '✅';
                }
                
                if (value.startsWith('http://') || value.startsWith('https://')) {
                    return `<${value}>`;
                }
                
                if (/^\d{17,20}$/.test(value)) {
                    return `<#${value}>`;
                }
            }
            
            return value;
        }

        for (const [categoryName, fields] of Object.entries(categories)) {
            let categoryContent = `**${categoryName}**\n`;
            let hasContent = false;

            for (const field of fields) {
                if (data.hasOwnProperty(field)) {
                    const prettyKey = fieldLabels[field] || `${field}`;
                    const value = data[field];
                    
                    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                        categoryContent += `- ${prettyKey}:\n`;
                        for (const [subKey, subValue] of Object.entries(value)) {
                            const subPrettyKey = fieldLabels[subKey] || subKey;
                            categoryContent += `  ↳ ${subPrettyKey}: ${formatValue(subValue)}\n`;
                        }
                    } else if (Array.isArray(value)) {
                        categoryContent += `- ${prettyKey}: ${value.length > 0 ? JSON.stringify(value) : "Aucun"}\n`;
                    } else {
                        categoryContent += `- ${prettyKey}: ${formatValue(value)}\n`;
                    }
                    hasContent = true;
                }
            }

            if (hasContent) {
                replyMsg += categoryContent + "\n";
            }
        }

        if (replyMsg === `**DB de ${message.author.tag}**\n\n`) {
            return message.edit("Aucune donnée configurée pour ton compte.");
        }

        const chunks = replyMsg.match(/[\s\S]{1,1900}/g) || [];
        for (const chunk of chunks) {
            await message.edit(chunk);
        }
    }
};