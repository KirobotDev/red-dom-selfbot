module.exports = {
  name: "massrole",
  description: "Ajoute un rôle mentionné ou avec l'ID du rôle à tous les membres du serveur.",
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
    let progressMessage = await message.channel.send(`Ajout du rôle à 0/${totalMembers} membres...`);

    async function addRoleToAllMembers(members, role) {
      const BATCH_SIZE = 10;
      let batch = [];
      
      for (let member of members.values()) {
        if (!member.roles.cache.has(role.id)) {
          batch.push(member.roles.add(role).catch(error => {
            console.error(`Erreur lors de l'ajout du rôle à ${member.user.tag}: ${error.message}`);
          }));

          if (batch.length === BATCH_SIZE) {
            await Promise.all(batch);
            processedMembers += batch.length;
            await progressMessage.edit(`Ajout du rôle à ${processedMembers}/${totalMembers} membres...`);
            batch = [];
          }
        }
      }

      if (batch.length > 0) {
        await Promise.all(batch);
        processedMembers += batch.length;
        await progressMessage.edit(`Ajout du rôle à ${processedMembers}/${totalMembers} membres...`);
      }
    }

    try {
      console.log(`Début de l'ajout du rôle ${role.name} à tous les membres...`);
      await addRoleToAllMembers(members, role);
      await progressMessage.edit(`Le rôle ${role.name} a été ajouté à ${processedMembers} membres.`);
      console.log(`Le rôle ${role.name} a été ajouté à ${processedMembers} membres.`);
    } catch (error) {
      console.error("Erreur lors de l'ajout du rôle :", error);
      await progressMessage.edit(`Erreur lors de l'ajout du rôle.`);
    }
  }
};