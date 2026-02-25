const Discord = require("discord.js");

module.exports = {
  name: "reddom",
  descriptionfr: "REDDOM MOUAHAHAAAHAH",
  descriptionen: "REDDOM",
  usage: "",
  run: async (client, message, args) => {
    try {
      await message.delete();
    } catch (error) {
      console.error("Erreur lors de la suppression du message:", error);
    }
    message.channel.send("https://discord.gg/jGgZNgHXee");
  }
};