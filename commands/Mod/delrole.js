const fs = require('fs');
const path = require('path');
const { language } = require("../../fonctions");

module.exports = {
  name: "delrole",
  description: "Supprime un rôle spécifique du serveur",
  usage: "delrole <ID ou nom du rôle>",
  run: async (client, message, args) => { 
    if (!args[0]) {
      const guild = message.guild;
      const roles = guild.roles.cache
        .filter(r => !r.managed && r.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => `- ${r.name} (ID: ${r.id}) | Position: ${r.position} | Membres: ${r.members.size}`)
        .join('\n');

      const roleCount = guild.roles.cache.filter(r => !r.managed && r.id !== guild.id).size;
      
      await message.edit(`**Rôles disponibles (${roleCount}) :**\n\n${roles}\n\n**Usage :** \`&delrole <ID ou nom du rôle>\`\n**Supprimer tous :** \`&delrole all\``);
      return;
    }

    const guild = message.guild;
    const isOwner = guild.ownerId === message.author.id;
     
    if (args[0].toLowerCase() === "all") {
      await message.edit(`Suppression de tous les rôles...`);
      
      const botMember = await guild.members.fetch(client.user.id);
      const botHighestRole = botMember.roles.highest;
      
      let deletableRoles;
      if (isOwner) {
        deletableRoles = guild.roles.cache.filter(r => 
          !r.managed && 
          r.id !== guild.id
        );
      } else {
        deletableRoles = guild.roles.cache.filter(r => 
          !r.managed && 
          r.id !== guild.id && 
          r.position < botHighestRole.position
        );
      }
      
      if (deletableRoles.size === 0) {
        return message.edit('Aucun rôle à supprimer.');
      }
      
      await message.edit(`Suppression de ${deletableRoles.size} rôle(s) en cours...`);
      
      let successCount = 0;
      let failCount = 0;
      const failedRoles = [];
      
      for (const [roleId, role] of deletableRoles) {
        try {
          await role.delete(`Suppression de masse par ${message.author.tag}`);
          successCount++;
           
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          failCount++;
          failedRoles.push(`${role.name} (${role.id})`);
          console.error(`Erreur suppression rôle ${role.name}:`, error);
        }
      }
      
      let resultMessage = `Suppression terminée.\n${successCount} rôle(s) supprimé(s) avec succès.`;
      
      if (failCount > 0) {
        resultMessage += `\n${failCount} rôle(s) n'ont pas pu être supprimé(s): ${failedRoles.join(', ')}`;
      }
      
      return message.edit(resultMessage);
    }
     
    await message.edit('Recherche du rôle...');
    
    const roleIdentifier = args.join(' ');
    
    let role = guild.roles.cache.get(roleIdentifier);
    
    if (!role) {
      role = guild.roles.cache.find(r => r.name === roleIdentifier);
    }
    
    if (!role) { 
      role = guild.roles.cache.find(r => r.name.toLowerCase() === roleIdentifier.toLowerCase());
    }
    
    if (!role) {
      return message.edit('Rôle non trouvé. Vérifiez l\'ID ou le nom du rôle.');
    }
    
    if (role.id === guild.id) {
      return message.edit('Impossible de supprimer le rôle @everyone.');
    }
    
    if (role.managed) {
      return message.edit('Impossible de supprimer un rôle géré par une intégration ou un bot.');
    }
    
    const botMember = await guild.members.fetch(client.user.id);
    const botHighestRole = botMember.roles.highest;
    
    if (role.position >= botHighestRole.position && !isOwner) {
      return message.edit(`Impossible de supprimer ce rôle car sa position (${role.position}) est supérieure ou égale à celle du bot (${botHighestRole.position}).`);
    }
    
    try {
      await role.delete(`Suppression demandée par ${message.author.tag}`);
      
      console.log(`Rôle supprimé: ${role.name} (${role.id}) par ${message.author.tag} dans ${guild.name}`);
      
      await message.edit(`Rôle "${role.name}" (${role.id}) supprimé avec succès.`);
      
    } catch (error) {
      console.error('Erreur suppression rôle:', error);
      await message.edit(`Erreur lors de la suppression du rôle: ${error.message}`);
    }
  }
};