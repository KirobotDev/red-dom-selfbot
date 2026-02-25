const axios = require('axios');

const IMGUR_CLIENT_ID = '9c8b7aacb9bd434'; // Remplace avec ton client ID Imgur
const usedGifsMap = new Map(); // Map pour stocker les GIFs déjà envoyés par mot-clé

module.exports = {
    name: 'gif',
    description: 'Envoie un GIF selon un mot-clé.',
    run: async (client, message, args) => {
        if (args.length === 0) {
            return message.channel.send('Veuillez fournir un mot-clé pour le GIF.');
        }

        const keyword = args.join(' ');
        const url = `https://api.imgur.com/3/gallery/search?q=${encodeURIComponent(keyword)}&count=50`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
                }
            });

            // Filtrer pour obtenir uniquement les images de type 'gif'
            const gifs = response.data.data.filter(item => 
                item.images && item.images.some(img => img.type === 'image/gif')
            );

            if (gifs.length === 0) {
                return message.channel.send('Aucun GIF trouvé pour ce mot-clé.');
            }

            // Récupérer les GIFs utilisés pour ce mot-clé
            let usedGifs = usedGifsMap.get(keyword) || new Set();

            // Vérifier si tous les GIFs ont été utilisés
            if (usedGifs.size >= gifs.length) {
                message.channel.send('Tous les GIFs ont été utilisés. Réinitialisation.');
                usedGifs.clear(); // Réinitialise pour ce mot-clé
            }

            // Choisir un GIF non utilisé aléatoirement
            let randomGif;
            do {
                randomGif = gifs[Math.floor(Math.random() * gifs.length)];
            } while (usedGifs.has(randomGif.id));

            // Ajouter le GIF utilisé dans l'ensemble
            usedGifs.add(randomGif.id);
            usedGifsMap.set(keyword, usedGifs); // Mettre à jour la map avec l'ensemble mis à jour

            // Envoyer le lien du GIF
            const gifImage = randomGif.images.find(img => img.type === 'image/gif');
            message.channel.send(gifImage.link);
        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
            message.channel.send('Une erreur est survenue lors de la récupération du GIF.');
        }
    }
};
