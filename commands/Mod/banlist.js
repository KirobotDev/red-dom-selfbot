const Discord = require("safeness-sb-new");

module.exports = {
  name: "banlist",
  description: "Afficher la liste des membres bannis du serveur.",
  run: async (client, message, args) => {
    if (!message.member.permissions.has(Discord.Permissions.FLAGS.BAN_MEMBERS)) {
      return message.edit("❌ Vous n'avez pas la permission de voir la liste des membres bannis.");
    }

    try {
      const banList = await message.guild.bans.fetch({ limit: 1000 });

      if (!banList || banList.size === 0) {
        return message.edit("✅ Aucun membre n'est banni sur ce serveur.");
      }

      let banMessage = "Voici la liste des membres bannis :\n";
      for (const ban of banList.values()) {
        banMessage += `• **${ban.user.tag}** (ID: ${ban.user.id}) - Raison : ${ban.reason || "Aucune raison spécifiée"}\n`;
      }

      if (banMessage.length > 2000) {
        banMessage = banMessage.slice(0, 1997) + "...";
      }

      message.edit(banMessage);
    } catch (error) {
      console.error(error);
      message.edit("❌ Une erreur est survenue en récupérant la liste des bannissements.");
    }
  },
};
