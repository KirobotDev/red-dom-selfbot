module.exports = 
  {
    name: "shock",
    descriptionfr: "Shock",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/1047601614577467442.png?quality=lossless&name=PepeWow&size=48");
    }
  }