const axios = require("axios");
const { language } = require("../../fonctions");
 
const UNSPLASH_ACCESS_KEY = "DtajuRL3hWrF_hyVpKkK491b5OXDQyEc_zorKKIOSC8";

module.exports = {
  name: "image",
  description: "Search and get a new image based on a keyword",
  run: async (client, message, args) => {
    try {
      const query = args.join(" ");
      if (!query) {
        message.edit(await language(client, "Please provide a search keyword.", "Veuillez fournir un mot-clé de recherche."));
        return;
      }
 
      const page = Math.floor(Math.random() * 50) + 1;

      const response = await axios.get(`https://api.unsplash.com/search/photos`, {
        params: {
          query: query,
          per_page: 1,
          page: page
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      });

      if (response.data.results.length === 0) {
        message.edit(await language(client, "No images found for your search.", "Aucune image trouvée pour votre recherche."));
        return;
      }

      const imageUrl = response.data.results[0].urls.regular;

      message.edit(`⛧ **RD** ⛧\n> **Image pour : \`${query}\`\n> Voici :**\n${imageUrl}`);
    } catch (e) {
      console.error(e);
      message.edit(await language(client, "An error occurred while fetching the image.", "Une erreur est survenue lors de la récupération de l'image."));
    }
  },
};
