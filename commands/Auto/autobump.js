const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, 'autobump.json');

if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}), "utf8");
}

let autoBumpIntervals = {};
let clientRef = null;
let restorationAttempted = false;

function restoreAutoBumps(client) {
    if (restorationAttempted) return;
    restorationAttempted = true;
    
    const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    const activeBumps = Object.keys(db).filter(id => db[id].isActive);
    
    
    if (activeBumps.length === 0) {
        return;
    }

    for (const userId in db) {
        const userData = db[userId];
        if (userData.isActive) {
            const now = Date.now();
            const timeUntilNextBump = userData.nextBump - now;
            const nextBumpDate = new Date(userData.nextBump);
            const timeString = nextBumpDate.toLocaleTimeString('fr-FR');
            const dateString = nextBumpDate.toLocaleDateString('fr-FR');
            
            if (timeUntilNextBump > 0) {
                const hours = Math.floor(timeUntilNextBump / (60 * 60 * 1000));
                const minutes = Math.round((timeUntilNextBump % (60 * 60 * 1000)) / 60000);
                
                
                setTimeout(() => {
                    executeBump(client, userId, userData.channelId);
                    startRegularBumps(client, userId, userData.channelId);
                }, timeUntilNextBump);
                
            } else {
                executeBump(client, userId, userData.channelId);
                startRegularBumps(client, userId, userData.channelId);
            }
        }
    }
    
}

async function executeBump(client, userId, channelId) {
    try {
        const channel = await client.channels.fetch(channelId);
        await channel.sendSlash('302050872383242240', 'bump');
        const now = new Date().toLocaleTimeString('fr-FR');
        
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        if (db[userId]) {
            db[userId].lastBump = Date.now();
            db[userId].nextBump = Date.now() + (2 * 60 * 60 * 1000) + (40 * 60 * 1000);
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
            
            const nextBumpTime = new Date(db[userId].nextBump).toLocaleTimeString('fr-FR');
        }
    } catch (error) {
        console.error(`❌ ERREUR BUMP - User: ${userId}`, error);
    }
}

function startRegularBumps(client, userId, channelId) {
    const bumpInterval = 2 * 60 * 60 * 1000 + 40 * 60 * 1000;
    
    if (autoBumpIntervals[userId]) {
        clearInterval(autoBumpIntervals[userId]);
    }
    
    autoBumpIntervals[userId] = setInterval(() => {
        executeBump(client, userId, channelId);
    }, bumpInterval);
}

function stopAutoBump(userId) {
    if (autoBumpIntervals[userId]) {
        clearInterval(autoBumpIntervals[userId]);
        delete autoBumpIntervals[userId];
    }
    
    const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    if (db[userId]) {
        db[userId].isActive = false;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    }
}

module.exports = {
    name: "autobump",
    description: "Démarrer ou arrêter l'auto-bump pour Disboard.",

    run: async (client, message, args) => {
        
        if (!clientRef) {
            clientRef = client;
            restoreAutoBumps(client);
        }
        
        const channel = message.channel;
        const userId = message.author.id;

        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

        if (args[0] === "stop") {
            if (db[userId] && db[userId].isActive) {
                stopAutoBump(userId);
                return message.edit("Auto-bump arrêté.");
            } else {
                return message.edit("Aucun auto-bump en cours pour vous.");
            }
        }

        if (args[0] === "start") {

        if (db[userId] && db[userId].isActive) {
            const nextBumpTime = new Date(db[userId].nextBump);
            const timeString = nextBumpTime.toLocaleTimeString('fr-FR');
            return message.edit(`Vous avez déjà un auto-bump en cours. Prochain bump à ${timeString}.`);
        }

        async function initialBump() {
            try {
                await channel.sendSlash('302050872383242240', 'bump');
                return true;
            } catch (error) {
                console.error('❌ ERREUR BUMP INITIAL:', error);
                await message.channel.send('Erreur lors de l\'envoi de la commande /bump.');
                return false;
            }
        }

        const success = await initialBump();
        if (!success) return;

        const bumpInterval = 2 * 60 * 60 * 1000 + 40 * 60 * 1000;
        const nextBumpTime = Date.now() + bumpInterval;
        const nextBumpDate = new Date(nextBumpTime);

        db[userId] = {
            channelId: channel.id,
            isActive: true,
            lastBump: Date.now(),
            nextBump: nextBumpTime,
            startedAt: Date.now()
        };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

        const timeString = nextBumpDate.toLocaleTimeString('fr-FR');
        const dateString = nextBumpDate.toLocaleDateString('fr-FR');
        

        startRegularBumps(client, userId, channel.id);
        
        message.edit(`Auto-bump démarré.\n**Prochain bump :** ${timeString} (${dateString})\n*Le bump se fera automatiquement toutes les 2h40.*\n\nUtilisez \`autobump stop\` pour arrêter.`);
        }
    }
};