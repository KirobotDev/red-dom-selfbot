const ms = require("ms");
const path = require("path");
const fs = require("fs");

const activeGhosts = new Map();

module.exports = {
  name: "autoghost",
  description: "Supprime automatiquement vos messages après un certain temps.",
  run: async (client, message, args) => {
      
    const userId = message.author.id;
    const command = args[0];

    if (!command) {
      return message.edit(
        "**Veuillez spécifier un temps valide (ex : 10s, 5m, 1h) ou utilisez `stop` pour désactiver l'AutoGhost.**"
      );
    }

    if (command.toLowerCase() === "stop") {
      const collector = activeGhosts.get(userId);
      if (!collector) {
        return message.edit("**AutoGhost n'est pas activé.**");
      }

      collector.stop("manual");
      activeGhosts.delete(userId);
      return message.edit("**AutoGhost désactivé avec succès.**");
    }

    const delay = ms(command);

    if (!delay || delay < 1000) {
      return message.edit(
        "**Le temps spécifié est invalide ou trop court (minimum : 1s).**"
      );
    }

    if (activeGhosts.has(userId)) {
      const existingCollector = activeGhosts.get(userId);
      existingCollector.stop("replaced");
      activeGhosts.delete(userId);
    }

    message.edit(
      `**AutoGhost activé pour ${command}. Tous vos messages seront supprimés après ce délai. \`autoghost stop\` pour désactiver.**`
    );

    const filter = (msg) => msg.author.id === userId;
    const collector = message.channel.createMessageCollector({ filter });

    activeGhosts.set(userId, collector);

    collector.on("collect", (msg) => {
      setTimeout(() => {
        msg.delete().catch((err) => console.log("Erreur de suppression :", err));
      }, delay);
    });

    setTimeout(() => {
      if (activeGhosts.get(userId) === collector) {
        collector.stop("timeout");
        activeGhosts.delete(userId);
      }
    }, ms("30m"));

    collector.on("end", (_, reason) => {
      if (reason === "timeout") {
        message.channel
          .send("**AutoGhost désactivé après 30 minutes.**")
          .then((msg) => setTimeout(() => msg.delete(), 5000));
      } else if (reason === "manual") {
      } else if (reason === "replaced") {
        message.channel
          .send("**AutoGhost a été réinitialisé avec un nouveau délai.**")
          .then((msg) => setTimeout(() => msg.delete(), 5000));
      }
    });
  },
};
