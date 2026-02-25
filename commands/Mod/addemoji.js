module.exports = {
    name: 'addemoji',
    run: async (client, message, args) => {
        await message.delete();

        if (args.length < 1) {
            return message.channel.send({ content: "Utilisation : &addemoji (emoji(s)) [ID du serveur]" });
        }

        let targetGuildId = message.guild.id;
        const lastArg = args[args.length - 1];

        if (!isNaN(lastArg) && lastArg.length === 18) {
            targetGuildId = lastArg;
            args = args.slice(0, args.length - 1);
        }

        const targetGuild = client.guilds.cache.get(targetGuildId);

        if (!targetGuild) {
            return message.channel.send({ content: "ID de serveur invalide ou serveur non accessible." });
        }

        const emojis = args;

        for (const rawEmoji of emojis) {
            const emojiMatch = rawEmoji.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/);
            
            if (emojiMatch) {
                const animated = emojiMatch[1] === 'a';
                const emojiName = emojiMatch[2];
                const emojiId = emojiMatch[3];
                
                const extension = animated ? ".gif" : ".png";
                const url = `https://cdn.discordapp.com/emojis/${emojiId + extension}`;

                try {
                    const emoji = await targetGuild.emojis.create(url, emojiName);
                    await message.channel.send({ content: `Emoji ajouté avec succès dans ${targetGuild.name} : ${url}?quality=lossless&size=48` });
                } catch (error) {
                    await message.channel.send({ content: `Erreur lors de l'ajout de l'émoji dans ${targetGuild.name} : ${error.message}` });
                }
            } else {
                await message.channel.send({ content: `L'émoji "${rawEmoji}" n'est pas valide ou n'est pas personnalisé.` });
            }
        }
    }
};