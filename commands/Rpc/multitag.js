const fs = require('fs');
const path = require('path');
const { language, loadGlobalDb } = require("../../fonctions");
const themes = require(path.join(__dirname, '..', 'Help', 'themes.js'));

const clanConfigDB = path.resolve(__dirname, './clan_config.json');
const MAX_CLANS = 10;
const MIN_ROTATION_TIME = 60;
const MAX_ROTATION_TIME = 300;

const clanCommands = {
    "multitag add": "➕ Ajoute un tag",
    "multitag del": "➖ Delete un tag",
    "multitag rmall": "❌ Delete tout tag",
    "multitag list": "📰 Liste des tags", 
    "multitag run": "⚡ Rotation activee",
    "multitag stop": "☂️ Rotation arretee", 
    "multitag time": "⏱️ Temps de rotation"
};

const englishClanCommands = {
    "multitag add": "➕ Add a tag",
    "multitag del": "➖ Delete a tag", 
    "multitag rmall": "❌ Delete all tags",
    "multitag list": "📰 List of tags",
    "multitag run": "⚡ Rotation activated",
    "multitag stop": "☂️ Rotation stopped",
    "multitag time": "⏱️ Rotation's time"
};

async function generateClanMessage(theme, prefix, userId, lang = 'fr') {
    try {
        const globalDb = await loadGlobalDb();
        const userDb = globalDb[userId] || {};
        const userTheme = userDb.theme || theme || "default";
        
        const themeFunction = themes[userTheme] || themes.default;
        const commandSet = lang === 'en' ? englishClanCommands : clanCommands;
        
        return await themeFunction(prefix, commandSet, userId, lang);
    } catch (error) {
        const commandSet = lang === 'en' ? englishClanCommands : clanCommands;
        let message = lang === 'en' ? "Clan Rotation Commands\n\n" : "Commandes de Rotation des Tags\n\n";
        for (const [cmd, desc] of Object.entries(commandSet)) {
            message += `${prefix}${cmd} -> ${desc}\n`;
        }
        return message;
    }
}

class ClanDatabaseManager {
    constructor() {
        this.db = {};
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(clanConfigDB)) {
                const content = fs.readFileSync(clanConfigDB, 'utf8');
                this.db = JSON.parse(content);
            }
        } catch (error) {
            this.db = {};
            this.save();
        }
    }

    save() {
        try {
            const dir = path.dirname(clanConfigDB);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            const tempFile = clanConfigDB + '.tmp';
            fs.writeFileSync(tempFile, JSON.stringify(this.db, null, 2), 'utf8');
            
            fs.renameSync(tempFile, clanConfigDB);
        } catch (error) {
        }
    }

    getUserData(userId) {
        if (!this.db[userId]) {
            this.db[userId] = {
                clans: [],
                isRotating: false,
                rotationTime: 30,
                currentClanIndex: 0,
                currentClan: null
            };
        }
        return this.db[userId];
    }

    updateUserData(userId, updates) {
        const userData = this.getUserData(userId);
        Object.assign(userData, updates);
        this.save();
        return userData;
    }

    getAllUsersWithRotation() {
        const usersWithRotation = [];
        
        for (const [userId, userData] of Object.entries(this.db)) {
            if (userData.isRotating && userData.clans && userData.clans.length > 0) {
                usersWithRotation.push({
                    userId,
                    ...userData
                });
            }
        }
        
        return usersWithRotation;
    }
}

const clanDbManager = new ClanDatabaseManager();
let clanRotationIntervals = new Map();

class ClanRotationManager {
    static start(client, userId) {
        this.stop(userId);
        
        const userData = clanDbManager.getUserData(userId);
        if (!userData.isRotating || userData.clans.length === 0) return;

        const interval = setInterval(() => {
            this.updateClan(client, userId);
        }, userData.rotationTime * 1000);

        clanRotationIntervals.set(userId, interval);
        this.updateClan(client, userId);
    }

    static stop(userId) {
        if (clanRotationIntervals.has(userId)) {
            clearInterval(clanRotationIntervals.get(userId));
            clanRotationIntervals.delete(userId);
        }
    }

