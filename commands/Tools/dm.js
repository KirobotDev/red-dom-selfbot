module.exports = {
    name: "dm",
    run: async (client, message, args) => {
        try {
            if (!message.guild) {
                return message.edit("Cette commande doit être utilisée dans un serveur.");
            }

            const user =
                message.mentions.users.first() ||
                client.users.cache.get(args[0]) ||
                (await client.users.fetch(args[0]).catch(() => null));

            if (!user) {
                return message.edit("Utilisateur introuvable.");
            }

            const dmMessage = args.slice(1).join(" ");
            if (!dmMessage) {
                return message.edit("Donne un message à envoyer.");
            }

            await user.send(dmMessage);
            await message.edit(`Message envoyé avec succès à ${user.tag}!`);
            
        } catch (error) {
            if (error.code === 50007) {
                return message.edit("Impossible d'envoyer un DM, cet utilisateur a ses DM fermés.");
            }

            if (error.message && error.message.toLowerCase().includes('captcha')) {
                return message.edit("Vous n'avez jamais mp cette personne, captcha requis.");
            }

            console.error(error);
            message.edit("Erreur lors de l'envoi du message.");
        }
    },
};