const fs = require('fs');
const path = require('path');
const { language, loadGlobalDb, savedb } = require("../../fonctions");
const themes = require(path.join(__dirname, '..', 'Help', 'themes.js'));

const filePath = path.join(__dirname, "./flood.json");

function loadFloodData() {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveFloodData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const floodCommands = {
    "flood add": "➕ Ajoute une phrase",
    "flood change": "✏️ Change une phrase",
    "flood list": "📋 Affiche tes phrases",
    "flood remove": "🗑️ Supprime une phrase",
    "flood rmall": "🧹 Supprime tout",
    "flood start": "▶️ Lance le flood"
};

const englishFloodCommands = {
    "flood add": "➕ Add a phrase",
    "flood change": "✏️ Change a sentence",
    "flood list": "📋 Show your phrases",
    "flood remove": "🗑️ Remove a phrase",
    "flood rmall": "🧹 Remove all phrases",
    "flood start": "▶️ Start the flood",
};

async function generateFloodHelpMessage(userId, prefix, lang = 'fr') {
    const globalDb = await loadGlobalDb();
    const userDb = globalDb[userId] || {};
    const theme = userDb.theme || "default";
    
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? englishFloodCommands : floodCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: 'flood',
    run: async (client, message, args, db, prefix) => {
        await message.delete();

        const data = loadFloodData();
        const userId = client.user.id;
        const subCommand = args[0];
        const MAX_PHRASES = 100;

        if (!data[userId]) data[userId] = [];

        switch (subCommand) {
case 'add': {
    if (data[userId].length >= MAX_PHRASES) {
        const msg = await language(client,
            'Vous avez atteint la limite de 100 phrases. Supprimez-en pour en ajouter de nouvelles.',
            'You have reached the limit of 100 phrases. Delete some to add new ones.'
        );
        return message.channel.send(msg);
    }

    const attachment = message.attachments.first();
    if (attachment && attachment.name.endsWith('.txt')) {
        try {
            
            const fileResponse = await fetch(attachment.url);
            const fileContent = await fileResponse.text();
            
            const phrases = fileContent.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0); 

            if (phrases.length === 0) {
                const msg = await language(client,
                    'Le fichier .txt est vide ou ne contient pas de phrases valides.',
                    'The .txt file is empty or does not contain valid phrases.'
                );
                return message.channel.send(msg);
            }

            if (data[userId].length + phrases.length > MAX_PHRASES) {
                const msg = await language(client,
                    `Vous ne pouvez ajouter que ${MAX_PHRASES - data[userId].length} phrases supplémentaires.`,
                    `You can only add ${MAX_PHRASES - data[userId].length} more phrases.`
                );
                return message.channel.send(msg);
            }

            data[userId].push(...phrases);
            saveFloodData(data);

            const msg = await language(client,
                `${phrases.length} phrases ont été ajoutées depuis le fichier.`,
                `${phrases.length} phrases have been added from the file.`
            );
            return message.channel.send(msg);

        } catch (error) {
            console.error('Erreur lors de la lecture du fichier:', error);
            const msg = await language(client,
                'Erreur lors de la lecture du fichier .txt.',
                'Error reading the .txt file.'
            );
            return message.channel.send(msg);
        }
    } else {
        
        const phrase = args.slice(1).join(' ');
        if (!phrase) {
            const msg = await language(client,
                'Veuillez spécifier une phrase à ajouter ou joindre un fichier .txt.',
                'Please specify a phrase to add or attach a .txt file.'
            );
            return message.channel.send(msg);
        }

        data[userId].push(phrase);
        saveFloodData(data);

        const msg = await language(client,
            `Phrase ajoutée : "${phrase}"`,
            `Phrase added: "${phrase}"`
        );
        return message.channel.send(msg);
    }
}
                
            case 'change': {
                const index = parseInt(args[1], 10) - 1;
                const newPhrase = args.slice(2).join(' ');

                if (isNaN(index) || index < 0 || index >= data[userId].length) {
                    const response = await language(client,
                        `Index invalide. Veuillez utiliser \`${prefix}flood change (nombre) (phrase)\` selon le nombre de la phase (à voir dans \`${prefix}flood list\`).`,
                        `Invalid index. Please use \`${prefix}flood change (number) (phrase)\` according to the phrase number (see in \`${prefix}flood list\`).`
                    );
                    return message.channel.send(response);
                }
                if (!newPhrase) {
                    const response = await language(client,
                        'Veuillez spécifier une nouvelle phrase.',
                        'Please specify a new phrase.'
                    );
                    return message.channel.send(response);
                }

                data[userId][index] = newPhrase;
                saveFloodData(data);

                const response = await language(client,
                    `Phrase modifiée : "${newPhrase}"`,
                    `Phrase modified: "${newPhrase}"`
                );
                return message.channel.send(response);
            }

            case 'remove': {
                const index = parseInt(args[1], 10) - 1;

                if (isNaN(index) || index < 0 || index >= data[userId].length) {
                    const response = await language(client,
                        'Index invalide.',
                        'Invalid index.'
                    );
                    return message.channel.send(response);
                }

                const removedPhrase = data[userId].splice(index, 1);
                saveFloodData(data);

                const response = await language(client,
                    `Phrase supprimée : "${removedPhrase}"`,
                    `Phrase removed: "${removedPhrase}"`
                );
                return message.channel.send(response);
            }

            case 'rmall': {
                if (data[userId].length === 0) {
                    const response = await language(client,
                        'Vous n\'avez aucune phrase à supprimer.',
                        'You have no phrases to delete.'
                    );
                    return message.channel.send(response);
                }

                data[userId] = [];
                saveFloodData(data);

                const response = await language(client,
                    'Toutes vos phrases ont été supprimées.',
                    'All your phrases have been deleted.'
                );
                return message.channel.send(response);
            }

            case 'list': {
                if (data[userId].length === 0) {
                    const response = await language(client,
                        'Vous n\'avez aucune phrase enregistrée.',
                        'You have no registered phrases.'
                    );
                    return message.channel.send(response);
                }

                let list = data[userId].map((phrase, i) => `${i + 1}. ${phrase}`).join('\n');
                
                const prefixText = await language(client,
                    'Voici vos phrases enregistrées :\n',
                    'Here are your registered phrases:\n'
                );
                const maxLength = 2000 - prefixText.length;

                while (list.length > maxLength) {
                    const chunk = list.slice(0, maxLength);
                    await message.channel.send(`${prefixText}${chunk}`);
                    list = list.slice(maxLength);
                }

                if (list.length > 0) {
                    await message.channel.send(`${prefixText}${list}`);
                }

                return;
            }

           case 'start': {
    if (data[userId].length === 0) {
        const response = await language(client,
            'Vous n\'avez aucune phrase à envoyer.',
            'You have no phrases to send.'
        );
        return message.channel.send(response);
    }

    const targetId = args[1];
    let target;
    let userIdsToPing = [];

    if (args.length > 2) {
        userIdsToPing = args.slice(2);
    }

    if (targetId) {
        try {
            target = await client.channels.fetch(targetId).catch(() => null);
            if (!target || !target.isText()) {
                target = await client.users.fetch(targetId).catch(() => null);
                if (target) {
                    userIdsToPing = args.length > 2 ? args.slice(2) : [];
                } else {
                    const response = await language(client,
                        "ID invalide. Ni un salon ni un utilisateur trouvé.",
                        "Invalid ID. Neither a channel nor a user found."
                    );
                    return message.channel.send(response);
                }
            }
        } catch (err) {
            console.error("Erreur lors de la récupération de l'ID fourni:", err);
            const response = await language(client,
                "Erreur lors de la récupération de l'ID fourni.",
                "Error while retrieving the provided ID."
            );
            return message.channel.send(response);
        }
    } else {
        target = message.channel;
    }

    for (let i = 0; i < data[userId].length; i++) {
        const phrase = data[userId][i];
        
        if (target.send) {
            let messageToSend = phrase;
            
            if (userIdsToPing.length > 0) {
                userIdsToPing.forEach(userId => {
                    messageToSend += ` <@${userId}>`;
                });
            }
            
            await target.send(messageToSend);
        } 
    }
    return;
}

            default: {
                try {
                    const helpMessageFR = await generateFloodHelpMessage(userId, prefix, 'fr');
                    const helpMessageEN = await generateFloodHelpMessage(userId, prefix, 'en');
                    
                    const finalMessage = await language(client, helpMessageFR, helpMessageEN);
                    return message.channel.send(finalMessage);
                } catch (error) {
                    console.error("Erreur dans flood help:", error);
                    
                    const fallbackMessage = await language(
                        client,
                        `
** **                          ♫︎ __**RD - Flood**__ ♫︎

\`${prefix}flood add (phrase)\` ➜ **Ajoute une phrase à ton flood**
\`${prefix}flood add (avec fichier .txt)\` ➜ **Ajoute des phrases depuis un fichier .txt**
\`${prefix}flood change [index] [phrase]\` ➜ **Change une de tes phrases**
\`${prefix}flood list\` ➜ **Affiche la liste de tes phrases**
\`${prefix}flood remove [index]\` ➜ **Supprime une phrase de ton flood**
\`${prefix}flood rmall\` ➜ **Supprime toutes les phrases de ton flood**
\`${prefix}flood start\` ➜ **Lance le flood**
\`${prefix}flood start (id salon)\` ➜ **Lance le flood dans un salon spécifique**
\`${prefix}flood start (id salon) (id user)\` ➜ **Lance le flood dans un salon spécifique + ping d'un user**
`,
                        `
** **                          ♫︎ __**RD - Flood**__ ♫︎

\`${prefix}flood add (phrase)\` ➜ **Add a phrase to your flood**
\`${prefix}flood add (with .txt file)\` ➜ **Add phrases from a .txt file**
\`${prefix}flood change [index] [phrase]\` ➜ **Change one of your sentences**
\`${prefix}flood list\` ➜ **Show your phrase list**
\`${prefix}flood remove [index]\` ➜ **Remove a phrase from your flood**
\`${prefix}flood rmall\` ➜ **Remove all phrases from your flood**
\`${prefix}flood start\` ➜ **Start the flood**
\`${prefix}flood start (channel ID)\` ➜ **Start the flood in a specific channel**
\`${prefix}flood start (channel ID) (user ID)\` ➜ **Start the flood in a specific channel + ping a user**
`
                    );
                    return message.channel.send(fallbackMessage);
                }
            }
        }
    }
};