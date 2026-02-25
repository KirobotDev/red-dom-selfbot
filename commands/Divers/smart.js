
module.exports = 
  {
    name: "genius",
    descriptionfr: "smart",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/893700439059607664.webp?size=48&animated=true");
    }
  }