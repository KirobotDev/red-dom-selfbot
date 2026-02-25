const { savedb } = require("../../fonctions");
const restartUser = require("./restartUser");

module.exports = {
  name: "platform",
  description: "Modifier la plateforme du selfbot",
  run: async (client, message, args, db) => {
    try {
      const validPlatforms = ["mobile", "desktop", "web"];
      const choice = args[0]?.toLowerCase();

      if (!choice || !validPlatforms.includes(choice)) {
        return message.edit(`Veuillez spécifier une plateforme valide : ${validPlatforms.map(p => `\`${p}\``).join(", ")}`);
      }

      db.platform = choice;
      await savedb(client, db);

      const channelId = message.channel.id;
      const messageId = message.id;
      const userId = client.user.id;
      const token = client.token;

      await message.edit("🔄 Redémarrage avec la nouvelle plateforme...");

      setTimeout(async () => {
        try {
          await client.destroy();
          const newClient = await restartUser(userId, token);

          setTimeout(async () => {
            try {
              const channel = await newClient.channels.fetch(channelId);
              const msg = await channel.messages.fetch(messageId);
              await msg.edit("✅ Redémarrage terminé avec la nouvelle plateforme !");
            } catch (err) {
              console.error("Impossible d'éditer le message après redémarrage :", err);
            }
          }, 3000);

        } catch (err) {
          console.error("Erreur lors du redémarrage :", err);
        }
      }, 1000);

    } catch (e) {
      console.error("Erreur dans la commande platform :", e);
      return message.edit("❌ Une erreur est survenue lors de l'exécution de la commande.");
    }
  }
};