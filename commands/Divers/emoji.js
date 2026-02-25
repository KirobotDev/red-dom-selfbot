module.exports = {
    name: "emoji",
    descriptionfr: "┻━┻︵ \(°□°)/ ︵ ┻━┻",
    descriptionen: "┻━┻︵ \(°□°)/ ︵ ┻━┻",
    usage: "",

    run: async (client, message, args) => {
        await message.delete();

        const emoji_id = args[0];

        if (!emoji_id) {
            return message.channel.send("Veuillez fournir l'ID d'un emoji et une extension (exemple : `&emoji 123456789012345678`).");
        }

        if (!emoji_id || !/^\d{18,19}$/.test(emoji_id)) {
            return message.channel.send("Veuillez fournir une d'ID d'emoji valide (exemple : `&emoji 123456789012345678`).");
        }
 
        try {
            await message.channel.send(`https://cdn.discordapp.com/emojis/${emoji_id}.gif?size=48`);
        } catch {
            console.error("Erreur lors de l'envoi de l'emoji", err);
        }
    }
};
