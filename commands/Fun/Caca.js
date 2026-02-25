module.exports = {

    name: 'caca',

    description: 'Jeter du caca sur quelqu\'un!',

    run: async (client, message, args) => {

        if (!args[0]) {

            return message.edit('Veuillez mentionner un utilisateur pour lui jeter du caca dessus!');

        }

        const mention = args[0];

        const userId = mention.replace(/<@!?(\d+)>/, '$1');

        const user = await client.users.fetch(userId).catch(() => null);

        if (!user) {

            return message.edit('Utilisateur invalide. Veuillez mentionner un utilisateur valide.');

        }

        const poopMessages = [

            `💩 Oh non! ${user} vient de se faire frapper par un énorme tas de caca!`,

            `💩 Beurk! ${user} est maintenant couvert de caca!`,

            `💩 ${user} a été éclaboussé de caca!`,

            `💩 Quelqu'un a jeté du caca sur ${user}!`,

            `💩 ${user} a reçu une livraison spéciale de caca!`,

            `💩 ${user} a mis les pieds dans un tas de caca!`,

            `💩 ${user} a fait une erreur de toilette...`,

            `💩 ${user} a attrapé une maladie contagieuse... le caca!`,

            `💩 ${user} a mangé quelque chose de pourri...`,

            `💩 ${user} a reçu un cadeau emballé en caca!`

        ];

        const randomMessage = poopMessages[Math.floor(Math.random() * poopMessages.length)];

        message.edit(randomMessage);

    }

};

     

   

