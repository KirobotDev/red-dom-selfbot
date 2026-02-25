module.exports = {
    name: "pin",
    run: async (client, message, args) => {
        try {
            const replyMessage = message.reference
                ? await message.channel.messages.fetch(message.reference.messageId)
                : null;

            if (!replyMessage) return message.reply("Réponds à un message à épingler !");

            await replyMessage.pin();
            message.reply("Message épinglé !");
            await message.delete();
        } catch (error) {
            console.error(error);
            message.reply("Impossible d'épingler ce message.");
        }
    },
};