module.exports = 
  {
    name: "wolf",
    descriptionfr: "Wolf",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/1047601401892700181.png?quality=lossless&name=WolfHeart&size=48");
    }
}