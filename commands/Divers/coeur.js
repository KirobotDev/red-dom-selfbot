
module.exports = 
  {
    name: "coeur",
    descriptionfr: "IDK",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/1135020220587712552.webp?size=48");
    }
  }