const { savedb } = require("../../fonctions");

module.exports = {
  name: "setlang",
  description: "Modifier la langue du selfbot",
  run: async (client, message, args, db) => {
    try{
        if (!args[0] || (args[0] !== "en" && args[0] !== "fr")) {
            return message.edit(`Veuillez écrire \`en\` ou \`fr\` après la commande`);
        }
        
        if (args[0] === "en"){
            db.langue = "en";
            await savedb(client, db);
            message.edit("The language of the bot has been set to `english`");
        }
        else{
            db.langue = "fr";
            await savedb(client, db);
            message.edit("Le language du bot a été mis sur `français`");
        }
    }
    catch(e){
        console.error("Erreur dans setlang:", e);
        message.edit("Une erreur est survenue lors du changement de langue.");
    }
  }
}