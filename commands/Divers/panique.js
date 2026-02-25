
module.exports = 
  {
    name: "panique",
    descriptionfr: "IDK",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/1322897468068728903.webp?size=80");
    }
  }