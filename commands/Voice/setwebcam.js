const sqlDb = require('../../sqlDb');

module.exports = {
  name: "setwebcam",
  aliases: ["setcam", "cam", "webcam"],
  descriptionfr: "Active ou désactive la cam lors d'un autovoc",
  descriptionen: "Enable or disable the cam when autovoc",
  usage: "<on/off>",

  run: async (client, message, args) => {
    const userId = message.author.id; 
    
    const option = args[0]?.toLowerCase();
    if (!option || !["on", "off"].includes(option)) {
      return message.edit("Paramètre invalide : utilisez `on` ou `off`.");
    }
      
    const voicewebcam = option === "on";
 
    await sqlDb.updateUserData(userId, {
      voicewebcam: voicewebcam
    });

    return message.edit(
      voicewebcam
        ? "Vous serez en webcam lors d'un autovoc."
        : "Vous ne serez pas en webcam lors d'un autovoc."
    );
  }
};