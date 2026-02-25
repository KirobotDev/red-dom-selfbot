module.exports = {
    name: "chat",
    description: "Envoie un GIF de chat aléatoire.",

    run: async (client, message, args) => {
        const gifs = [
            "https://cdn.discordapp.com/attachments/1093487822272483358/1297825237311684639/image0.gif?ex=67175571&is=671603f1&hm=f30990904034a16405d4d7d410b55cfe02b7855359bda2dfa593095ef2e7bc87&",
            "https://cdn.discordapp.com/attachments/1093487822272483358/1297825237710274570/image1.gif?ex=67175571&is=671603f1&hm=65a4e4a1b5ee505982275f6c7fee08fa6925d585c0476f54770f7229553cafb4&",
            "https://cdn.discordapp.com/attachments/1093487822272483358/1297825238272446486/image2.gif?ex=67175571&is=671603f1&hm=7dac0eb630ad096685e10a0c7e811c28aa50597f0dfdb144e47f8e1627622aa2&",
            "https://cdn.discordapp.com/attachments/1093487822272483358/1297825238683353131/image3.gif?ex=67175571&is=671603f1&hm=f189a8728a6c4465815510bcad0ecc02880a752b18ae46fb06f99743d8743c6d&",
            "https://cdn.discordapp.com/attachments/1093487822272483358/1297825239215902720/image4.gif?ex=67175571&is=671603f1&hm=fb6536afe092a693e91ed7465bf90d3b3a74a196bec63dfecb1cba958cedad3e&",
            "https://cdn.discordapp.com/attachments/1093487822272483358/1297825239606099988/image5.gif?ex=67175571&is=671603f1&hm=26d4da4ebd837a7070cffabb3163a49d6c5bdec47f3d778e5a94087daaaad3aa&",
            "https://cdn.discordapp.com/attachments/1093487822272483358/1297825239975071754/image6.gif?ex=67175571&is=671603f1&hm=17e288034244162d2c036689068b5afac591659db3688a55cbb70267f7c30d04&",
            "https://cdn.discordapp.com/attachments/1093487822272483358/1297825240319000586/image7.gif?ex=67175571&is=671603f1&hm=7e4bb9f836fa139507f90eb6eed5e8aa12e016efbdacd0c59ff9b1da3cbb0f22&",
            "https://cdn.discordapp.com/attachments/1093487822272483358/1297825240763732001/image8.gif?ex=67175571&is=671603f1&hm=6e41d57dfedffb782afeda47a84709417d10c930941289964f001bd02a6114e0&",
            "https://cdn.discordapp.com/attachments/1093487822272483358/1297825241145540608/image9.gif?ex=67175571&is=671603f1&hm=b3e7fa7cedad196744c49550017789d0547a78ebe944138bd77b887395737760&",
            "https://tenor.com/view/vem-gatinha-gif-9293073818594743812",
            "https://tenor.com/view/cat-cute-pet-animal-paw-gif-17624352",
            "https://tenor.com/view/cutecat-cute-catsandwich-sandwich-cat-gif-17513465690606335133",
            "https://tenor.com/view/cats-urik3852-gif-10932761478676456492",
            "https://tenor.com/view/eepy-cat-kitten-cat-gif-16624793949582456154",
            "https://tenor.com/view/cat-love-cute-gif-3251448513692414760",
            "https://tenor.com/view/cat-kitten-cat-looking-up-cat-look-up-kitten-look-up-gif-13486805289139588631",
            "https://tenor.com/view/cat-kitty-cute-paw-pet-cat-gif-12284204225271425250",
            "https://tenor.com/view/cute-cat-aww-gif-20691267",
            "https://tenor.com/view/cat-nyash-meow-gif-27316147"
        ];

        // Choisir un GIF aléatoire
        const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

        // Envoyer le GIF dans le salon
        message.channel.send(randomGif);

        // Supprimer le message de commande après exécution
        message.delete().catch(console.error);
    }
};