    static async updateClan(client, userId) {
        const userData = clanDbManager.getUserData(userId);
        
        if (!userData.isRotating || userData.clans.length === 0) {
            this.stop(userId);
            return;
        }

        const clanId = userData.clans[userData.currentClanIndex];

        try {
            let token = client.token;
            
            if (!token) {
                clanDbManager.updateUserData(userId, { isRotating: false });
                this.stop(userId);
                return;
            }
            
            const headers = {
                'User-Agent': 'Mozilla/5.0',
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Authorization': token,
                'Origin': 'https://discord.com',
            };

            const response = await fetch('https://discord.com/api/v9/users/@me/clan', {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    identity_guild_id: clanId,
                    identity_enabled: true,
                }),
            });
            
            if (response.status === 200) {
                clanDbManager.updateUserData(userId, { 
                    currentClan: clanId,
                    currentClanIndex: userData.currentClanIndex
                });
            } else if (response.status === 401) {
                clanDbManager.updateUserData(userId, { isRotating: false });
                this.stop(userId);
                return;
            } else if (response.status === 429) {
                return;
            }

        } catch (err) {
            clanDbManager.updateUserData(userId, { isRotating: false });
            this.stop(userId);
            return;
        }

        const nextIndex = (userData.currentClanIndex + 1) % userData.clans.length;
        clanDbManager.updateUserData(userId, { currentClanIndex: nextIndex });
    }

    static restoreAllRotations(client) {
        const usersWithRotation = clanDbManager.getAllUsersWithRotation();
        
        for (const userData of usersWithRotation) {
            const { userId } = userData;
            this.start(client, userId);
        }
    }
}

function initializeClanRotations(client) {
    ClanRotationManager.restoreAllRotations(client);
}

async function getClanTag(client, guildId) {
    try {
        const tagMapping = {
            '1274437651759632484': 'RED', 
            '1357667814667718746': 'Kiro'  
        };
        
        if (tagMapping[guildId]) {
            return tagMapping[guildId];
        }
         
        let token = client.token;
        
        if (!token) {
            return '?';
        }
        
        const headers = { 'Authorization': token };

        const response = await fetch('https://discord.com/api/v9/users/@me', {
            headers: headers
        });
        
        if (response.ok) {
            const userData = await response.json();
            
            if (userData.clan && userData.clan.identity_guild_id === guildId) {
                return userData.clan.tag;
            }
        }
        
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
            return createSimpleTag(guild.name);
        }
        
        return '?';
    } catch (error) {
        return '?';
    }
}

function createSimpleTag(name) {
    if (!name) return '?';
    
    const cleanName = name
        .replace(/[^a-zA-Z0-9\s]/g, '')  
        .replace(/\s+/g, ' ')           
        .trim();
    
    const words = cleanName.split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return '?';
    
    if (words.length === 1) {
        return words[0].substring(0, Math.min(4, words[0].length)).toUpperCase();
    } else {
        return words.map(word => word.charAt(0).toUpperCase()).join('');
    }
}

async function getCurrentClanTag(client) {
    try {
        let token = client.token;
        
        if (!token) {
            return 'Aucun';
        }
        
        const headers = { 'Authorization': token };

        const response = await fetch('https://discord.com/api/v9/users/@me', {
            headers: headers
        });
        
        if (response.ok) {
            const userData = await response.json();
            
            if (userData.clan && userData.clan.tag) {
                return userData.clan.tag;
            }
        }
        
        return 'Aucun';
    } catch (error) {
        return 'Aucun';
    }
}

