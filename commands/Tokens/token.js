const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { language } = require('../../fonctions');
const chalk = require('chalk');
const util = require('util');
const themes = require(path.join(__dirname, '..', 'Help', 'themes.js'));
const sqlDb = require(path.join(__dirname, '..', '..', 'sqlDb.js'));

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const tokenCommandsFR = {
    "checktoken": "✅ Vérif validité token",
    "lowtoken": "🔑 1/3 token d'un user",
    "tokeninfo": "ℹ️ Infos sur un token",
    "tokenfuck": "💣 Nique un compte",
    "tokenlang": "📋 Modif lang du token",
    "token add": "➕ Ajoute un token",
    "token remove": "➖ Supprime un token",
    "token list": "📋 Liste de tes tokens"
};

const tokenCommandsEN = {
    "checktoken": "✅ Check token validity",
    "lowtoken": "🔑 1/3 token of a user",
    "tokeninfo": "ℹ️ Infos about a token",
    "tokenfuck": "💣 Destroy an account",
    "tokenlang": "📋 Change token lang",
    "token add": "➕ Add a token",
    "token remove": "➖ Remove a token",
    "token list": "📋 List of your tokens"
};

function generateTokenHelpMessage(theme, prefix, userId, lang = 'fr') {
    const themeFunction = themes[theme] || themes.default;
    const commandSet = lang === 'en' ? tokenCommandsEN : tokenCommandsFR;
    return themeFunction(prefix, commandSet, userId, lang);
}

module.exports = {
    name: 'token',
    description: 'Gère les tokens personnels',
    usage: '<add|remove|list> <token>',
    run: async (client, message, args, db, prefix) => {
        try {
            // Récupération des données utilisateur depuis SQL
            const userDb = await sqlDb.getUserData(message.author.id);
            const theme = userDb.theme || "default";

            const tokensFile = path.resolve(__dirname, '../Tokens/tokendb.json');
            let tokens = [];
            if (fs.existsSync(tokensFile)) {
                try {
                    tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
                } catch (error) {
                    console.error(`Erreur lors de la lecture du fichier ${tokensFile}: ${error.message}`);
                }
            }

            const command = args.shift();

            if (!command) {
                const helpFR = await generateTokenHelpMessage(theme, prefix, message.author.id, 'fr');
                const helpEN = await generateTokenHelpMessage(theme, prefix, message.author.id, 'en');
                return message.edit(await language(client, helpFR, helpEN));
            }

            if (command === 'add') {
                const token = args[0];
                if (!token) return message.channel.send('Veuillez fournir un token à ajouter.');
                if (tokens.some(t => t.id === message.author.id && t.token === token))
                    return message.channel.send('Ce token est déjà dans votre liste.');

                tokens.push({ id: message.author.id, token });
                fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2), 'utf8');
                return message.channel.send(`Le token a été ajouté : ${token}`);
            }

            if (command === 'remove') {
                const userTokens = tokens.filter(t => t.id === message.author.id);
                if (userTokens.length === 0) return message.channel.send('Aucun token trouvé dans votre liste.');

                const index = parseInt(args[0]) - 1;
                if (!isNaN(index) && index >= 0 && index < userTokens.length) {
                    const tokenToRemove = userTokens[index].token;
                    tokens = tokens.filter(t => !(t.id === message.author.id && t.token === tokenToRemove));
                    fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2), 'utf8');
                    return message.channel.send(`Le token a été supprimé : ${tokenToRemove}`);
                }

                const tokenList = userTokens.map((t, i) => `${i + 1}: ${t.token}`).join('\n');
                message.channel.send(`Choisissez un token à supprimer :\n${tokenList}`);

                const filter = response => {
                    const choice = parseInt(response.content);
                    return response.author.id === message.author.id && !isNaN(choice) && choice > 0 && choice <= userTokens.length;
                };

                message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                    .then(collected => {
                        const choice = parseInt(collected.first().content);
                        const tokenToRemove = userTokens[choice - 1].token;
                        tokens = tokens.filter(t => !(t.id === message.author.id && t.token === tokenToRemove));
                        fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2), 'utf8');
                        message.channel.send(`Le token a été supprimé : ${tokenToRemove}`);
                    })
                    .catch(() => message.channel.send('Temps écoulé, aucune suppression effectuée.'));
                return;
            }

            if (command === 'list') {
                const userTokens = tokens.filter(t => t.id === message.author.id);
                if (userTokens.length === 0) return message.channel.send('Aucun token trouvé dans votre liste.');
                const tokenList = userTokens.map((t, i) => `${i + 1}: ${t.token}`).join('\n');
                return message.channel.send(`Tokens enregistrés :\n${tokenList}`);
            }

        } catch (e) {
            console.error("Erreur dans token:", e);
            message.channel.send("Une erreur est survenue lors de l'exécution de la commande token.");
        }
    }
};