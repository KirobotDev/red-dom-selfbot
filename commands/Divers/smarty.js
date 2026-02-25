
module.exports = 
  {
    name: "smart",
    descriptionfr: "smarty",
    usage: "",

    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://cdn.discordapp.com/emojis/1242195290472321188.webp?size=48");
    }
  }