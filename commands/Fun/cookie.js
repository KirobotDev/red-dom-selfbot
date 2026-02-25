const cookieGifs = [
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976082901139456/image0.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976083341807749/image1.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976083903709276/image2.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976084264288327/image3.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976084763672646/image4.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976085279309844/image5.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976122369671168/image8.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976122734444614/image7.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976123116257360/image6.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976123497807882/image5.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976124651503689/image3.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976124303249408/image4.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976125087580211/image1.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976125469130844/image2.gif",
    "https://cdn.discordapp.com/attachments/1134668049115529276/1296976125842554880/image0-6.gif",
];

module.exports = {
    name: "cookie",
    description: "Donne un cookie à un utilisateur ou à un utilisateur aléatoire.",
    run: async (client, message, args) => {
        let targetUser;

        if (args[0] === "random") {
            if (!message.guild) {
                return message.channel.send("Vous devez utiliser `&cookie random` dans un groupe ou un serveur !");
            }
 
            const userIds = Array.from(message.guild.members.cache.values())
                .filter(member => !member.user.bot)
                .map(member => member.id);
                
            if (userIds.length === 0) {
                return message.channel.send("Il n'y a pas d'utilisateurs disponibles pour donner un cookie !");
            }
 
            const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
            targetUser = message.guild.members.cache.get(randomUserId);
        } else if (message.mentions.users.size > 0) { 
            targetUser = message.mentions.users.first();  
        } else {
            return message.channel.send("Veuillez mentionner un utilisateur ou utiliser `&cookie random` pour donner un cookie à un utilisateur au hasard !");
        }

        const gifUrl = cookieGifs[Math.floor(Math.random() * cookieGifs.length)]; 
        const originalMessage = `<@${message.author.id}> a donné un cookie à <@${targetUser.id}> ! 🍪`;
        const firstMessage = await message.channel.send(originalMessage);
         
        await message.channel.send(gifUrl);

        message.delete().catch(console.error); 
    },
};
