module.exports = {
  name: "createwebhook",
  description: "Crée un webhook dans le salon actuel avec le nom spécifié.",
  run: async (client, message, args) => {
    try {
      const webhookName = args.join(" ");
      if (!webhookName) {
        return message.edit("Veuillez spécifier un nom pour le webhook.");
      }

      if (!message.channel.permissionsFor(message.author).has("MANAGE_WEBHOOKS")) {
        return message.edit("Vous n'avez pas les permissions pour créer un webhook.");
      }

      const webhook = await message.channel.createWebhook(webhookName, {
        avatar: message.author.displayAvatarURL({ dynamic: true }),
      });

      message.edit(`Webhook créé avec succès : \`${webhook.name}\`. URL : ${webhook.url}`);
    } catch (error) {
      console.error(error);
      message.edit("Une erreur est survenue lors de la création du webhook.");
    }
  }
};
