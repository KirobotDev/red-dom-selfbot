
module.exports = 
  {
    name: "idkk",
    descriptionfr: "IDK",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/1233116370896420884.png?quality=lossless&name=shrugemoji&size=96");
    }
  }