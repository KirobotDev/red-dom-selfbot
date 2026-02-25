const fs = require("fs");
const path = require("path");
const { loadGlobalDb, language } = require("../../fonctions");

const friendHelpCommands = {
    "friend all": "👥 Voir tous amis",
    "friend nick": "🏷️ Modifier un surnom",
    "friend nombre": "🔢 Nombre total amis",
    "friend remove": "❌ Supprimer tous amis",
    "friend server": "🏠 Amis sur ce serveur",
};

const englishFriendHelpCommands = {
    "friend all": "👥 View all friends",
    "friend nick": "🏷️ Change a nickname",
    "friend nombre": "🔢 Total friends",
    "friend remove": "❌ Remove all friends",
    "friend server": "🏠 Friends on here",
};

async function generateFriendHelpMessage(userId, prefix, lang = 'fr') {
    const globalDb = await loadGlobalDb();
    const userDb = globalDb[userId] || {};
    const theme = userDb.theme || "default";
    
    const themes = require(path.join(__dirname, '..', 'Help', 'themes.js'));
    const themeFunction = themes[theme] || themes.default;
    
    const commandSet = lang === 'en' ? englishFriendHelpCommands : friendHelpCommands;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: "friend",
    description: "Commandes liées aux amis.",
    run: async (client, message, args, db, prefix) => {
        const globalDb = await loadGlobalDb();
        const userId = client.user.id;
        const userDb = globalDb[userId] || {};

        if (args[0] === "nombre") {
            try {
                const amis = client.relationships.friendCache;

                if (!amis) {
                    const response = await language(client,
                        "Une erreur s'est produite lors de la récupération de vos amis.",
                        "An error occurred while retrieving your friends."
                    );
                    return message.channel.send(response);
                }

                const nombreAmis = amis.size;

                const response = await language(client,
                    `Tu as ${nombreAmis} amis sur Discord.`,
                    `You have ${nombreAmis} friends on Discord.`
                );
                message.channel.send(response);
            } catch (error) {
                console.error("Erreur lors de l'exécution de la commande friend nombre :", error);
                const response = await language(client,
                    "Une erreur s'est produite lors de la récupération de vos amis.",
                    "An error occurred while retrieving your friends."
                );
                await message.channel.send(response);
            }
        } 

        else if (args[0] === "remove") {
            const dbPath = path.join(__dirname, "confirmation.json");

            try {
                let confirmationDb = {};
                if (fs.existsSync(dbPath)) {
                    const fileContent = fs.readFileSync(dbPath, "utf8");
                    confirmationDb = JSON.parse(fileContent);
                }

                const userId = message.author.id;
                if (!confirmationDb[userId]) {
                    confirmationDb[userId] = { confirmation: 0 };
                }

                if (confirmationDb[userId].confirmation === 0) {
                    const response = await language(client,
                        "Êtes-vous sûr de vouloir retirer tous vos amis ? Refaites la commande pour confirmer.",
                        "Are you sure you want to remove all your friends? Run the command again to confirm."
                    );
                    message.channel.send(response);
                    confirmationDb[userId].confirmation = 1;
                    fs.writeFileSync(dbPath, JSON.stringify(confirmationDb, null, 2));
                    return;
                } else if (confirmationDb[userId].confirmation === 1) {
                    const amis = client.relationships.cache;

                    if (!amis || amis.size === 0) {
                        const response = await language(client,
                            "Vous n'avez aucun ami à supprimer.",
                            "You have no friends to remove."
                        );
                        message.channel.send(response);
                        confirmationDb[userId].confirmation = 0;
                        fs.writeFileSync(dbPath, JSON.stringify(confirmationDb, null, 2));
                        return;
                    }

                    const response = await language(client,
                        `Début de la suppression de ${amis.size} amis.`,
                        `Starting removal of ${amis.size} friends.`
                    );
                    message.channel.send(response);

                    for (const [id] of amis) {
                        try {
                            const success = await client.relationships.deleteRelationship(id);
                            if (success) {
                            } else {
                                console.warn(`Impossible de supprimer l'ami avec ID ${id}.`);
                            }
                        } catch (error) {
                            console.error(`Erreur lors de la suppression de l'ami avec ID ${id} : ${error.message}`);
                        }
                    }

                    const successResponse = await language(client,
                        "Tous les amis accessibles ont été supprimés avec succès.",
                        "All accessible friends have been successfully removed."
                    );
                    message.channel.send(successResponse);
                    confirmationDb[userId].confirmation = 0;
                    fs.writeFileSync(dbPath, JSON.stringify(confirmationDb, null, 2));
                }
            } catch (error) {
                console.error("Erreur dans la commande remove :", error.message);
                const response = await language(client,
                    "Une erreur s'est produite lors de la suppression des amis.",
                    "An error occurred while removing friends."
                );
                message.channel.send(response);
            }
        }

        else if (args[0] === "nick") {
            const user = message.mentions.users.first();
            if (!user) {
                const response = await language(client,
                    "Veuillez utiliser la commande de cette manière : friend nick <@user> <surnom>",
                    "Please use the command like this: friend nick <@user> <nickname>"
                );
                return message.channel.send(response);
            }

            const newNickname = args.slice(2).join(" ");
            if (!newNickname) {
                const response = await language(client,
                    "Veuillez utiliser la commande de cette manière : friend nick <@user> <surnom>",
                    "Please use the command like this: friend nick <@user> <nickname>"
                );
                return message.channel.send(response);
            }

            try {
                const success = await client.relationships.setNickname(user, newNickname);
                if (!success) {
                    const response = await language(client,
                        `Vous n'êtes pas amis avec ${user.username}, donc le surnom ne peut pas être changé.`,
                        `You are not friends with ${user.username}, so the nickname cannot be changed.`
                    );
                    return message.channel.send(response);
                }

                const response = await language(client,
                    `Le surnom de ${user.username} a été changé en "${newNickname}".`,
                    `The nickname for ${user.username} has been changed to "${newNickname}".`
                );
                message.channel.send(response);
            } catch (error) {
                console.error("Erreur lors de l'exécution de la commande friend nick :", error);
                const response = await language(client,
                    "Une erreur s'est produite lors de la tentative de changement du surnom.",
                    "An error occurred while trying to change the nickname."
                );
                await message.channel.send(response);
            }
        } 

        else if (args[0] === "all" || args[0] === "liste" || args[0] === "list") {
            try {
                const amis = client.relationships.friendCache;
          
                if (!amis || amis.size === 0) {
                    const response = await language(client,
                        "Vous n'avez aucun ami dans votre liste.",
                        "You have no friends in your list."
                    );
                    return message.channel.send(response);
                }
          
                const amisList = amis.map((relationship, id) => `<@${id}>`);
          
                const messageChunks = [];
                let currentMessage = await language(client,
                    "Voici la liste de vos amis :\n",
                    "Here is your list of friends:\n"
                );
          
                amisList.forEach((ami) => {
                    if ((currentMessage + ami + ", ").length > 2000) {
                        messageChunks.push(currentMessage.trim());
                        currentMessage = language(client,
                            "Voici la liste de vos amis :\n",
                            "Here is your list of friends:\n"
                        );
                    }
                    currentMessage += ami + ", "; 
                });
          
                if (currentMessage) {
                    messageChunks.push(currentMessage.trim());
                }
          
                for (const chunk of messageChunks) {
                    await message.channel.send(chunk);
                }
            } catch (error) {
                console.error("Erreur lors de l'exécution de la commande allfriend :", error);
                const response = await language(client,
                    "Une erreur s'est produite lors de la récupération de vos amis.",
                    "An error occurred while retrieving your friends."
                );
                await message.channel.send(response);
            }
        }

        else if (args[0] === "server") {
            try {
                if (!message.guild) {
                    const response = await language(client,
                        "Cette commande ne peut être utilisée que dans un serveur.",
                        "This command can only be used in a server."
                    );
                    return message.channel.send(response);
                }
          
                const guildMembers = message.guild.members.cache.map(member => member.user.id);
          
                const amis = client.relationships.friendCache;
          
                if (!amis || amis.size === 0) {
                    const response = await language(client,
                        "Aucun ami trouvé dans votre liste.",
                        "No friends found in your list."
                    );
                    return message.channel.send(response);
                }
          
                const amisDansServeur = amis.filter(friend => friend && guildMembers.includes(friend.id));
          
                if (amisDansServeur.size === 0) {
                    const response = await language(client,
                        "Aucun ami trouvé dans ce serveur.",
                        "No friends found in this server."
                    );
                    return message.channel.send(response);
                }
          
                const amisList = amisDansServeur.map(friend => `- ${friend.tag || friend.id}`).join("\n");
          
                const response = await language(client,
                    `Voici la liste de mes amis qui sont membres de ce serveur :\n${amisList}`,
                    `Here is the list of my friends who are members of this server:\n${amisList}`
                );
                await message.channel.send(response);
            } catch (error) {
                console.error("Erreur lors de l'exécution de la commande mesamis :", error);
                const response = await language(client,
                    "Une erreur s'est produite lors de la récupération des amis.",
                    "An error occurred while retrieving friends."
                );
                await message.channel.send(response);
            }
        } 

        else {
            try {
                const helpMessageFR = await generateFriendHelpMessage(userId, prefix, 'fr');
                const helpMessageEN = await generateFriendHelpMessage(userId, prefix, 'en');
                const finalMessage = await language(client, helpMessageFR, helpMessageEN);
                return message.edit(finalMessage);
            } catch (error) {
                console.error("Erreur lors de la génération de l'aide friend:", error);
                const fallbackMessage = await language(client,
                    `\`friend all\` ➜ **Montre la liste de tes amis**
\`friend nick\` ➜ **Change le surnom d'un ami**
\`friend nombre\` ➜ **Montre le nombre de tes amis**
\`friend remove\` ➜ **Supprime tous tes amis de la liste Discord**
\`friend server\` ➜ **Montre la liste de tes amis sur un serveur**`,
                    `\`friend all\` ➜ **Shows your list of friends**
\`friend nick\` ➜ **Change a friend's nickname**
\`friend nombre\` ➜ **Shows your number of friends**
\`friend remove\` ➜ **Removes all your friends from Discord list**
\`friend server\` ➜ **Shows your friends on a server**`
                );
                return message.edit(fallbackMessage);
            }
        }
    }
};