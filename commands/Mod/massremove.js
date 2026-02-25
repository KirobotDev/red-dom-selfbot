module.exports = {
  name: "massremove",
  description: "Retire un rôle mentionné ou avec l'ID du rôle de tous les membres du serveur.",
  run: async (client, message, args) => {
    let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!role) {
      return message.edit(`Rôle non trouvé.`);
    }

    await message.guild.members.fetch();

    let members = message.guild.members.cache;
    let totalMembers = members.size;
    if (totalMembers === 0) {
      return message.edit(`Aucun membre trouvé dans le serveur.`);
    }

    let processedMembers = 0;
    let progressMessage = await message.channel.send(`Retrait du rôle à 0/${totalMembers} membres...`);

    async function removeRoleFromAllMembers(members, role) {
      const BATCH_SIZE = 10;
      let batch = [];
      
      for (let member of members.values()) {
        if (member.roles.cache.has(role.id)) {
          batch.push(member.roles.remove(role).catch(error => {
            console.error(`Erreur lors du retrait du rôle à ${member.user.tag}: ${error.message}`);
          }));

          if (batch.length === BATCH_SIZE) {
            await Promise.all(batch);
            processedMembers += batch.length;
            await progressMessage.edit(`Retrait du rôle à ${processedMembers}/${totalMembers} membres...`);
            batch = [];
          }
        }
      }

      if (batch.length > 0) {
        await Promise.all(batch);
        processedMembers += batch.length;
        await progressMessage.edit(`Retrait du rôle à ${processedMembers}/${totalMembers} membres...`);
      }
    }

    try {
      console.log(`Début du retrait du rôle ${role.name} de tous les membres...`);
      await removeRoleFromAllMembers(members, role);
      await progressMessage.edit(`Le rôle ${role.name} a été retiré de ${processedMembers} membres.`);
      console.log(`Le rôle ${role.name} a été retiré de ${processedMembers} membres.`);
    } catch (error) {
      console.error("Erreur lors du retrait du rôle :", error);
      await progressMessage.edit(`Erreur lors du retrait du rôle.`);
    }
  }
};