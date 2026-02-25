module.exports = {
  name: "idcategory",
  descriptionfr: "Affiche l'ID d'une catégorie mentionnée (ou de la catégorie du salon actuel)",
  usage: "&idcategory [#salon]",
  run: async (client, message, args) => {
    message.delete().catch(() => false);

    let category = null;

    const channel = message.mentions.channels.first();
    if (channel && channel.parent) {
      category = channel.parent;
    }

    if (!category && message.channel.parent) {
      category = message.channel.parent;
    }

    if (!category) {
      return message.channel.send("Impossible de trouver la catégorie :(. Exemple: `&idcategory #salon`");
    }

    message.channel.send(`L'ID de la catégorie **${category.name}** est : \`${category.id}\``);
  }
};
