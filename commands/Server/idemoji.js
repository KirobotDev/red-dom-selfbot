module.exports = {
  name: "idemoji",
  descriptionfr: "Affiche l'ID d'un emoji personnalisé mentionné",
  usage: "&idemoji <emoji>",
  run: async (client, message, args) => {
    message.delete().catch(() => false);

    if (args.length < 1) {
      return message.channel.send("Merci de fournir un emoji d'un server :).\nExemple: `&idemoji <:smile:123456789>`");
    }

    const emojiRegex = /<a?:\w+:(\d+)>/;
    const match = args[0].match(emojiRegex);

    if (!match) {
      return message.channel.send("Aucun emoji d'un server détecté. Essaie avec `:nom:` ou en le copiant et collant directement.");
    }

    const emojiId = match[1];
    const emojiName = args[0].split(':')[1];

    message.channel.send(`L'ID de l'emoji **${emojiName}** est : \`${emojiId}\``);
  }
};
