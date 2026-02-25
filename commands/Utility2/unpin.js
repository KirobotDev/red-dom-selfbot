module.exports = {
    name: "unpin",
    run: async (client, message, args) => {

        try {
            const replyMessage = message.reference
                ? await message.channel.messages.fetch(message.reference.messageId)
                : null;

            if (!replyMessage) return message.reply("Réponds à un message à désépingler !");

            await replyMessage.unpin();
            message.reply("Message désépinglé !");
     	    await message.delete();
        } catch (error) {
            console.error(error);
            message.reply("Impossible de désépingler ce message.");
        }
    },
};