const fs = require('fs');
const path = require('path');
const { language } = require("../../fonctions");

module.exports = {
  name: "delemoji",
  description: "Supprime un emoji spécifique ou tous les emojis du serveur",
  
  run: async (client, message, args) => {
    if (!args[0]) {
      return message.channel.send(`Veuillez fournir un emoji ou utilisez 'all' pour supprimer tous les emojis.`);
    }

    if (args[0].toLowerCase() === "all") {
      const emojis = message.guild.emojis.cache;
      
      for (const emoji of emojis.values()) {
        try {
          await emoji.delete();
          console.log(`Emoji ${emoji.name} supprimé.`);
        } catch (error) {
          console.error(`Erreur lors de la suppression de l'emoji ${emoji.name}:`, error);
        }
      }
      return message.channel.send(`Tous les emojis supprimables se font supprimer.`);
    }

    const emojiInput = args[0];
    const emojiRegex = /<a?:\w+:(\d+)>/;

    const match = emojiInput.match(emojiRegex);
    if (!match) {
      return message.channel.send(`Veuillez fournir un emoji valide.`);
    }

    const emojiId = match[1];
    const emoji = message.guild.emojis.cache.get(emojiId);

    if (!emoji) {
      return message.channel.send(`Emoji introuvable sur ce serveur.`);
    }

    try {
      await emoji.delete();
      message.channel.send(`L'emoji \`${emoji.name}\` a été supprimé.`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'emoji ${emoji.name}:`, error);
      message.channel.send(`Erreur lors de la suppression de l'emoji \`${emoji.name}\`.`);
    }
  }
};