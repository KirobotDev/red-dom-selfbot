const fs = require('fs');
const path = require('path');
const { language } = require("../../fonctions");

module.exports = {
  name: "delsalon",
  description: "Supprime un salon spécifique ou tous les salons",
  run: async (client, message, args, prefix) => {

    prefix = prefix.prefix;

    if (!message.guild) {
      return message.edit(await language(client,
        "Vous devez utiliser cette commande dans un serveur.",
        "You must use this command in a server."
      ));
    }

    if (!message.member.permissions.has("MANAGE_CHANNELS")) {
      return message.edit(await language(client,
        "Vous n'avez pas les permissions nécessaires pour utiliser cette commande.",
        "You don't have the required permissions to use this command."
      ));
    }

    message.delete().catch(() => false);

    if (!args[0]) {
      return message.channel.send(await language(
        client,
        `Veuillez choisir une option :
- \`${prefix}delsalon here\` pour supprimer **ce salon**
- \`${prefix}delsalon (id ou mention)\` pour supprimer **un salon spécifique**
- \`${prefix}delsalon all\` pour supprimer **tous les salons**.`,
        `Please choose an option:
- \`${prefix}delsalon here\` to delete **this channel**
- \`${prefix}delsalon (id or mention)\` to delete **a specific channel**
- \`${prefix}delsalon all\` to delete **all channels**.`
      ));
    }

    if (args[0].toLowerCase() === 'here') {
      if (!message.channel.deletable) {
        return message.channel.send(await language(client,
          "Ce salon ne peut pas être supprimé.",
          "This channel cannot be deleted."
        ));
      }

      return message.channel.delete().catch(async (error) => {
        console.error(`Erreur lors de la suppression du salon ${message.channel.name}:`, error);
        await message.channel.send(await language(client,
          `Erreur lors de la suppression du salon : ${error.message}`,
          `Error deleting the channel: ${error.message}`
        ));
      });
    }

    if (args[0].toLowerCase() === 'all') {
      message.guild.channels.cache.forEach(channel => {
        if (channel.deletable) {
          channel.delete().catch(error =>
            console.error(`Erreur lors de la suppression du salon ${channel.name}:`, error)
          );
        }
      });
      return;
    }

    const channelId = args[0].replace('<#', '').replace('>', '');
    const channel = message.guild.channels.cache.get(channelId);

    if (!channel) {
      return message.channel.send(await language(client,
        "Salon introuvable. Vérifiez l'ID ou la mention.",
        "Channel not found. Please check the ID or mention."
      ));
    }

    if (!channel.deletable) {
      return message.channel.send(await language(client,
        "Ce salon ne peut pas être supprimé.",
        "This channel cannot be deleted."
      ));
    }

    channel.delete().catch(async (error) => {
      console.error(`Erreur lors de la suppression du salon ${channel.name}:`, error);
      await message.channel.send(await language(client,
        `Erreur lors de la suppression du salon : ${error.message}`,
        `Error deleting the channel: ${error.message}`
      ));
    });
  }
};
