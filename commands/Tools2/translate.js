const { translate } = require('@vitalets/google-translate-api');

module.exports = {
  name: "translate",
  description: "Traduit un texte dans la langue cible.",
  run: async (client, message, args) => {
    if (args.length < 2) {
      return message.edit(
        "`❗` **Utilisation :** &translate [langue cible] [texte à traduire]\nExemple : &translate en Bonjour tout le monde\nUtilisez &langues pour voir les différentes langues disponibles."
      );
    }

    const targetLanguage = args[0]; 
    const textToTranslate = args.slice(1).join(" "); 

    try {

      const result = await translate(textToTranslate, { to: targetLanguage });

      await message.delete();

      message.channel.send(`${result.text}`);
    } catch (error) {
        console.error(error);

      message.edit(
        `\`❌\` Une erreur s'est produite pendant la traduction. Vérifie la langue cible ou réessaie plus tard.\nDétails : ${error.message}`
      );
    }
  },
};
