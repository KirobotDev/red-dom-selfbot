const { getCurrentPrefix, updatePrefixCache } = require('../../fonctions');
const sqlDb = require('../../sqlDb');

const DEFAULT_USER_STRUCTURE = {
    "prefix": "&",
    "status": "dnd",
    "langue": "fr",
    "time": 60000,
    "theme": "default",
    "emoji": "🚩",
    "noaddgrp": false,
    "noaddgrptext": null,
    "twitch": "https://twitch.tv/talmo",
    "rpconoff": true,
    "rpctitle": "Reddom, Best $elfbot",
    "rpcdetails": "Reddom on top",
    "rpcstate": "✦",
    "rpctype": "COMPETING",
    "rpclargeimage": "https://media.discordapp.net/external/oQkool7cvJhG6A8uvjC8yBrV0fXXmZWDk19tkuErBEo/https/i.postimg.cc/d3t17rL0/93341f22-9f6f-45fd-b330-09a985aee732.png?format=png&quality=lossless",
    "rpclargeimagetext": ".gg/reddom",
    "rpcsmallimage": "",
    "rpcsmallimagetext": null,
    "appid": "1277327736050024562",
    "buttontext1": "",
    "buttonlink1": "",
    "buttontext2": null,
    "buttonlink2": null,
    "rpctime": "2025-02-19T21:40:44.146Z",
    "rpcminparty": 1,
    "rpcmaxparty": 5,
    "streaming": null,
    "webhooklogs": null,
    "voiceconnect": "",
    "voicemute": false,
    "voicedeaf": false,
    "voicewebcam": true,
    "voicestream": false,
    "spotifyonoff": "off",
    "spotifylargeimage": "https://media.discordapp.net/external/D07f0oGOpDGG9LgrnYf4BoTvUSoDi2QXLj6m1ur_bAg/https/i.postimg.cc/8cVRxyKW/23822a37-b77e-4ef9-a922-9898e80b5d58.png?format=png&quality=lossless",
    "spotifysmallimage": "",
    "spotifysongname": "",
    "spotifyartists": "",
    "spotifyalbumname": "",
    "spotifyendtimestamp": null,
    "spotifysongid": "",
    "spotifyalbumid": "",
    "spotifyartistids": [],
    "spotifystates": "",
    "botname": "Red Dom",
    "rpcplatform": "desktop",
    "afk": null,
    "afkmessage": null,
    "afkwebhook": null,
    "clear": false,
    "clearDelay": 60
};

function upgradeUserData(userData) {
    let modified = false;

    for (const key in DEFAULT_USER_STRUCTURE) {
        if (!(key in userData)) {
            userData[key] = DEFAULT_USER_STRUCTURE[key];
            modified = true;
        } else if (typeof DEFAULT_USER_STRUCTURE[key] === 'object' && 
                   DEFAULT_USER_STRUCTURE[key] !== null && 
                   !Array.isArray(DEFAULT_USER_STRUCTURE[key])) {
            if (typeof userData[key] !== 'object' || userData[key] === null) {
                userData[key] = JSON.parse(JSON.stringify(DEFAULT_USER_STRUCTURE[key]));
                modified = true;
            } else {
                for (const subKey in DEFAULT_USER_STRUCTURE[key]) {
                    if (!(subKey in userData[key])) {
                        userData[key][subKey] = DEFAULT_USER_STRUCTURE[key][subKey];
                        modified = true;
                    }
                }
            }
        }
    }

    return modified;
}

async function initUserData(userId) { 
    let userData = await sqlDb.getUserData(userId);
    
    const isNewUser = !userData || Object.keys(userData).length === 1 && userData.user_id;
    
    if (isNewUser) { 
        userData = { ...DEFAULT_USER_STRUCTURE, user_id: userId };
        await sqlDb.setUserData(userId, userData);
    } else { 
        const wasModified = upgradeUserData(userData);
         
        if (wasModified) {
            await sqlDb.updateUserData(userId, userData);
        }
    }
    
    const oldPrefix = await getCurrentPrefix(userId);
    const newPrefix = userData.prefix || "&";
    if (oldPrefix !== newPrefix) {
        await updatePrefixCache(userId, newPrefix);
    }
    
    return userData;
} 

