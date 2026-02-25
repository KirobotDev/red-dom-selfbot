module.exports = {
  name: "unhide",
  description: "Rend un canal visible pour un role ou un utilisateur specifique, ou pour tout le monde si aucun role/utilisateur n est mentionne.",
  run: async (client, message, args) => {
    if (!message.member.permissions.has("MANAGE_CHANNELS")) {
      return message.edit("Vous n avez pas la permission de gerer les canaux.");
    }

    let channel = message.channel;
    let target = message.mentions.roles.first() || message.mentions.users.first() || (args[0] ? await message.guild.members.fetch(args[0]).catch(() => null) : null);

    try {
      if (target) {
        let targetId = target.id ? target.id : target.user.id;
        await channel.permissionOverwrites.create(targetId, { VIEW_CHANNEL: true });
        message.edit("Le canal " + channel.name + " est maintenant visible pour " + (target.name || target.user.tag) + ".");
      } else {
        await channel.permissionOverwrites.create(message.guild.roles.everyone.id, { VIEW_CHANNEL: true });
        message.edit("Le canal " + channel.name + " est maintenant visible pour tout le monde.");
      }
    } catch (error) {
      console.error(error);
      message.edit("Une erreur est survenue lors de la modification des permissions.");
    }
  }
};