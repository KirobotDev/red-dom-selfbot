let isClearingMessages = false;

module.exports = {
    name: "clear",
    description: "Clear un nombre de messages dans un salon ou pour un utilisateur (DM)",
    run: async (client, message, args) => {
        await message.delete().catch(() => {});

        if (args[0] === "stop") {
            isClearingMessages = false;
            return;
        }

        try {
            const nombre = parseInt(args[0]) || 50000;
            const targetId = args[1];

            let targetChannel = message.channel;
            if (targetId && /^\d+$/.test(targetId)) {
                targetChannel = await client.channels.fetch(targetId).catch(() => null) || 
                               await client.users.fetch(targetId).then(u => u.createDM()).catch(() => null) || 
                               message.channel;
            }

            isClearingMessages = true;
            let totalDeleted = 0;
            let lastMessageId = null;

            while (totalDeleted < nombre && isClearingMessages) {
                const options = { limit: 100 };
                if (lastMessageId) options.before = lastMessageId;

                const fetchedMessages = await targetChannel.messages.fetch(options).catch(() => new Map());
                if (fetchedMessages.size === 0) break;

                const messagesToDelete = [];
                
                for (const msg of fetchedMessages.values()) {
                    if (!isClearingMessages) break;
                    if (msg.author.id === message.author.id) {
                        messagesToDelete.push(msg);
                        totalDeleted++;
                        if (totalDeleted >= nombre) break;
                    }
                }

                if (messagesToDelete.length > 0) {
                    const deletePromises = messagesToDelete.map(msg => 
                        msg.delete().catch(() => {})
                    );
                    await Promise.all(deletePromises);
                }

                lastMessageId = fetchedMessages.last()?.id;
                if (!lastMessageId) break;
            }

            isClearingMessages = false; 

        } catch (e) {
            console.log(`Erreur clear: ${e}`);
            isClearingMessages = false;
        }
    }
};