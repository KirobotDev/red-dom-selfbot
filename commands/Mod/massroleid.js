module.exports = {
  name: "massroleid",
  description: "Ajoute un rôle à tous les membres ayant un rôle spécifique.",
  run: async (client, message, args) => {
    let roleHave = message.guild.roles.cache.get(args[0]);
    let roleGive = message.guild.roles.cache.get(args[1]);
    
    if (!roleHave || !roleGive) {
      return message.edit("Rôle non trouvé. Assurez-vous de fournir des ID valides.");
    }

    await message.guild.members.fetch();
    let members = message.guild.members.cache.filter(member => member.roles.cache.has(roleHave.id));
    let totalMembers = members.size;
    if (totalMembers === 0) {
      return message.edit("Aucun membre trouvé avec ce rôle.");
    }

    let processedMembers = 0;
    let progressMessage = await message.channel.send(`Ajout du rôle à 0/${totalMembers} membres...`);

    async function addRoleToEligibleMembers(members, roleGive) {
      const BATCH_SIZE = 10;
      let batch = [];
      
      for (let member of members.values()) {
        if (!member.roles.cache.has(roleGive.id)) {
          batch.push(member.roles.add(roleGive).catch(error => {
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
      console.log(`Ajout du rôle ${roleGive.name} à tous les membres ayant ${roleHave.name}...`);
      await addRoleToEligibleMembers(members, roleGive);
      await progressMessage.edit(`Le rôle ${roleGive.name} a été ajouté à ${processedMembers} membres ayant ${roleHave.name}.`);
      console.log(`Le rôle ${roleGive.name} a été ajouté à ${processedMembers} membres.`);
    } catch (error) {
      console.error("Erreur lors de l'ajout du rôle :", error);
      await progressMessage.edit("Erreur lors de l'ajout du rôle.");
    }
  }
};