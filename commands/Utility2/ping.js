module.exports = {
  name: "ping",
  description: "Get the ping of the client",
  run: async (client, message, args) => {
    try {
      const sentMessage = await message.channel.send("⏳ Calcul du ping...");
      const restPing = sentMessage.createdTimestamp - message.createdTimestamp;
      let wsPing = client.ws.ping;

      let appreciation;
      if (restPing < 500) {
        appreciation = `optimal (${(restPing / 1000).toFixed(2)}s)`;
      } else if (restPing < 800) {
        appreciation = `correct (${(restPing / 1000).toFixed(2)}s)`;
      } else if (restPing < 2000) {
        appreciation = `un peu laggy (${(restPing / 1000).toFixed(2)}s)`;        
      } else {
        appreciation = `là c harr (${(restPing / 1000).toFixed(2)}s)`;
      }

      if (wsPing > 1000 || wsPing < 0) {
        wsPing = "stable ✅";
      } else {
        wsPing = `${wsPing}ms`;
      }

      await sentMessage.edit(
        `🏓 Ton ping : \`${restPing}ms\` → ${appreciation}\n🤖 Ping SB : \`${wsPing}\``
      );
    } catch (e) {
      console.log("❌ Erreur ping:", e);
    }
  }
};
