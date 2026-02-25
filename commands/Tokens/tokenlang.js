'use strict';
const axios = require("axios");

module.exports = {
  name: "tokenlang",
  description: "Changer la langue d'un compte Discord via son token.",
  run: async (client, message, args) => {
    if (args.length < 2) {
      return message.edit("Veuillez fournir un token et une langue après la commande.\nExemple : `&tokenlang <token> <langue>`");
    }

    const token = args[0];
    const language = args[1];

    try {
      const response = await axios.get("https://discord.com/api/v9/users/@me", {
        headers: { Authorization: token }
      });
    } catch (error) {
      return message.edit("Token invalide ou non authentifié.");
    }

    try {
      await axios.patch("https://discord.com/api/v9/users/@me/settings",
        { locale: language },
        { headers: { Authorization: token, "Content-Type": "application/json" } }
      );
      message.edit(`Langue du compte changée en : ${language}`);
    } catch (error) {
      console.error("Erreur lors du changement de langue :", error.message);
      message.edit("Impossible de changer la langue.");
    }
  },
};
