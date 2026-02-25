const fs = require('fs').promises;
const { language } = require('../../fonctions');

const path = require('path');

const dbPath = path.resolve(__dirname, './nobot_db.json');
const existingBotsDbPath = path.resolve(__dirname, './existing_bots_db.json');
let loopActive = {}; 
let eventListeners = {}; 

const readDB = async (path) => {
    try {
        const data = await fs.readFile(path, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erreur lors de la lecture de la base de données ${path}:`, error);
        return {}; 
    }
};

const writeDB = async (path, data) => {
    try {
        await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Erreur lors de l'écriture dans la base de données ${path}:`, error);
    }
};

module.exports = {
    name: "antibot",
    description: "Kick all bots from the server, ignoring previously added bots.",
    run: async (client, message, args, db) => {
        
        if (!args[0]) {
            const helpMessage = await language(client,
`**Commandes antibot :**
\`${db.prefix}antibot on\` - Active la protection antibot
\`${db.prefix}antibot off\` - Désactive la protection antibot
\`${db.prefix}antibot add <id1> <id2> ...\` - Ajoute des bots à la liste blanche`,
                
`**Antibot commands :**
\`${db.prefix}antibot on\` - Enable antibot protection
\`${db.prefix}antibot off\` - Disable antibot protection
\`${db.prefix}antibot add <id1> <id2> ...\` - Add bots to whitelist`
            );
            return message.edit(helpMessage);
        }

        const option = args[0].toLowerCase();
        const guildId = message.guild.id;

        if (option === 'add') {
            const botIdsToAdd = args.slice(1); 
            const existingBotsDb = await readDB(existingBotsDbPath);

            if (!existingBotsDb[guildId]) {
                existingBotsDb[guildId] = [];
            }

            for (const botId of botIdsToAdd) {
                if (!existingBotsDb[guildId].includes(botId)) {
                    existingBotsDb[guildId].push(botId);
                }
            }

            await writeDB(existingBotsDbPath, existingBotsDb);

            return message.edit(await language(client, 
                `Les bots avec les IDs suivants ont été ajoutés à la liste blanche: ${botIdsToAdd.join(', ')}`, 
                `The following bots' IDs have been added to the whitelist: ${botIdsToAdd.join(', ')}`
            ));
        }

        if (option === 'off') {
            loopActive[guildId] = false;
            
            const dbb = await readDB(dbPath);
            if (dbb[guildId]) {
                dbb[guildId].loopActive = false;
                await writeDB(dbPath, dbb);
            }

            if (eventListeners[guildId]) {
                client.off('guildMemberAdd', eventListeners[guildId]);
                delete eventListeners[guildId];
            }

            return message.edit(await language(client,
                "Protection antibot désactivée",
                "Antibot protection disabled"
            ));
        }

        if (option === 'on') {
            if (!message.guild) return message.edit(await language(client, 
                `Cette commande est utilisable sur un serveur uniquement`, 
                `This command is usable only in a guild`
            ));
            
            if (!message.member.permissions.has("KICK_MEMBERS")) return message.edit(await language(client, 
                `Permissions insuffisantes pour utiliser cette commande`, 
                `You don't have the permissions for using this command`
            ));

            const dbb = await readDB(dbPath);
            const existingBotsDb = await readDB(existingBotsDbPath);

            if (!dbb[guildId]) {
                dbb[guildId] = { loopActive: false };
            }

            loopActive[guildId] = true; 
            dbb[guildId].loopActive = true;
            await writeDB(dbPath, dbb);

            console.log(`🔒 Protection antibot activée pour ${guildId}`);

            const kickBots = async () => {
                await message.guild.members.fetch(); 

                let kicked = 0;
                let notKicked = 0;

                const members = message.guild.members.cache.filter(member => 
                    member.user.bot && !existingBotsDb[guildId]?.includes(member.id)
                ); 
                
                for (const member of members.values()) {
                    try {
                        await member.kick("Protection antibot");
                        kicked++;
                    } catch (error) {
                        notKicked++;
                    }
                }

                if (kicked > 0 || notKicked > 0) {
                    message.edit(await language(client, 
                        `Scan terminé:\n${kicked} bots expulsés\n${notKicked} bots non expulsés (protégés)`, 
                        `Scan completed:\n${kicked} bots kicked\n${notKicked} bots not kicked (protected)`
                    ));
                }
            };

            const onGuildMemberAdd = async (member) => {
                if (member.guild.id !== guildId) return;
                
                if (member.user.bot && loopActive[guildId] && !existingBotsDb[guildId]?.includes(member.id)) { 
                    try {
                        await member.kick("Protection antibot");
                        message.channel.send(`${member.user.username} a été expulsé par la protection antibot.`);
                    } catch (error) {
                        console.error(`Erreur lors de l'expulsion de ${member.user.username}: ${error.message}`);
                    }
                }
            };

            if (eventListeners[guildId]) {
                client.off('guildMemberAdd', eventListeners[guildId]);
            }

            eventListeners[guildId] = onGuildMemberAdd;
            client.on('guildMemberAdd', eventListeners[guildId]);

            (async () => {
                while (loopActive[guildId]) { 
                    await kickBots();
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
            })();

            return message.edit(await language(client,
                "Protection antibot activée - Scan en cours...",
                "Antibot protection enabled - Scanning..."
            ));
        }

        return message.edit(await language(client,
            "Argument non reconnu. Utilise `antibot` sans arguments pour voir l'aide.",
            "Unknown argument. Use `antibot` without arguments to see help."
        ));
    }
};