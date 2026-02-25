
module.exports = 
  {
    name: "king",
    descriptionfr: "King",
    usage: "",
    run: async (client, message, args) => {
      message.delete().catch(() => false);
      message.channel.send("https://tenor.com/view/king-king-baldwin-king-baldwin-4-rikoamv-riko-amv-gif-8479237540916603760");
    }
  }