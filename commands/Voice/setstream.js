const sqlDb = require('../../sqlDb');

module.exports = {
  name: "setstream",
  aliases: ["stream"],
  descriptionfr: "Active ou désactive la cam lors d'un autovoc",
  descriptionen: "Enable or disable the cam when autovoc",
  usage: "<on/off>",

  run: async (client, message, args) => {
    
    const userId = message.author.id; 
    
    const option = args[0]?.toLowerCase();
    if (!option || !["on", "off"].includes(option)) {
      return message.edit("Paramètre invalide : utilisez `on` ou `off`.");
    }
      
    const voicestream = option === "on";
 
    await sqlDb.updateUserData(userId, {
      voicestream: voicestream
    });

    return message.edit(
      voicestream
        ? "Vous serez en stream lors d'un autovoc."
        : "Vous ne serez pas en stream lors d'un autovoc."
    );
  }
};