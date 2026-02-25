module.exports = {
    name: 'kick',
    description: 'Kick un utilisateur spécifique du serveur',
    run: async (client, message, args) => {
        // Vérifier les permissions
        if (!message.member.permissions.has("KICK_MEMBERS")) {
            return message.reply("Tu n'as pas la permission d'expulser des utilisateurs.");
        }

        const userId = args[0];
        const user = message.mentions.members.first() || message.guild.members.cache.get(userId);

        if (!user) {
            return message.reply("Utilisateur non trouvé. Utilise une mention ou un ID valide.");
        }

        if (!user.kickable) {
            return message.reply("Je ne peux pas expulser cet utilisateur. Vérifie mes permissions et le rôle de l'utilisateur.");
        }

        try {
            await user.kick();
            message.channel.send(`${user.user.tag} a été expulsé du serveur.`);
        } catch (err) {
            console.error(err);
            message.channel.send("Une erreur est survenue lors de l'expulsion de l'utilisateur.");
        }
    }
};
