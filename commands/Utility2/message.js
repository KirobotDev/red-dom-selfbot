const fs = require("fs");
const path = require("path");

const databasePath = path.join(__dirname, `message.json`);
let messagesDB = [];
let isClientReady = false;

const loadDatabase = () => {
    if (fs.existsSync(databasePath)) {
        const data = fs.readFileSync(databasePath, "utf8");
        try {
            messagesDB = JSON.parse(data);
            if (!Array.isArray(messagesDB)) messagesDB = [];
        } catch (error) {
            console.error("Erreur de parsing JSON :", error);
            messagesDB = [];
        }
    }
};

const saveDatabase = () => {
    fs.writeFileSync(databasePath, JSON.stringify(messagesDB, null, 2), "utf8");
};

const getScheduledTime = (storedTime) => {
    return new Date(new Date(storedTime).getTime() - 60 * 60 * 1000);
};

const canSendMessages = (channel) => {
    return channel && 
           channel.send && 
           typeof channel.send === 'function';
};

const sendScheduledMessages = async (client) => {
    if (!isClientReady) {
        return;
    }

    const now = new Date();
    let updated = false;
    let sentCount = 0;

    for (let i = messagesDB.length - 1; i >= 0; i--) {
        const msg = messagesDB[i];
        const scheduledTime = getScheduledTime(msg.time);

        if (scheduledTime <= now) {
            try {
                const channel = await client.channels.fetch(msg.channelId);
                if (canSendMessages(channel)) {
                    await channel.send(`${msg.content}`);
                    sentCount++;
                } else {
                }
            } catch (error) {
                console.error(`Erreur lors de l'envoi du message:`, error);
            }
            
            messagesDB.splice(i, 1);
            updated = true;
        }
    }

    if (updated) {
        saveDatabase();
    }
};

const cleanupExpiredMessages = () => {
    const now = new Date();
    const initialLength = messagesDB.length;
    
    const margin = 5 * 60 * 1000;
    const cutoffTime = new Date(now.getTime() - margin);
    
    messagesDB = messagesDB.filter(msg => {
        const scheduledTime = getScheduledTime(msg.time);
        return scheduledTime > cutoffTime;
    });

    if (messagesDB.length !== initialLength) {
        saveDatabase();
        
        messagesDB.forEach((msg, index) => {
            const scheduledTime = getScheduledTime(msg.time);
            const timeDiff = scheduledTime - now;
            const minutesLeft = Math.max(0, Math.floor(timeDiff / (60 * 1000)));
        });
    }
};

loadDatabase();

module.exports = {
    name: "message",
    description: "Envoie un message programmé à une heure ou après un délai",

    run: async (client, message, args) => {
        const userId = message.author.id;
        const messageContent = args.slice(2).join(" ");

        if (!messageContent) return message.reply("Veuillez spécifier un message.");

        if (messageContent.toLowerCase().includes("&bonbon") || messageContent.toLowerCase().includes("coin")) {
            return message.reply("Arrête de tricher");
        }

        if (args[0] === 'heure' && args[1]) {
            const [hours, minutes] = args[1].split(":").map(Number);
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                return message.reply("Veuillez spécifier une heure valide au format hh:mm.");
            }

            const now = new Date();
            const targetTime = new Date(now);
            targetTime.setHours(hours, minutes, 0, 0);

            if (targetTime < now) {
                targetTime.setDate(targetTime.getDate() + 1);
            }

            const delay = targetTime - now;

            const storedTime = new Date(targetTime.getTime() + 60 * 60 * 1000).toISOString();

            messagesDB.push({ 
                userId, 
                content: messageContent, 
                time: storedTime, 
                channelId: message.channel.id 
            });
            saveDatabase();

            const scheduledRealTime = getScheduledTime(storedTime);
            const timeUntilMessage = Math.floor(delay / (60 * 1000));
            
            message.reply(`Message programmé pour ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} (dans ${timeUntilMessage} minute(s)).`);

            setTimeout(async () => {
                try {
                    await message.channel.send(`${messageContent}`);
                    const index = messagesDB.findIndex(msg => 
                        msg.userId === userId && 
                        msg.content === messageContent && 
                        msg.time === storedTime
                    );
                    if (index !== -1) {
                        messagesDB.splice(index, 1);
                        saveDatabase();
                    }
                } catch (error) {
                    console.error("Erreur lors de l'envoi du message timeout:", error);
                }
            }, delay);
        }

        else if (args[0] === 'temps' && args[1]) {
            const unit = args[1].slice(-1);
            const timeValue = parseInt(args[1].slice(0, -1), 10);

            if (isNaN(timeValue) || timeValue <= 0 || !['s', 'm', 'h'].includes(unit)) {
                return message.reply("Veuillez spécifier un délai valide en secondes (s), minutes (m), ou heures (h). Exemple: 10s, 5m, 1h");
            }

            let delay;
            switch (unit) {
                case 's': delay = timeValue * 1000; break;
                case 'm': delay = timeValue * 60 * 1000; break;
                case 'h': delay = timeValue * 60 * 60 * 1000; break;
            }

            const targetTime = new Date(Date.now() + delay);
            const storedTime = new Date(targetTime.getTime() + 60 * 60 * 1000).toISOString();

            messagesDB.push({ 
                userId, 
                content: messageContent, 
                time: storedTime, 
                channelId: message.channel.id 
            });
            saveDatabase();

            let timeText = "";
            switch (unit) {
                case 's': timeText = `${timeValue} seconde${timeValue > 1 ? 's' : ''}`; break;
                case 'm': timeText = `${timeValue} minute${timeValue > 1 ? 's' : ''}`; break;
                case 'h': timeText = `${timeValue} heure${timeValue > 1 ? 's' : ''}`; break;
            }

            message.reply(`Message programmé pour dans ${timeText}.`);

            setTimeout(async () => {
                try {
                    await message.channel.send(`${messageContent}`);
                    const index = messagesDB.findIndex(msg => 
                        msg.userId === userId && 
                        msg.content === messageContent && 
                        msg.time === storedTime
                    );
                    if (index !== -1) {
                        messagesDB.splice(index, 1);
                        saveDatabase();
                    }
                } catch (error) {
                    console.error("Erreur lors de l'envoi du message timeout:", error);
                }
            }, delay);
        } else {
            return message.reply("Utilisation invalide. Utilisez soit:\n- `&message heure hh:mm [votre texte]`\n- `&message temps [temps s/m/h] [votre texte]`");
        }
    },
 
    init: async (client) => { 
        
        cleanupExpiredMessages();
        
        client.once("ready", () => { 
            isClientReady = true;
            
            setTimeout(() => {
                sendScheduledMessages(client);
            }, 3000);
            
            setInterval(() => {
                sendScheduledMessages(client);
            }, 30000);
        });
    }
};