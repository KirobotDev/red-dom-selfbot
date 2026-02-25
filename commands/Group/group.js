const { language, loadGlobalDb, saveGlobalDb } = require("../../fonctions");
const themes = require("../Help/themes.js");
const fs = require('fs').promises;
const path = require('path');

const groupCommands = {
	"antigroup": "⚡ Auto leave grp",
    "group add": "➕ Ajt un ami",
    "group create": "📱 Créer un grp",
    "group crown": "👑 Donne la couronne",
    "group kick": "👢 Kick quelqu'un",
    "group leave": "🚪 Quitte le grp",
    "group lock": "🔐 Personne ajoute/quit",
    "group name": "✏️ Change le nom",
    "group pp": "🖼️ Change la pp",
    "group spam": "🔁 Spam le nom",
	"group unlock": "🔓 Unlock le grp"
};

const englishGroupCommands = {
	"antigroup": "⚡ Auto leave grp",
    "group add": "➕ Add a user",
    "group create": "📱 Create a grp",
    "group crown": "👑 Give the crown",
    "group kick": "👢 Kick a user",
    "group leave": "🚪 Leave the grp",
    "group lock": "🔐 No one join/leaves",
    "group name": "✏️ Edit the name",
    "group pp": "🖼️ Edit the pp",
    "group spam": "🔁 Spam the name",
	"group unlock": "🔓 Unlock the grp"
};

const LOCK_FILE_PATH = path.join(__dirname, 'group_locks.json');

let clientInstance = null;
let lockIntervals = {};

