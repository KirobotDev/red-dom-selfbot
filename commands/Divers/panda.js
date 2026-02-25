
module.exports = 
  {
    name: "panda",
    descriptionfr: "Panda",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/1313005051043774566.webp?size=48");
    }
  }