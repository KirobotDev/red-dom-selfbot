const { language } = require('../../fonctions');
const fs = require('fs');
const path = require('path');

const rainbowFilePath = path.join(__dirname, './rainbowrole.json');

let rainbowRoles = {};
if (fs.existsSync(rainbowFilePath)) {
    try {
        rainbowRoles = JSON.parse(fs.readFileSync(rainbowFilePath, 'utf-8'));
    } catch (err) {
        console.error("Erreur de lecture du fichier rainbowrole.json :", err);
    }
}

const rainbowIntervals = {};

function initializeRainbowRoles(client) {
    Object.values(rainbowIntervals).forEach(interval => {
        clearInterval(interval);
    });
    Object.keys(rainbowIntervals).forEach(key => delete rainbowIntervals[key]);

    Object.keys(rainbowRoles).forEach(userId => {
        Object.keys(rainbowRoles[userId]).forEach(guildId => {
            rainbowRoles[userId][guildId].forEach(roleObj => {
                startRainbowRole(client, roleObj.roleId);
            });
        });
    });
     
}

function startRainbowRole(client, roleId) {
    const RCLR = [
        "FF0D00", "FF3D00", "FF4F00", "FF6C00", "FF9500", "FFB400", "FFCF00", "FFD600", 
        "FFDD00", "FFE400", "F7FE00", "E5FB00", "D5F800", "C6F500", "B7F200", "A8F000", 
        "98ED00", "87EA00", "74E600", "5DE100", "41DB00", "1DD300", "00C618", "00BB3F", 
        "00B358", "00AC6B", "00A67C", "009E8E", "028E9B", "06799F", "0969A2", "0C5DA5", 
        "0E51A7", "1047A9", "133CAC", "1531AE", "1924B1", "1F1AB2", "2A17B1", "3415B0", 
        "3C13AF", "4512AE", "4E10AE", "560EAD", "600CAC", "6A0AAB", "7608AA", "8506A9", 
        "9702A7", "AD009F", "BC008D", "C7007D", "D0006E", "D8005F", "DF004F", "E7003E", 
        "EF002A", "F80012"
    ];

    let index = 0;
    let interval = setInterval(async () => {
        for (const guild of client.guilds.cache.values()) {
            const role = guild.roles.cache.get(roleId);
            if (role && role.editable) {
                try {
                    await role.edit({ color: `#${RCLR[index]}` });
                    break; 
                } catch (err) {
                    console.error(`Erreur avec le rôle ${roleId} dans ${guild.name}:`, err);
                }
            }
        }
        index = (index + 1) % RCLR.length;
    }, 5000);

    rainbowIntervals[roleId] = interval;
}

function hasRoleInGuild(userId, roleId, guild) {
    const member = guild.members.cache.get(userId);
    return member && member.roles.cache.has(roleId);
}

module.exports = {
    name: "rainbowrole",
    description: "Créer un rôle arc-en-ciel",
    run: async (client, message, args, db, prefix) => {
        const userId = message.author.id;
        const guildId = message.guild.id;
 
        if (!rainbowRoles[userId]) rainbowRoles[userId] = {};
        if (!rainbowRoles[userId][guildId]) rainbowRoles[userId][guildId] = [];

        if (args[0] === "stop") {
            if (!rainbowRoles[userId][guildId] || rainbowRoles[userId][guildId].length === 0) {
                return message.edit("Tu n'as pas de rainbow roles actifs sur ce serveur.");
            }

            if (args.length < 2) {
                let roleListMessage = "Voici tes rainbow roles actifs sur ce serveur :\n";
                rainbowRoles[userId][guildId].forEach((roleObj, index) => {
                    const role = message.guild.roles.cache.get(roleObj.roleId);
                    roleListMessage += `${index}: ${role ? role.name : "Rôle introuvable"} (ID: ${roleObj.roleId})\n`;
                });
                roleListMessage += "\nUtilise `&rainbowrole stop [index]` pour arrêter un rainbow role spécifique.";
                return message.edit(roleListMessage);
            }

            const index = parseInt(args[1], 10);
            if (isNaN(index) || index < 0 || index >= rainbowRoles[userId][guildId].length) {
                return message.edit("Spécifie un index valide pour arrêter le rôle rainbow.");
            }

            const roleId = rainbowRoles[userId][guildId][index].roleId;
            if (rainbowIntervals[roleId]) {
                clearInterval(rainbowIntervals[roleId]);
                delete rainbowIntervals[roleId];
            }

            rainbowRoles[userId][guildId].splice(index, 1);
            if (rainbowRoles[userId][guildId].length === 0) {
                delete rainbowRoles[userId][guildId];
            }
            if (Object.keys(rainbowRoles[userId]).length === 0) {
                delete rainbowRoles[userId];
            }
            fs.writeFileSync(rainbowFilePath, JSON.stringify(rainbowRoles, null, 2));

            message.edit(await language(client, "Rainbow role arrêté", "Rainbow role stopped"));
        } else if (args[0] === "liste") {
            if (!rainbowRoles[userId][guildId] || rainbowRoles[userId][guildId].length === 0) {
                return message.edit("Tu n'as pas de rainbow roles actifs sur ce serveur.");
            }

            let roleListMessage = "Voici tes rainbow roles sur ce serveur :\n";
            rainbowRoles[userId][guildId].forEach((roleObj, index) => {
                const role = message.guild.roles.cache.get(roleObj.roleId);
                roleListMessage += `${index}: ${role ? role.name : "Rôle introuvable"} (ID: ${roleObj.roleId})\n`;
            });

            message.edit(roleListMessage);
        } else {
            let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
            if (!role) return message.edit(`Aucun rôle trouvé pour \`${args[0] || "rien"}\``);

            if (!hasRoleInGuild(userId, role.id, message.guild)) {
                return message.edit("Tu ne possèdes pas ce rôle sur ce serveur.");
            }

            if (rainbowRoles[userId][guildId].some(r => r.roleId === role.id)) {
                return message.edit("Ce rôle est déjà un rainbow role pour toi sur ce serveur.");
            }

            message.edit(await language(client, "Rainbow role lancé", "Rainbow Role started"));

            rainbowRoles[userId][guildId].push({ 
                roleId: role.id, 
                userId: userId,
                guildId: guildId
            });

            fs.writeFileSync(rainbowFilePath, JSON.stringify(rainbowRoles, null, 2));
            
            startRainbowRole(client, role.id);
        }
    },

    initializeRainbowRoles
};