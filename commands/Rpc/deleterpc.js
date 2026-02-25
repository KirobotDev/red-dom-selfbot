const { savedb } = require("../../fonctions");

module.exports = {
  name: "deleterpc",
  description: "Disable the current Rich Presence (RPC)",
  run: async (client, message, args, db) => {
    try {
        
      db.rpconoff = 'off';

      await savedb(client, db);

      client.user.setPresence({ activities: [] });

      await client.user.setActivity(null);

      message.edit("Le RPC a été désactivé avec succès !");
    } catch (e) {
      console.error("Erreur lors de la désactivation du RPC:", e);
      message.edit("Une erreur est survenue lors de la tentative de désactivation du RPC.");
    }
  }
};