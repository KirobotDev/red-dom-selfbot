const Discord = require("safeness-sb-new");

module.exports = {
  name: "checktoken",
  description: "Vérifie si un token Discord est valide.",
  run: async (client, message, args) => {
    if (!args.length) {
      return message.edit(`\`❗\` Veuillez __fournir__ un **token Discord** après la commande.`);
    }

    const token = args[0];

    try {
      const nclient = new Discord.Client({
        checkUpdate: false,
        intents: [Discord.Intents.FLAGS.GUILDS],
      });

      nclient.once("ready", async () => {
        await message.edit(`\`✅\` **Le token est __valide__ !**`);
        nclient.destroy(); 
      });

      await nclient.login(token);
    } catch (error) {
      await message.edit(`\`❌\` **Le token** est __invalide__ !`);
    }
  }
};
