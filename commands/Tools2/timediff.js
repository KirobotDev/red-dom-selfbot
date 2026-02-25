module.exports = {
    name: 'timediff',
    description: 'Affiche la différence de temps entre deux messages.',
    run: async (client, message, args) => {
        await message.delete().catch(() => {});

        if (args.length < 2) {
            return message.channel.send('Utilisation: &timediff <messageID1> <messageID2>');
        }

        const [id1, id2] = args;

        try {
            const msg1 = await message.channel.messages.fetch(id1);
            const msg2 = await message.channel.messages.fetch(id2);

            let diff = Math.abs(msg2.createdTimestamp - msg1.createdTimestamp);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            diff %= (1000 * 60 * 60 * 24);

            const hours = Math.floor(diff / (1000 * 60 * 60));
            diff %= (1000 * 60 * 60);

            const minutes = Math.floor(diff / (1000 * 60));
            diff %= (1000 * 60);

            const seconds = Math.floor(diff / 1000);

            message.channel.send(
                `Différence : ${days}j ${hours}h ${minutes}m ${seconds}s`
            );

        } catch (err) {
            console.error(err);
            message.channel.send('❌ Impossible de récupérer un des messages.');
        }
    },
};