async function loadGroupLocks() {
    try {
        const data = await fs.readFile(LOCK_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function saveGroupLocks(locks) {
    try {
        await fs.writeFile(LOCK_FILE_PATH, JSON.stringify(locks, null, 2), 'utf8');
    } catch (error) { 
    }
}

function setClientInstance(client) {
    clientInstance = client;
}

async function initializeLockIntervals() {
    if (!clientInstance) {
        console.log("Client instance non disponible, attente...");
        return;
    }
     
    const locks = await loadGroupLocks(); 
    
    lockIntervals = {};
    
    for (const [lockKey, lockData] of Object.entries(locks)) {
        const channelId = lockKey.replace('group_lock_', ''); 
        startLockMonitoring(channelId, lockKey);
    }
}
async function generateGroupHelpMessage(userId, prefix, lang = 'fr') {
    const globalDb = await loadGlobalDb();
    const userDb = globalDb[userId] || {};
    const theme = userDb.theme || "default";
    
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishGroupCommands : groupCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "group",
    description: "Gérer les groupes DM - créer ou modifier",
    aliases: ["groups"],
    initializeLockIntervals, 
    setClientInstance, 
    run: async (client, message, args, db, prefix) => {

        const pprefix = db.prefix

        if (!clientInstance) {
            clientInstance = client;
            setTimeout(() => {
                initializeLockIntervals();
            }, 3000);
        }
        
        try {
            if (args[0] === "create" && !args[1]) {
                return await message.edit(`Veuillez utiliser la commande de cette manière :
- \`${db.prefix}group create @user/id @user/id ...\`
- \`${db.prefix}group create solo\`
`);
            }
            
            await message.delete();
            
            const action = args[0];
            
			if (!action ) {
                const helpMessageFR = await generateGroupHelpMessage(message.author.id, prefix, 'fr');
                const helpMessageEN = await generateGroupHelpMessage(message.author.id, prefix, 'en');
                const finalMessage = await language(client, helpMessageFR, helpMessageEN);
                return message.channel.send(finalMessage);
            }

            const channel = await client.channels.fetch(message.channelId);

            switch (action.toLowerCase()) {
                case "name":
                                if (!channel || channel.type !== "GROUP_DM") {
                const response = await language(client,
                    "Cette commande fonctionne uniquement dans un groupe.",
                    "This command only works in a group."
                );
                return message.channel.send(response);
            }
                    const newName = args.slice(1).join(" ");
                    if (!newName) {
                        const response = await language(client,
                            `Tu dois fournir un nouveau nom. Exemple : \`${db.prefix}group name MonGroupe\``,
                            `You must provide a new name. Example: \`${db.prefix}group name MyGroup\``
                        );
                        return message.channel.send(response);
                    }
                    
                    try {
                        await channel.setName(newName);
                        const response = await language(client,
                            `Nom du groupe changé en : **${newName}**`,
                            `Group name changed to: **${newName}**`
                        );
                        await message.channel.send(response);
                    } catch (err) {
                        const response = await language(client,
                            "Erreur fais un ticket pr report le bug",
                            "Error, please create a ticket to report the bug"
                        );
                        return message.channel.send(response);
                    }
                    break;

                case "kick":
                                if (!channel || channel.type !== "GROUP_DM") {
                const response = await language(client,
                    "Cette commande fonctionne uniquement dans un groupe.",
                    "This command only works in a group."
                );
                return message.channel.send(response);
            }
                    if (!args[1]) {
                        const response = await language(client,
                            `Tu dois mentionner un utilisateur ou fournir un ID. Exemple : \`${db.prefix}group kick @user\``,
                            `You must mention a user or provide an ID. Example: \`${db.prefix}group kick @user\``
                        );
                        return message.channel.send(response);
                    }

                    const kickTarget = message.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
                    if (!kickTarget) {
                        const response = await language(client,
                            "Utilisateur non trouvé.",
                            "User not found."
                        );
                        return message.channel.send(response);
                    }

                    try {
                        await channel.removeUser(kickTarget.id);
                    } catch (err) {
                        const response = await language(client,
                            "Il faut avoir la crown pour kick.",
                            "You need to have the crown to kick."
                        );
                        return message.channel.send(response);
                    }
                    break;
                    
                case "create":
   			   	  return await handleGroupCreation(client, message, args);

                case "add":
                                if (!channel || channel.type !== "GROUP_DM") {
                const response = await language(client,
                    "Cette commande fonctionne uniquement dans un groupe.",
                    "This command only works in a group."
                );
                return message.channel.send(response);
            }
                    if (!args[1]) {
                        const response = await language(client,
                            `Tu dois fournir une ID d'utilisateur. Exemple : \`${db.prefix}group add 123456789\``,
                            `You must provide a user ID. Example: \`${db.prefix}group add 123456789\``
                        );
                        return message.channel.send(response);
                    }

                    try {
                        const userToAdd = await client.users.fetch(args[1]);
                        await channel.addUser(userToAdd.id);
                    } catch (err) {
                        const response = await language(client,
                            "Erreur lors de l'ajout. Vérifie l'ID de l'utilisateur.",
                            "Error while adding. Check the user ID."
                        );
                        return message.channel.send(response);
                    }
                    break;

                case "crown":
                                if (!channel || channel.type !== "GROUP_DM") {
                const response = await language(client,
                    "Cette commande fonctionne uniquement dans un groupe.",
                    "This command only works in a group."
                );
                return message.channel.send(response);
            }
                    if (!args[1]) {
                        const response = await language(client,
                            `Tu dois mentionner un utilisateur ou fournir une ID. Exemple : \`${db.prefix}group crown @user\``,
                            `You must mention a user or provide an ID. Example: \`${db.prefix}group crown @user\``
                        );
                        return message.channel.send(response);
                    }

                    const crownTarget = message.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
                    if (!crownTarget) {
                        const response = await language(client,
                            "Utilisateur non trouvé.",
                            "User not found."
                        );
                        return message.channel.send(response);
                    }

                    try {
                        await channel.setOwner(crownTarget.id);
                        const response = await language(client,
                            `${crownTarget.tag} est maintenant le propriétaire du groupe !`,
                            `${crownTarget.tag} is now the group owner!`
                        );
                        await message.channel.send(response);
                    } catch (err) {
                        try {
                            await channel.edit({ owner: crownTarget });
                            const response = await language(client,
                                `${crownTarget.tag} est maintenant le propriétaire du groupe !`,
                                `${crownTarget.tag} is now the group owner!`
                            );
                            await message.channel.send(response);
                        } catch (err2) {
                            const response = await language(client,
                                "Tu dois être l'owner pr passer la crown.",
                                "You must be the owner to transfer the crown."
                            );
                            return message.channel.send(response);
                        }
                    }
                    break;

                case "pp":
                                if (!channel || channel.type !== "GROUP_DM") {
                const response = await language(client,
                    "Cette commande fonctionne uniquement dans un groupe.",
                    "This command only works in a group."
                );
                return message.channel.send(response);
            }
                    const imageUrl = args[1] || (message.attachments.size > 0 ? message.attachments.first().url : null);
                    
                    if (!imageUrl) {
                        const response = await language(client,
                            `Tu dois fournir un lien d'image ou joindre une image. Exemple : \`${db.prefix}group pp https://example.com/image.jpg\``,
                            `You must provide an image link or attach an image. Example: \`${db.prefix} group pp https://example.com/image.jpg\``
                        );
                        return message.channel.send(response);
                    }

                    try {
                        await channel.setIcon(imageUrl);
                        const response = await language(client,
                            "Photo de profil du groupe changée avec succès",
                            "Group profile picture changed successfully"
                        );
                        await message.channel.send(response);
                    } catch (err) {
                        const response = await language(client,
                            "Erreur lors du changement de photo. Vérifie le lien ou le format de l'image.",
                            "Error while changing picture. Check the link or image format."
                        );
                        return message.channel.send(response);
                    }
                    break;

                case "leave":
                                if (!channel || channel.type !== "GROUP_DM") {
                const response = await language(client,
                    "Cette commande fonctionne uniquement dans un groupe.",
                    "This command only works in a group."
                );
                return message.channel.send(response);
            }
                    try {
                        let targetChannel = channel;
                        
                        if (args[1]) {
                            const channelId = args[1];
                            targetChannel = await client.channels.fetch(channelId).catch(() => null);
                            
                            if (!targetChannel || targetChannel.type !== "GROUP_DM") {
                                const response = await language(client,
                                    "Groupe non trouvé.",
                                    "Group not found."
                                );
                                return message.channel.send(response);
                            }
                        }

                        await targetChannel.delete();
                        
                    } catch (err) { 
                        const response = await language(client,
                            "Erreur lors de la fermeture du groupe.",
                            "Error while closing the group."
                        );
                        return message.channel.send(response);
                    }
                    break;

                case "spam":
                                if (!channel || channel.type !== "GROUP_DM") {
                const response = await language(client,
                    "Cette commande fonctionne uniquement dans un groupe.",
                    "This command only works in a group."
                );
                return message.channel.send(response);
            }
                    if (!args[1]) {
                        const response = await language(client,
                            `Tu dois fournir un nom de base. Exemple : \`${db.prefix}group spam test\` ou \`${db.prefix}group spam test 20\``,
                            `You must provide a base name. Example: \`${db.prefix}group spam test\` or \`${db.prefix}group spam test 20\``
                        );
                        return message.channel.send(response);
                    }

                    let baseNameParts = args.slice(1);
                    let times = 50; 
                    
                    const lastArg = baseNameParts[baseNameParts.length - 1];
                    if (/^\d+$/.test(lastArg)) {
                        times = parseInt(lastArg);
                        baseNameParts = baseNameParts.slice(0, -1); 
                    }
                    
                    const baseName = baseNameParts.join(" ");
                    
                    if (times < 1 || times > 100) {
                        const response = await language(client,
                            "Le nombre de fois doit être entre 1 et 100.",
                            "The number of times must be between 1 and 100."
                        );
                        return message.channel.send(response);
                    }

                    for (let i = 1; i <= times; i++) {
                        try {
                            await channel.setName(`${baseName}${i}`);
                            await new Promise(resolve => setTimeout(resolve, 800));
                        } catch (err) { 
                            const response = await language(client,
                                `Erreur lors du renommage (itération ${i}), probablement à cause d'un rate-limit.`,
                                `Error while renaming (iteration ${i}), probably due to rate-limit.`
                            );
                            return message.channel.send(response);
                        }
                    }

                    break;

                case "lock":
                                if (!channel || channel.type !== "GROUP_DM") {
                const response = await language(client,
                    "Cette commande fonctionne uniquement dans un groupe.",
                    "This command only works in a group."
                );
                return message.channel.send(response);
            }
                    return await handleGroupLock(client, message, channel, args, pprefix);

                case "unlock":
                                if (!channel || channel.type !== "GROUP_DM") {
                const response = await language(client,
                    "Cette commande fonctionne uniquement dans un groupe.",
                    "This command only works in a group."
                );
                return message.channel.send(response);
            }
                    return await handleGroupUnlock(client, message, channel);
                    
                default:
                    try {
                        const helpMessageFR = await generateGroupHelpMessage(message.author.id, prefix, 'fr');
                        const helpMessageEN = await generateGroupHelpMessage(message.author.id, prefix, 'en');
                        const finalMessage = await language(client, helpMessageFR, helpMessageEN);
                        return message.channel.send(finalMessage);
                    } catch (error) { 
                        const fallbackMessage = await language(client,
                            `Actions disponibles : \`create\`, \`name\`, \`kick\`, \`add\`, \`crown\`, \`pp\`, \`leave\`, \`spam\`, \`lock\`, \`unlock\`\nExemple : \`${db.prefix}group name NouveauNom\` ou \`${db.prefix}group create @user1 @user2\``,
                            `Available actions: \`create\`, \`name\`, \`kick\`, \`add\`, \`crown\`, \`pp\`, \`leave\`, \`spam\`, \`lock\`, \`unlock\`\nExample: \`${db.prefix}group name NewName\` or \`${db.prefix}group create @user1 @user2\``
                        );
                        return message.channel.send(fallbackMessage);
                    }
            }

        } catch (err) { 
            const response = await language(client,
                "Erreur lors de l'exécution de la commande.",
                "Error while executing the command."
            );
            message.channel.send(response);
        }
    }
};

async function handleGroupLock(client, message, channel, args, pprefix) {
    try {
        const channelOwnerId = channel.ownerId;
        if (channelOwnerId !== message.author.id) {
            const response = await language(client,
                "Tu dois être le propriétaire du groupe pour utiliser cette commande.",
                "You must be the group owner to use this command."
            );
            return message.channel.send(response);
        }

        const locks = await loadGroupLocks();
        const lockKey = `group_lock_${channel.id}`;
 
        let currentMembers = [];
        try {
            if (channel.recipients) {
                if (typeof channel.recipients.keys === 'function') {
                    currentMembers = Array.from(channel.recipients.keys());
                } else if (channel.recipients instanceof Array) {
                    currentMembers = channel.recipients.map(user => user.id);
                }
            }
        } catch (err) { 
        }
 
        if (!currentMembers.includes(channelOwnerId)) {
            currentMembers.push(channelOwnerId);
        }

        locks[lockKey] = {
            ownerId: message.author.id,
            lockedMembers: currentMembers,
            timestamp: Date.now(),
            channelName: channel.name
        };

        await saveGroupLocks(locks);

        const response = await language(client,
            `🔒 Groupe verrouillé !\nMembres actuels (${currentMembers.length}) : ${currentMembers.map(id => `<@${id}>`).join(', ')}\n\nLe groupe sera maintenu avec exactement ces membres. Utilise \`${pprefix}group unlock\` pour désactiver.`,
            `🔒 Group locked!\nCurrent members (${currentMembers.length}): ${currentMembers.map(id => `<@${id}>`).join(', ')}\n\nThe group will be maintained with exactly these members. Use \`${pprefix}group unlock\` to disable.`
        );
        
        await message.channel.send(response);
         
        startLockMonitoring(channel.id, lockKey);

    } catch (err) { 
        const response = await language(client,
            "Erreur lors du verrouillage du groupe.",
            "Error while locking the group."
        );
        return message.channel.send(response);
    }
}

async function handleGroupUnlock(client, message, channel) {
    try {
        const channelOwnerId = channel.ownerId;
        if (channelOwnerId !== message.author.id) {
            const response = await language(client,
                "Tu dois être le propriétaire du groupe pour utiliser cette commande.",
                "You must be the group owner to use this command."
            );
            return message.channel.send(response);
        }

        const locks = await loadGroupLocks();
        const lockKey = `group_lock_${channel.id}`;
        
        if (locks[lockKey]) {
            delete locks[lockKey];
            await saveGroupLocks(locks);
            
            if (lockIntervals[lockKey]) {
                clearInterval(lockIntervals[lockKey]);
                delete lockIntervals[lockKey];
            }
            
            const response = await language(client,
                "🔓 Lock désactivé pour ce groupe.",
                "🔓 Lock disabled for this group."
            );
            return message.channel.send(response);
        } else {
            const response = await language(client,
                "Le lock n'était pas activé pour ce groupe.",
                "Lock was not enabled for this group."
            );
            return message.channel.send(response);
        }

    } catch (err) { 
        const response = await language(client,
            "Erreur lors du déverrouillage du groupe.",
            "Error while unlocking the group."
        );
        return message.channel.send(response);
    }
}

function startLockMonitoring(channelId, lockKey) {
    if (lockIntervals[lockKey]) {
        clearInterval(lockIntervals[lockKey]);
    }

    const checkInterval = setInterval(async () => {
        try {
            const channel = await clientInstance.channels.fetch(channelId).catch(() => null);
            if (!channel || channel.type !== "GROUP_DM") {
                clearInterval(checkInterval);
                delete lockIntervals[lockKey];
                const locks = await loadGroupLocks();
                delete locks[lockKey];
                await saveGroupLocks(locks);
                return;
            }

            const locks = await loadGroupLocks();
            const lockData = locks[lockKey];
            
            if (!lockData) {
                clearInterval(checkInterval);
                delete lockIntervals[lockKey];
                return;
            }

            if (channel.ownerId !== lockData.ownerId) {
                clearInterval(checkInterval);
                delete lockIntervals[lockKey];
                delete locks[lockKey];
                await saveGroupLocks(locks);
                return;
            }
 
            let currentMembers = [];
            try {
                if (channel.recipients) {
                    if (typeof channel.recipients.keys === 'function') {
                        currentMembers = Array.from(channel.recipients.keys());
                    } else if (channel.recipients instanceof Array) {
                        currentMembers = channel.recipients.map(user => user.id);
                    }
                }
            } catch (err) { 
                return;
            }
 
            if (!currentMembers.includes(lockData.ownerId)) {
                currentMembers.push(lockData.ownerId);
            }

            const lockedMembers = lockData.lockedMembers || [];
             
            const memberSet = new Set(currentMembers);
            const lockedSet = new Set(lockedMembers);
             
            for (const memberId of lockedMembers) {
                if (!memberSet.has(memberId)) {
                    try {
                        await channel.addUser(memberId); 
                    } catch (addErr) { 
                    }
                }
            }
             
            for (const memberId of currentMembers) {
                if (!lockedSet.has(memberId) && memberId !== lockData.ownerId) {
                    try {
                        await channel.removeUser(memberId); 
                    } catch (removeErr) { 
                    }
                }
            }

        } catch (err) { 
        }
    }, 5000); 

    lockIntervals[lockKey] = checkInterval;
}

async function handleGroupCreation(client, message, args) {
    const createSoloGroup = async () => {
        try {
            const groupDM = await client.channels.createGroupDM([message.author.id]);
            const response = await language(client,
                `Groupe solo créé : <#${groupDM.id}>`,
                `Solo group created: <#${groupDM.id}>`
            );
            return message.channel.send(response);
        } catch (err) { 
            const response = await language(client,
                "Une erreur est survenue lors de la création du groupe.",
                "An error occurred while creating the group."
            );
            return message.channel.send(response);
        }
    };

    if (args[1]?.toLowerCase() === "solo" || args.slice(1).length === 0) {
        return createSoloGroup();
    }

    const userIds = new Set();
    const authorId = message.author.id;

    const userArgs = args[0].toLowerCase() === "create" ? args.slice(1) : args;

    for (const arg of userArgs) {
        const mentionMatch = arg.match(/^<@!?(\d+)>$/);
        if (mentionMatch) {
            const userId = mentionMatch[1];
            if (userId !== authorId) {
                userIds.add(userId);
            }
        } else if (/^\d{17,20}$/.test(arg) && arg !== authorId) {
            userIds.add(arg);
        }
    }

    if (userIds.size === 0) {
        return createSoloGroup();
    }

    if (userIds.size > 9) {
        const response = await language(client,
            "Tu ne peux pas créer un groupe avec plus de **9 personnes** (10 maximum en comptant toi).",
            "You cannot create a group with more than **9 people** (10 maximum including yourself)."
        );
        return message.channel.send(response);
    }

    try {
        const groupChannel = await client.channels.createGroupDM([message.author.id]);
        
        let addedCount = 0;
        const failedUsers = [];
        
        for (const userId of userIds) {
            try {
                const userToAdd = await client.users.fetch(userId);
                await groupChannel.addUser(userToAdd.id);
                addedCount++;
            } catch (addErr) { 
                failedUsers.push(userId);
            }
        }

        if (addedCount === 0) {
            await groupChannel.delete();
            const response = await language(client,
                "Aucun utilisateur n'a pu être ajouté. Groupe supprimé.",
                "No users could be added. Group deleted."
            );
            return message.channel.send(response);
        }

        let responseMessage;
        if (failedUsers.length > 0) {
            responseMessage = await language(client,
                `Groupe créé : <#${groupChannel.id}>\n` +
                `${addedCount} utilisateur(s) ajouté(s)\n` +
                `${failedUsers.length} utilisateur(s) non ajouté(s)`,
                `Group created: <#${groupChannel.id}>\n` +
                `${addedCount} user(s) added\n` +
                `${failedUsers.length} user(s) not added`
            );
        } else {
            responseMessage = await language(client,
                `Groupe créé : <#${groupChannel.id}>`,
                `Group created : <#${groupChannel.id}>`
            );
        }
        
        return message.channel.send(responseMessage);

    } catch (err) { 
        const response = await language(client,
            "Une erreur est survenue lors de la création du groupe.",
            "An error occurred while creating the group."
        );
        return message.channel.send(response);
    }
}