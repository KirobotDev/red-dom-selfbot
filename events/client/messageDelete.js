const chalk = require('chalk');

module.exports = {
    name: 'messageDelete',
    once: false,
    
    async run(message, client) {
        try {
            if (!message || !client) return;
            
            if (!client.snipes) client.snipes = new Map();

            if (!message.content && 
                (!message.attachments || message.attachments.size === 0)) {
                return;
            }

            if (message.author?.bot) return;

            const authorTag = message.author?.tag || "Utilisateur inconnu";
            const avatar = message.author?.displayAvatarURL() || null;
            
            let content = message.content || "";
            const hasEmbed = message.embeds?.length > 0;
            const imageUrl = message.attachments?.first()?.proxyURL || null;

            if (!content) {
                if (hasEmbed) {
                    content = "[EMBED]";
                } else if (imageUrl) {
                    content = "*Message avec fichier*";
                } else {
                    content = "*Message vide*";
                }
            }

           if (content.length > 2000) {
                content = content.substring(0, 1997) + "...";
            }

            client.snipes.set(message.channel.id, {
                content: content,
                author: authorTag,
                avatar: avatar,
                date: message.createdTimestamp,
                image: imageUrl,
                isEmbed: hasEmbed
            });

        } catch (error) {
            console.error(chalk.red('❌ Erreur dans messageDelete:'), error);
        }
    }
};