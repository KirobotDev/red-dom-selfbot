module.exports = {
    name: 'meme',
    description: 'Obtenez un mème aléatoire !',
    run: async (client, message, args) => {
        try { 
            const res = await fetch('https://meme-api.com/gimme');
            
            if (!res.ok) { 
                throw new Error(`Erreur réseau : ${res.statusText}`);
            }

            const meme = await res.json(); 

            if (!meme || !meme.url) {
                console.log('Aucun mème trouvé.');
                throw new Error('Aucun mème trouvé.');
            }

            message.channel.send(meme.url);
        } catch (error) { 
            message.channel.send("Désolé, quelque chose s'est mal passé. Veuillez réessayer plus tard.");
        }
    }
};
