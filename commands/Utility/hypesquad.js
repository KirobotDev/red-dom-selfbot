const { language } = require('../../fonctions');

module.exports = {
    name: "hypesquad",
    description: "edit your hypesquad",
    run: async (client, message, args, db) => {

        if (args.length === 0) {
            return message.edit(await language(client, `Utilisation incorrecte. Veuillez utiliser \`${db.prefix}hypesquad <clear/bravery/brilliance/balance>\``, `Incorrect usage. Please use \`${db.prefix}hypesquad <clear/bravery/brillance/balance>\``));
        }

        if (!args[0]) {
            return message.edit(await language(client, `Utilisation incorrecte. Veuillez utiliser \`${db.prefix}hypesquad <clear/bravery/brilliance/balance>\``, `Incorrect usage. Please use \`${db.prefix}hypesquad <clear/bravery/brillance/balance>\``));
        }

        const validOptions = ["clear", "bravery", "brilliance", "balance"];
        if (!validOptions.includes(args[0].toLowerCase())) {
            return message.edit(await language(client, `Utilisation incorrecte. Veuillez utiliser \`${db.prefix}hypesquad <clear/bravery/brilliance/balance>\``, `Incorrect usage. Please use \`${db.prefix}hypesquad <clear/bravery/brillance/balance>\``));
        }

        switch (args[0].toLowerCase()) {
            case "clear":
                client.user.setHypeSquad(0)
                    .then(async () => message.edit(await language(client, `Votre hypesquad a été supprimée`, `Your HypeSquad has been deleted`)))
                    .catch(async () => message.edit(await language(client, `Votre hypesquad ne peut pas être supprimée`, `Your HypeSquad cannot be deleted`)));
                break;
            case "bravery":
                client.user.setHypeSquad(1)
                    .then(async () => message.edit(await language(client, `Votre hypesquad a été modifié`, `Your HypeSquad has been edited`)))
                    .catch(async () => message.edit(await language(client, `Votre hypesquad ne peut pas être modifiée`, `Your HypeSquad cannot be edited`)));
                break;
            case "brilliance":
                client.user.setHypeSquad(2)
                    .then(async () => message.edit(await language(client, `Votre hypesquad a été modifié`, `Your HypeSquad has been edited`)))
                    .catch(async () => message.edit(await language(client, `Votre hypesquad ne peut pas être modifiée`, `Your HypeSquad cannot be edited`)));
                break;
            case "balance":
                client.user.setHypeSquad(3)
                    .then(async () => message.edit(await language(client, `Votre hypesquad a été modifié`, `Your HypeSquad has been edited`)))
                    .catch(async () => message.edit(await language(client, `Votre hypesquad ne peut pas être modifiée`, `Your HypeSquad cannot be edited`)));
                break;
        }
    }
};
