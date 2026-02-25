module.exports = {
    name: "love",
    description: "Send an amazing love message",
    run: async (client, message, args, db) => {
        try {
            const target = message.mentions.users.first() || message.author;
            const targetName = target.displayName || target.username;
            const authorName = message.author.displayName || message.author.username;
            
            const loveMessages = [
                "💖 Mon cœur bat pour toi... 💖",
                "✨ Tu illumines ma vie ✨",
                "🌹 Chaque moment avec toi est précieux 🌹",
                "💫 Tu es mon étoile dans la nuit 💫",
                "🔥 Mon amour pour toi brûle éternellement 🔥",
                "🌊 Je me noyerais dans ton regard 🌊",
                "💕 Tu es la raison de mon sourire 💕",
                "🌟 Ensemble pour l'éternité 🌟"
            ];

            const heartFrames = [
                "💖❤️💖❤️💖",
                "❤️💖❤️💖❤️", 
                "💖❤️💖❤️💖",
                "❤️💖❤️💖❤️",
                "💕✨💕✨💕",
                "✨💕✨💕✨",
                "🖤❤️🖤❤️🖤",
                "❤️🖤❤️🖤❤️",
                "💘💓💘💓💘",
                "💓💘💓💘💓"
            ];

            for (let i = 0; i < heartFrames.length; i++) {
                await message.edit(heartFrames[i]);
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            const finalMessage = `💝 **MON AMOUR POUR TOI EST INFINI** 💝\n\n**${targetName}**, tu es :\n`;
            await message.edit(finalMessage);

            let reasonsMessage = finalMessage;
            const reasons = [
                "💫 **La personne la plus incroyable**",
                "✨ **Mon rayon de soleil quotidien**", 
                "🌹 **La beauté incarnée**",
                "🔥 **La passion de ma vie**",
                "🌟 **Mon rêve devenu réalité**",
                "💕 **Mon bonheur éternel**",
                "🎶 **La mélodie de mon cœur**",
                "💖 **Mon tout, mon univers**"
            ];

            for (const reason of reasons) {
                reasonsMessage += `\n${reason}`;
                await message.edit(reasonsMessage);
                await new Promise(resolve => setTimeout(resolve, 400));
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const romanticFinal = `\n\n💌 **LETTRE D'AMOUR** 💌\n\n` +
                                `*"Si aimer était un art, tu serais mon chef-d'œuvre.*\n` +
                                `*Si aimer était une musique, tu serais ma symphonie.*\n` +
                                `*Si aimer était un voyage, je voudrais le faire avec toi pour l'éternité."*\n\n` +
                                `💞 **Je t'aime plus que tout au monde ${targetName} !** 💞\n` +
                                `*~ Avec tout mon amour, ${authorName}*`;

            await message.edit(reasonsMessage + romanticFinal);

            await new Promise(resolve => setTimeout(resolve, 2000));
            for (let i = 0; i < 3; i++) {
                await message.edit(reasonsMessage + romanticFinal + "\n\n✨ **JE T'AIME MON COEUR !** ✨");
                await new Promise(resolve => setTimeout(resolve, 500));
                await message.edit(reasonsMessage + romanticFinal);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

        } catch(error) {
            console.error("Erreur dans la commande love:", error);
        }
    }
};