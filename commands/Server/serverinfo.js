const { language } = require("../../fonctions");

module.exports = {
  name: "serverinfo",
  description: "Display the info of a server",
  run: async (client, message, args, db) => {
    try {
      let guild = args[0]
        ? client.guilds.cache.get(args[0])
        : message.guild;

      if (!guild) return message.edit(`Aucun serveur trouvé pour \`${args[0] || "rien"}\``);

      const createdTimestamp = Math.round(guild.createdTimestamp / 1000);
      const joinedTimestamp = Math.round(guild.members.me?.joinedTimestamp / 1000);
      const daysSinceCreation = Math.floor((Date.now() - guild.createdTimestamp) / (1000 * 60 * 60 * 24));

      const members = guild.memberCount; 
      const channels = guild.channels.cache.size;
      const roles = guild.roles.cache.size;

      const infoMessage = await language(client, `**⛧ RD - ServerInfo ⛧

> Nom: ${guild.name}
> ID: ${guild.id}
> Propriétaire: <@${guild.ownerId}>
> ID du propriétaire: ${guild.ownerId}
> Salons: ${channels}
> Rôles: ${roles}
> Membres: ${members}
> Date de création: <t:${createdTimestamp}> <t:${createdTimestamp}:R>
> Jours depuis la création: ${daysSinceCreation}
> Sur le serveur depuis: ${joinedTimestamp ? `<t:${joinedTimestamp}> <t:${joinedTimestamp}:R>` : "Inconnu"}
> Bannière du serveur: ${guild.banner ? guild.bannerURL({size: 1024, format: "webp"}) : "Pas de bannière"}
> Url du serveur: ${guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : "Pas d'url personnalisée"}
> Photo du serveur: ${guild.icon ? guild.iconURL({dynamic: true}) : "Pas d'icone"}
> Bannière d'invitation: ${guild.splash ? guild.splashURL({format: "webp", size: 1024}) : "Pas de bannière"}**`,
      `**⛧ RD - ServerInfo ⛧

> Name: ${guild.name}
> ID: ${guild.id}
> Founder: <@${guild.ownerId}>
> Founder ID: ${guild.ownerId}
> Channels: ${channels}
> Roles: ${roles}
> Members: ${members}
> Creation date: <t:${createdTimestamp}> <t:${createdTimestamp}:R>
> Days since creation: ${daysSinceCreation}
> In the server from: ${joinedTimestamp ? `<t:${joinedTimestamp}> <t:${joinedTimestamp}:R>` : "Unknown"}
> Server banner: ${guild.banner ? guild.bannerURL({size: 1024, format: "webp"}) : "No banner"}
> Server icon: ${guild.icon ? guild.iconURL({dynamic: true}) : "No icon"}
> Splash Banner: ${guild.splash ? guild.splashURL({format: "webp", size: 1024}) : "No Banner"}**`);

      message.edit(infoMessage);
    } catch (error) {
      console.error("An error occurred while fetching server info:", error);
      message.edit("Une erreur est survenue lors de la récupération des informations du serveur.");
    }
  }
};
