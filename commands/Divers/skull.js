module.exports = 
  {
    name: "skull",
    descriptionfr: "Skull",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/1174780846310436964.png?quality=lossless&name=F_scream&size=48");
    }
  }