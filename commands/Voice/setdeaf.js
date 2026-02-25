const sqlDb = require('../../sqlDb');

module.exports = {
  name: "setdeaf",
  descriptionfr: "Active ou désactive le deaf lors d'un autovoc",
  descriptionen: "Enable or disable the deaf when autovoc",
  usage: "<on/off>",

  run: async (client, message, args) => {
    const userId = message.author.id;
     
    const userData = await sqlDb.getUserData(userId);
    
    const option = args[0]?.toLowerCase();
    if (!option || !["on", "off"].includes(option)) {
      return message.edit("❌ Paramètre invalide : utilisez `on` ou `off`.");
    }
      
    const voicedeaf = option === "on";
 
    await sqlDb.updateUserData(userId, {
      voicedeaf: voicedeaf
    });

    return message.edit(
      voicedeaf
        ? "Vous serez en sourdine lors d'un autovoc."
        : "Vous ne serez pas en sourdine lors d'un autovoc."
    );
  }
};