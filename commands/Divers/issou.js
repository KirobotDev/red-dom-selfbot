
module.exports = 
  {
    name: "issou",
    descriptionfr: "Issou",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/1139091802943656028.png?quality=lossless&name=Issou&size=48");
    }
  }