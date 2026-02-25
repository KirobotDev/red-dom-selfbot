
module.exports = 
  {
    name: "heart",
    descriptionfr: "IDK",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/1297233155979477124.gif?size=48");
    }
  }