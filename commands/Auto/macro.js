const fs = require('fs');
const ms = require('ms');
const path = require("path");

const macroDBPath = path.join(__dirname, "macro.json");

function readMacroDB() {
    if (!fs.existsSync(macroDBPath)) return {};
    return JSON.parse(fs.readFileSync(macroDBPath, 'utf8'));
}

function writeMacroDB(data) {
    fs.writeFileSync(macroDBPath, JSON.stringify(data, null, 2), 'utf8');
}

let macroIntervals = {};

module.exports = {
    name: 'macro',
    run: async (client, message, args) => {
        const macros = readMacroDB();

        if (args[0] === 'stop') {
            const userMacros = macros[message.author.id];
            if (!userMacros || userMacros.length === 0) {
                return message.channel.send("Aucune macro pour l'instant.");
            }

            if (args[1]) {
                const index = parseInt(args[1], 10);
                if (isNaN(index) || index < 1 || index > userMacros.length) {
                    return message.channel.send("Index invalide. Veuillez choisir une macro valide.");
                }

                const macroToStop = userMacros[index - 1];
                clearInterval(macroIntervals[macroToStop.macroId]); 
                delete macroIntervals[macroToStop.macroId]; 

                macros[message.author.id] = macros[message.author.id].filter((_, i) => i !== index - 1);
                writeMacroDB(macros);

                return message.channel.send(`Macro "${macroToStop.text}" arrêtée.`);
            } else {
                
                let listMessage = "Vos macros en cours :\n";
                userMacros.forEach((macro, idx) => {
                    listMessage += `${idx + 1}. Texte: "${macro.text}" dans le salon ${macro.channelId}, toutes les ${macro.time}\n`;
                });
                return message.channel.send(`${listMessage}\nVeuillez choisir la macro à arrêter, exemple : \`&macro stop 1\``);
            }
        }

        if (args[0] === 'liste') {
            const userMacros = macros[message.author.id];
            if (!userMacros || userMacros.length === 0) {
                return message.channel.send("Aucune macro pour l'instant.");
            }

            let listMessage = "Vos macros en cours :\n";
            userMacros.forEach((macro, idx) => {
                listMessage += `${idx + 1}. Texte: "${macro.text}" dans le salon https://discord.com/channels/${macro.channelId === message.guild?.id ? `${message.guild.id}/${macro.channelId}` : `@me/${macro.channelId}`} toutes les ${macro.time}\n`;
            });
            return message.channel.send(listMessage);
        }

        if (args.length < 2) {
            return message.channel.send(`
\`&macro (texte) (temps en s, m ou h)\` ☆ **Créer une macro**
\`&macro liste\` ☆ **Donne la liste des macros**
\`&macro stop\` ☆ **Arrête et supprime une macro**`);
        }

        const macroText = args.slice(0, -1).join(' ');
        const time = args[args.length - 1];

        const interval = ms(time);
        
        if (!time.endsWith('s') && !time.endsWith('m') && !time.endsWith('h')) {
            return message.channel.send("Format de temps invalide. Vous devez utiliser 's', 'm' ou 'h' à la fin.");
        }
        
        const totalHours = ms(time) / 3600000;
        if (totalHours > 100 || totalHours <= 0) {
            return message.channel.send("Le temps ne peut pas dépasser 100 heures et doit être positif.");
        }
        
        if (time.includes('.') || time.includes(',') || time.includes('-')) {
            return message.channel.send("Format de temps invalide. Les nombres à virgule ou négatifs ne sont pas autorisés.");
        }
        
        const macroId = Date.now(); 

        if (!macros[message.author.id]) {
            macros[message.author.id] = [];
        }
        macros[message.author.id].push({
            macroId,
            channelId: message.channel.id,
            text: macroText,
            time
        });
        writeMacroDB(macros);

        macroIntervals[macroId] = setInterval(async () => {
            try {
                await message.channel.send(macroText);
            } catch (err) {
                console.error("Erreur lors de l'envoi du message :", err);
                clearInterval(macroIntervals[macroId]);
                delete macroIntervals[macroId];
            }
        }, interval);

        await message.channel.send(`Macro démarrée. Répétition de "${macroText}" toutes les ${time}. Utilisez \`&macro stop\` pour arrêter.`);
    }
};
