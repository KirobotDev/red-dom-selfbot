const path = require('path');
const permissionStorage = require(path.resolve(__dirname, '../Mod/permissionStorage.js'));

module.exports = {
  name: "hide",
  description: "Masque un canal textuel pour tout le monde, un utilisateur ou un role specifique",
  run: async (client, message, args) => {
    let channel = message.channel;
    let target = message.mentions.users.first() || message.mentions.roles.first();

    try { 
      const VIEW_CHANNEL = 'VIEW_CHANNEL'; 
      
      const currentPermissions = channel.permissionOverwrites.cache
        .filter(overwrite => overwrite.allow.has(VIEW_CHANNEL))
        .map(overwrite => ({ id: overwrite.id, type: overwrite.type }));

      permissionStorage.setPermissions(channel.id, currentPermissions);

      if (target) {
        await channel.permissionOverwrites.create(target.id, { VIEW_CHANNEL: false });
        message.edit("Le canal " + channel.name + " a été masqué pour " + (target.name || target.tag || target.role?.name) + ".");
      } else {
        let rolesWithViewChannel = channel.permissionOverwrites.cache.filter(overwrite =>
          overwrite.type === 0 && 
          overwrite.allow.has(VIEW_CHANNEL)
        );

        for (let [roleID, overwrite] of rolesWithViewChannel) {
          await channel.permissionOverwrites.create(roleID, { VIEW_CHANNEL: false });
        }

        if (channel.permissionOverwrites.cache.get(message.guild.id)?.allow.has(VIEW_CHANNEL)) {
          await channel.permissionOverwrites.create(message.guild.id, { VIEW_CHANNEL: false });
        }

        message.edit("Le canal " + channel.name + " a été masqué pour tout le monde.");
      }
    } catch (error) {
      console.error("Erreur dans la commande hide:", error);
      message.edit("Une erreur est survenue lors de la modification des permissions.");
    }
  }
};