module.exports = {
    name: "multitag",
    description: "Configurer la rotation automatique des tags",
    aliases: ["tag", "multitags", "tagrotate", "tagrot"],
    run: async (client, message, args, db, prefix) => {
        try {
            const userId = client.user.id;
            const userData = clanDbManager.getUserData(userId);

            if (!args[0]) {
                const globalDb = await loadGlobalDb();
                const userGlobalDb = globalDb[userId] || { langue: "fr", theme: "default" };
                const theme = userGlobalDb.theme || "default";
                
                const clanMessage = await generateClanMessage(theme, prefix, userId, 'fr');
                const englishMessage = await generateClanMessage(theme, prefix, userId, 'en');

                return message.edit(await language(client, clanMessage, englishMessage));
            }

            switch (args[0]) {
                case "run": {
                    if (userData.clans.length === 0) {
                        return message.edit("Aucun tag configuré. Ajoutez-en d'abord avec " + prefix + "multitag add.");
                    }
                    
                    clanDbManager.updateUserData(userId, { 
                        isRotating: true,
                        currentClanIndex: 0 
                    });
                    
                    ClanRotationManager.start(client, userId);
                    message.edit("Rotation des tags demarree !");
                    break;
                }

                case "stop": {
                    clanDbManager.updateUserData(userId, { isRotating: false });
                    ClanRotationManager.stop(userId);
                    message.edit("Rotation des tags arretee !");
                    break;
                }

                case "add": {
                    if (userData.clans.length >= MAX_CLANS) {
                        return message.edit("Vous avez atteint la limite maximale de " + MAX_CLANS + " clans.");
                    }

                    const clanId = args[1];
                    if (!clanId) {
                        return message.edit("Veuillez fournir un ID d'un serveur. Ex: " + prefix + "multitag add 1274437651759632484");
                    }

                    if (!/^\d{17,19}$/.test(clanId)) {
                        return message.edit("ID de serveur invalide. Doit contenir 17 a 19 chiffres.");
                    }

                    if (userData.clans.includes(clanId)) {
                        return message.edit("Ce tag est deja dans la liste.");
                    }

                    userData.clans.push(clanId);
                    clanDbManager.save();
                    message.edit("Tag ajoute a la rotation !");
                    break;
                }

                case "del": { 

                    const index = parseInt(args[1]) - 1;

                    if (isNaN(index) || index < 0 || index >= userData.clans.length) {
                        return message.edit("Index invalide. Veuillez fournir un nombre entre 1 et " + userData.clans.length + ".");
                    }

                    const removedClan = userData.clans[index];
                    userData.clans.splice(index, 1);
                    clanDbManager.save();
                    
                    if (userData.currentClan === removedClan) {
                        clanDbManager.updateUserData(userId, { currentClan: null });
                    }
                    
                    if (userData.clans.length === 0) {
                        clanDbManager.updateUserData(userId, { isRotating: false });
                        ClanRotationManager.stop(userId);
                    }
                    
                    message.edit("Tag supprime de la rotation !");
                    break;
                }

                    case "rmall": {
        if (userData.clans.length === 0) {
            return message.edit("Aucun tag a supprimer.");
        }
        
        clanDbManager.updateUserData(userId, { 
            clans: [], 
            isRotating: false,
            currentClan: null
        });
        
        ClanRotationManager.stop(userId);
        return message.edit("Tous les tags ont ete supprimes et la rotation a ete arretee.");
        break;
    }

                case "list": {
                    if (userData.clans.length === 0) {
                        return message.edit("Aucun tag configuré.");
                    }

                    const currentTag = await getCurrentClanTag(client);
                    
                    const clanList = await Promise.all(
                        userData.clans.map(async (clanId, index) => {
                            const tag = await getClanTag(client, clanId);
                            const isCurrent = clanId === userData.currentClan ? ' (rotation)' : '';
                            return index + 1 + " -> " + tag;
                        })
                    );
                    
                    message.edit("Liste des clans (" + userData.clans.length + "/" + MAX_CLANS + ") :\n" + clanList.join('\n') + "\n\nTag actuel: " + currentTag);
                    break;
                }
                      
                case "time": {
                    const time = parseInt(args[1]);
                    
                    if (isNaN(time) || time < MIN_ROTATION_TIME || time > MAX_ROTATION_TIME) {
                        return message.edit("Le temps doit etre un nombre entre " + MIN_ROTATION_TIME + " et " + MAX_ROTATION_TIME + " secondes.");
                    }

                    clanDbManager.updateUserData(userId, { rotationTime: time });
                    
                    if (userData.isRotating) {
                        ClanRotationManager.start(client, userId);
                    }
                        
                    message.edit("Le temps de rotation des clans a ete mis a jour a " + time + " secondes.");	
                    break;
                }

                default:
                    message.edit("Commande invalide. Utilisez " + prefix + "multitag pour voir la liste des commandes.");
            }
        } catch (error) {
            message.edit("Une erreur est survenue.");
        }
    },
    initializeClanRotations
};