async function updateClearSetting(userId, clear, clearDelay) {
    const userData = await sqlDb.getUserData(userId);
    if (!userData) return;
    
    userData.clear = clear;
    userData.clearDelay = clearDelay;
    
    await sqlDb.updateUserData(userId, userData);
}

async function safeEditMessage(message, content, options = {}) {
    try { 
        let editContent = content;
        
        if (typeof editContent === 'string') {
            editContent = { content: editContent };
        }
         
        const safeContent = { ...editContent };
        
        if (safeContent.attachments) {
            delete safeContent.attachments;
        }
        
        return await message.edit(safeContent, options);
        
    } catch (error) {
        throw error;
    }
}

const activeCommands = new Map();
const scheduledDeletions = new Map();

async function handleCommand(client, message, commandName, args, prefix, db) {
    try {
        const userId = client.user.id;
        const commandId = `${userId}_${Date.now()}`;
        
        const commandFile = client.commands.get(commandName) ||
                      client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!commandFile) {
            return false;
        }
 
        const controller = new AbortController();
        const signal = controller.signal;
         
        activeCommands.set(commandId, {
            client,
            message,
            commandName,
            controller,
            startTime: Date.now()
        });
 
        const commandPromise = commandFile.run(client, message, args, db, prefix);
         
        const result = await Promise.race([
            commandPromise,
            new Promise((_, reject) => {
                signal.addEventListener('abort', () => {
                    reject(new Error('COMMAND_KILLED'));
                });
            })
        ]);
        
        if (scheduledDeletions.has(message.id)) {
            clearTimeout(scheduledDeletions.get(message.id));
            scheduledDeletions.delete(message.id);
        }
         
        const shouldClear = db.clear === true && db.clearDelay && db.clearDelay >= 10;
        
        if (shouldClear) {
            const delay = db.clearDelay * 1000;
            
            const deletionTimeout = setTimeout(async () => {
                try {
                    await message.delete();
                } catch (err) {}
                scheduledDeletions.delete(message.id);
            }, delay);
            
            scheduledDeletions.set(message.id, deletionTimeout);
        }
 
        activeCommands.delete(commandId);
        
        return true;

    } catch (error) { 
        const userId = client.user.id;
        const commandKeys = Array.from(activeCommands.keys()).filter(key => key.startsWith(`${userId}_`));
        commandKeys.forEach(key => activeCommands.delete(key));
        
        try { 
        } catch (e) {}
        
        return false;
    }
}

async function processMessage(message, client) {
    if (message.author.id !== client.user.id) {
        return;
    }

    const db = await initUserData(client.user.id);
    const userPrefix = db.prefix || "&";
    const defaultPrefix = "&";
    
    let usedPrefix = null;
    let args = null;
    let commandName = null;
     
    if (message.content.startsWith(defaultPrefix)) {
        args = message.content.slice(defaultPrefix.length).trim().split(/ +/g);
        commandName = args.shift().toLowerCase();
         
        if (commandName === "user") {
            usedPrefix = defaultPrefix;
        } else { 
            if (message.content.startsWith(userPrefix)) {
                const userArgs = message.content.slice(userPrefix.length).trim().split(/ +/g);
                const userCommandName = userArgs.shift().toLowerCase();
                 
                if (userCommandName === commandName) {
                    usedPrefix = userPrefix;
                    args = userArgs;
                } else { 
                    return;
                }
            } else { 
                return;
            }
        }
    } else if (message.content.startsWith(userPrefix)) { 
        usedPrefix = userPrefix;
        args = message.content.slice(userPrefix.length).trim().split(/ +/g);
        commandName = args.shift().toLowerCase(); 
    } else {
        return;
    }
    
    if (!commandName || !usedPrefix) {
        return;
    }

    await handleCommand(client, message, commandName, args, usedPrefix, db);
}

module.exports = {
    name: "messageCreate",
    once: false,
    run: async (message, client) => {
        try {
            await processMessage(message, client);
        } catch (error) {
            console.error('Erreur messageCreate:', error);
        }
    }
};