const sqlDb = require('./sqlDb');
const prefixCache = new Map();

async function loadGlobalDb() {  
    try {
        const allData = await sqlDb.getAllUserData();
        const formattedData = {};
        
        for (const [userId, userData] of Object.entries(allData)) {
            formattedData[userId] = { ...userData };
             
            if (userData.afk !== undefined && userData.afk !== null) {  
                if (typeof userData.afk === 'boolean') {
                    formattedData[userId].afk = userData.afk;
                } 
                else if (userData.afk === 1 || userData.afk === '1') {
                    formattedData[userId].afk = true;
                } 
                else if (userData.afk === 0 || userData.afk === '0') {
                    formattedData[userId].afk = false;
                } 
                else if (typeof userData.afk === 'string' && userData.afk === '{}') {
                    formattedData[userId].afk = false;
                } 
                else if (typeof userData.afk === 'string') { 
                    try {
                        const parsed = JSON.parse(userData.afk);
                        formattedData[userId].afk = Boolean(parsed);
                    } catch (e) { 
                        formattedData[userId].afk = userData.afk.toLowerCase() === 'true';
                    }
                } 
                else {
                    formattedData[userId].afk = false;
                }
            } else {
                formattedData[userId].afk = false;
            }
             
            if (userData.rolemenus && typeof userData.rolemenus === 'string') {
                try {
                    formattedData[userId].rolemenus = JSON.parse(userData.rolemenus);
                } catch (e) {
                    formattedData[userId].rolemenus = [];
                }
            }
            
            if (userData.multi && typeof userData.multi === 'string') {
                try {
                    formattedData[userId].multi = JSON.parse(userData.multi);
                } catch (e) {
                    formattedData[userId].multi = { rpcList: [], rpcCount: 0 };
                }
            }
            
            if (userData.rainbowrole && typeof userData.rainbowrole === 'string') {
                try {
                    formattedData[userId].rainbowrole = JSON.parse(userData.rainbowrole);
                } catch (e) {
                    formattedData[userId].rainbowrole = [];
                }
            }
        }
        
        return formattedData;
    } catch (error) {
        console.error('Erreur loadGlobalDb:', error);
        return {};
    }
}

async function saveGlobalDb() { 
    console.log('⚠️ saveGlobalDb() est dépréciée'); 
}

async function language(client, fr, en) {
    const userId = client.user.id;
    const userData = await sqlDb.getUserData(userId);
    return userData.langue === "en" ? en : fr;
}

async function savedb(client, userData) {
    const userId = client.user.id;
    const dataToSave = { ...userData };
     
    if (dataToSave.afk !== undefined) { 
        dataToSave.afk = dataToSave.afk === true ? 1 : 0;
    }
    
    
    if (dataToSave.rolemenus && Array.isArray(dataToSave.rolemenus)) {
        dataToSave.rolemenus = JSON.stringify(dataToSave.rolemenus);
    }
    
    if (dataToSave.multi && typeof dataToSave.multi === 'object') {
        dataToSave.multi = JSON.stringify(dataToSave.multi);
    }
    
    if (dataToSave.rainbowrole && Array.isArray(dataToSave.rainbowrole)) {
        dataToSave.rainbowrole = JSON.stringify(dataToSave.rainbowrole);
    } 
    await sqlDb.updateUserData(userId, dataToSave);
    const check = await sqlDb.getUserData(userId); 
}

async function updatePrefixCache(userId, newPrefix) {
    prefixCache.set(userId, newPrefix);
}

async function getCurrentPrefix(userId) {
    const cachedPrefix = prefixCache.get(userId);
    if (cachedPrefix) return cachedPrefix;

    try {
        const userData = await sqlDb.getUserData(userId);
        const prefix = userData.prefix || "&";
        prefixCache.set(userId, prefix);
        return prefix;
    } catch (error) {
        return "&";
    }
}

function matchCode(text, callback) {
    let codes = text.match(/https:\/\/discord\.gift\/[a-zA-Z0-9]+/);
    if (codes) {
        callback(codes[0]);
        return matchCode(text.slice(codes.index + codes[0].length), callback);
    } else {
        callback(null);
    }
}

function nitrocode(length, letter) {
    let multiplier = '';
    if (letter.indexOf('0') > -1) multiplier += '0123456789';
    if (letter.indexOf('A') > -1) multiplier += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (letter.indexOf('a') > -1) multiplier += 'abcdefghijklmnopqrstuvwxyz';
    let results = '';

    for (let i = length; i > 0; --i) {
        results += multiplier[Math.floor(Math.random() * multiplier.length)];
    }

    return results;
}

module.exports = {
    language,
    matchCode,
    savedb,
    nitrocode,
    loadGlobalDb,
    saveGlobalDb,
    updatePrefixCache,
    getCurrentPrefix
}; 