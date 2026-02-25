module.exports = {
  name: "snipe",
  description: "Snipe the last message",
  run: async (client, message, args) => {
    if (!client.snipes) client.snipes = new Map();

const msg = client.snipes.get(message.channel.id);
if (!msg) return message.edit("Aucun message enregistré.");

let embedInfo = msg.isEmbed ? "" : "";

message.edit(`☆__**RD-Snipe**__☆
> Auteur: ${msg.author}
> Message: ${msg.content}${embedInfo}
> Image: ${msg.image || "Aucune"}
> Date: <t:${parseInt(msg.date / 1000, 10)}:R>`);

  },
};
