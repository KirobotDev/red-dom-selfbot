module.exports = {
  name: "idsalon",
  descriptionfr: "Affiche l'ID d'un salon mentionné (ou du salon courant)",
  usage: "&idsalon [#salon]",
  run: async (client, message, args) => {
    message.delete().catch(() => false);

    const channel = message.mentions.channels.first() || message.channel;

    if (!channel) {
      return message.channel.send("Impossible de trouver le salon :(. Exemple: `&idsalon #général`");
    }

    message.channel.send(`L'ID du salon **${channel.name}** est : \`${channel.id}\``);
  }
};
