const { language } = require("../../fonctions");

module.exports = {
    name: "delcategory",
    description: "Supprime des catégories",
    
    run: async (client, message, args, db) => {
        try {
            if (!args[0]) {
                return message.edit(`${db.prefix}delcategory <id>\n${db.prefix}delcategory all`);
            }

            if (!message.guild) {
                return message.edit("Commande utilisable uniquement dans un serveur.");
            }

            const member = message.guild.members.cache.get(message.author.id);
            if (!member.permissions.has("MANAGE_CHANNELS")) {
                return message.edit("Permission Gérer les salons requise.");
            }

            const option = args[0].toLowerCase();

            if (option === "all") {
                const categories = message.guild.channels.cache
                    .filter(ch => ch.type === "GUILD_CATEGORY"); 

                let deleted = 0;
                let failed = 0;

                for (const category of categories.values()) {
                    try {
                        await category.delete();
                        deleted++;
                    } catch (err) {
                        console.error(`Erreur suppression catégorie ${category.id}:`, err);
                        failed++;
                    }
                }

                return message.edit(`${deleted} catégories supprimées.${failed > 0 ? ` ${failed} erreurs.` : ''}`);
            }
 
            const categoryId = args[0];
            
            try {
                const category = message.guild.channels.cache.get(categoryId);
                
                if (!category) {
                    return message.edit("Catégorie introuvable.");
                }

                if (category.type !== "GUILD_CATEGORY") {
                    return message.edit("L'ID ne correspond pas à une catégorie.");
                }

                let deletedChannels = 0;
                let failedChannels = 0;
 
                const channelsInCategory = category.children;
                for (const channel of channelsInCategory.values()) {
                    try {
                        await channel.delete();
                        deletedChannels++;
                    } catch (channelErr) {
                        console.error(`Erreur suppression salon ${channel.id}:`, channelErr);
                        failedChannels++;
                    }
                }
 
                await category.delete();

                let response = `Catégorie ${category.name} et ${deletedChannels} salons supprimés.`;
                if (failedChannels > 0) {
                    response += ` ${failedChannels} salons non supprimés.`;
                }
                
                return message.edit(response);
                
            } catch (err) {
                console.error("Erreur suppression catégorie:", err);
                return message.edit("Erreur lors de la suppression.");
            }
            
        } catch (err) {
            console.error("Erreur delcategory:", err);
            message.edit("Erreur commande.");
        }
    },
};