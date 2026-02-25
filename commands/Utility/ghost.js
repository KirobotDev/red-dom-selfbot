const { language } = require("../../fonctions");

module.exports = {
  name: "ghost",
  description: "Envoie un message qui se supprime après un certain temps",
  run: async (client, message, args) => {

    message.delete().catch(() => false);

    const timeInput = args.pop();
    const ghostMessage = args.join(" ");

    if (!timeInput || !ghostMessage) {
      return message.channel.send(
        await language(client, "Veuillez spécifier un message et un délai (en s, m ou h)", "Please specify a message and a time (in s, m, or h).")
      ).then(msg => setTimeout(() => msg.delete(), 5000)); 
    }

    const timeUnit = timeInput.slice(-1);
    const timeValue = parseInt(timeInput.slice(0, -1));

    if (isNaN(timeValue) || !["s", "m", "h"].includes(timeUnit)) {
      return message.channel.send(
        await language(client, "Délai invalide. Utilisez s pour secondes, m pour minutes, ou h pour heures.", "Invalid time format. Use s for seconds, m for minutes, or h for hours.")
      ).then(msg => setTimeout(() => msg.delete(), 5000));
    }

    let delay;
    switch (timeUnit) {
      case "s":
        delay = timeValue * 1000;
        break;
      case "m":
        delay = timeValue * 60 * 1000;
        break;
      case "h":
        delay = timeValue * 60 * 60 * 1000;
        break;
    }

    const sentMessage = await message.channel.send(ghostMessage);
    setTimeout(() => {
      sentMessage.delete().catch(() => false);
    }, delay);
  },
};
