const sqlDb = require('../../sqlDb');

module.exports = {
  name: "setmute",
  descriptionfr: "Active ou désactive le mute lors d'un autovoc",
  descriptionen: "Enable or disable the mute when autovoc",
  usage: "<on/off>",

  run: async (client, message, args) => {
    const userId = message.author.id;
     
    const userData = await sqlDb.getUserData(userId);
    
    const option = args[0]?.toLowerCase();
    if (!option || !["on", "off"].includes(option)) {
      return message.edit("❌ Paramètre invalide : utilisez `on` ou `off`.");
    }
      
    const voicemute = option === "on";
 
    await sqlDb.updateUserData(userId, {
      voicemute: voicemute
    });

    return message.edit(
      voicemute
        ? "Vous serez mute lors d'un autovoc."
        : "Vous ne serez pas mute lors d'un autovoc."
    );
  }
};