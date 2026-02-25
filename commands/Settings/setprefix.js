const { savedb, updatePrefixCache } = require("../../fonctions");

module.exports = {
  name: "setprefix",
  aliases: ["prefix", "px"],
  description: "Modifier le prefix du selfbot",

  run: async (client, message, args, db) => {
    try {
        if (!args[0]) 
            return message.edit("Vous devez me donner un prefix");

        if (args[0].length > 100)
            return message.edit("Votre prefix ne peut pas dépasser les 100 caractères");

        if (typeof args[0] !== "string")
            return message.edit("Votre prefix doit être un texte");

        const newPrefix = args[0];
        
        message.edit(`Ton prefix est maintenant \`${newPrefix}\``);
        
        db.prefix = newPrefix;
        await savedb(client, db);
        
        await updatePrefixCache(client.user.id, newPrefix);
    }
    catch(e){
        console.error("Erreur dans setprefix:", e);
        message.edit("Une erreur est survenue lors de la modification du prefix");
    }
  }
}