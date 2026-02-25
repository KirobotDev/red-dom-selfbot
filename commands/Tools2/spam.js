const activeSpams = new Map();

module.exports = {
  name: "spam",
  description: "Spam a message",
  run: async (client, message, args) => {
    const senderId = message.author.id;

    if (args[0]?.toLowerCase() === "stop") {
      if (activeSpams.has(senderId)) {
        activeSpams.set(senderId, false);
        return message.edit("Spam arrêté.").catch(() => false);
      } else {
        return message.edit("Aucun spam à arrêter.").catch(() => false);
      }
    }

    const amount = args[0];
    const lastArg = args[args.length - 1];
    const possibleChannelOrUserId = lastArg && /^\d+$/.test(lastArg) ? lastArg : null;
    const messageToSend = args
      .slice(1, possibleChannelOrUserId ? -1 : undefined)
      .join(" ");

    if (!amount) {
      return message
        .edit("Utilisation incorrecte. Veuillez utiliser &spam <nombre> <message> [id_du_salon/dm] ou &spam stop")
        .catch(() => false);
    }

    if (isNaN(amount) || amount < 1 || amount > 1000) {
      return message
        .edit("Pas plus de 1000 ça fait déjà beaucoup tsais")
        .catch(() => false);
    }

    if (!messageToSend) {
      return message
        .edit("Utilisation incorrecte. Veuillez utiliser &spam <nombre> <message> [id_du_salon/dm] ou &spam stop")
        .catch(() => false);
    }

    if (activeSpams.has(senderId)) {
      return message
        .edit("Vous avez déjà un spam en cours. Utilisez `&spam stop` pour l'arrêter.")
        .catch(() => false);
    }

    let targetChannel = message.channel;
    if (possibleChannelOrUserId) {
      try {
        targetChannel = await client.channels.fetch(possibleChannelOrUserId).catch(() => null);
        if (!targetChannel) {
          targetChannel = await client.users.fetch(possibleChannelOrUserId).then(user => user.createDM()).catch(() => null);
        }
      } catch {
        targetChannel = null;
      }
    }

    if (!targetChannel) {
      return message
        .edit("L'ID du salon ou de l'utilisateur spécifié est invalide.")
        .catch(() => false);
    }

    const spamMessage = await message.edit("Spam en cours... Utilisez `&spam stop` pour l'arrêter").catch(() => false);
    activeSpams.set(senderId, true);

    try {
      for (let i = 0; i < parseInt(amount); i++) {
          
        if (!activeSpams.get(senderId)) {
          break;
        }
        
        await targetChannel.send(messageToSend).catch(() => false);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("Erreur lors du spam:", error);
    }

    activeSpams.delete(senderId);
    
    if (spamMessage) {
      await spamMessage.edit("Spam terminé.").catch(() => false);
      setTimeout(() => {
        spamMessage.delete().catch(() => false);
      }, 3000);
    }

    if (global.gc) {
      global.gc();
    }
  },
};