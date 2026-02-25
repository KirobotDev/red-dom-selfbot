const spamUsers = require("./autospamusers");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "autospam",
  description: "Spam a message continuously until stopped",
  run: async (client, message, args) => {
      
    const subCommand = args[0]?.toLowerCase();

    if (subCommand === "stop") {
      const senderId = message.author.id;

      if (!spamUsers[senderId]?.active) {
        return message
          .edit("Aucun autospam en cours à arrêter.")
          .catch(() => false);
      }

      spamUsers[senderId].active = false;
      return message
        .edit("Autospam arrêté avec succès.")
        .catch(() => false);
    }

    const messageToSend = args.join(" ");
    const senderId = message.author.id;

    if (!messageToSend) {
      return message
        .edit("Utilisation incorrecte. Veuillez utiliser `&autospam <message>` ou `&autospam stop`.")
        .catch(() => false);
    }

    if (spamUsers[senderId]?.active) {
      return message
        .edit("Un autospam est déjà en cours. Utilisez `&autospam stop` pour l'arrêter.")
        .catch(() => false);
    }

    if (messageToSend.toLowerCase().includes("lootbox")) {
        return message
          .edit("Non, vous ne pouvez pas utiliser &autospam avec lootbox.")
          .catch(() => false);
      }
  

    const spamMessage = await message.edit("Autospam en cours... Utilisez `&autospam stop` pour l'arrêter.").catch(() => false);
    spamUsers[senderId] = { active: true };

    while (spamUsers[senderId]?.active) {
      await message.channel.send(messageToSend).catch(() => false);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    spamUsers[senderId] = { active: false };

    if (spamMessage) {
      spamMessage.delete().catch(() => false);
    }
  },
};
