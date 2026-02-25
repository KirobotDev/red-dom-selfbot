const { language } = require("../../fonctions");

module.exports = {
  name: "find",
  description: "Rechercher un utilisateur en vocal dans tous les serveurs",
  run: async (client, message, args) => {
    if (!args[0]) return message.edit(await language(client, "> Veuillez fournir un membre à rechercher", "> Please enter a member to search"));

    let userID = args[0].replace(/[^0-9]/g, '');

    let memberToFind;
    try {
      memberToFind = await client.users.fetch(userID);
      if (!memberToFind) return message.edit(await language(client, "> Membre introuvable", "> Member not found"));
    } catch (error) {
      return message.edit(await language(client, "> Membre introuvable", "> Member not found"));
    }

    let foundVoiceChannels = [];
    let processingMessage = await message.edit(await language(client, 
      "> Recherche des serveurs en commun...", 
      "> Searching for mutual servers..."
    ));

    const guilds = client.guilds.cache;
    let mutualGuilds = [];

    for (const [guildId, guild] of guilds) {
      try {
        const member = await guild.members.fetch({ user: memberToFind.id, force: false }).catch(() => null);
        if (member) {
          mutualGuilds.push(guild);
        }
      } catch (error) {
      }
    }

    if (mutualGuilds.length === 0) {
      return processingMessage.edit(await language(client,
        `> ${memberToFind.tag} n'est dans aucun serveur en commun avec moi.`,
        `> ${memberToFind.tag} isn't in any mutual server with me.`
      ));
    }

    await processingMessage.edit(await language(client,
      `> Verification du vocal dans ${mutualGuilds.length} serveur(s)...`,
      `> Checking voice chat in ${mutualGuilds.length} server(s)...`
    ));

    for (const guild of mutualGuilds) {
      try {
        const member = guild.members.cache.get(memberToFind.id) || 
                      await guild.members.fetch(memberToFind.id).catch(() => null);
        
        if (member && member.voice.channel) {
          const voiceChannel = member.voice.channel;
          foundVoiceChannels.push(await language(client, 
            `> ${memberToFind.tag} est dans <#${voiceChannel.id}> (${guild.name})`, 
            `> ${memberToFind.tag} is in <#${voiceChannel.id}> (${guild.name})`
          ));
        }
      } catch (error) {
        console.error(`Erreur avec le serveur ${guild.name}:`, error);
      }
    }

    if (foundVoiceChannels.length > 0) {
      await processingMessage.edit(`${foundVoiceChannels.join("\n")}`);
    } else {
      await processingMessage.edit(await language(client, 
        `> ${memberToFind.tag} n'est pas en vocal dans les ${mutualGuilds.length} serveur(s) en commun.`, 
        `> ${memberToFind.tag} isn't in voice chat in the ${mutualGuilds.length} mutual server(s).`
      ));
    }
  }
};