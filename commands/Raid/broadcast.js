module.exports = {
  name: "broadcast",
  description: "Envoie un message partout où le selfbot peut écrire, sans erreurs",
  run: async (client, message, args) => {
    if (!args.length) return message.edit("Veuillez fournir un message à envoyer.");
      
	if (!message.guild) {
      return message.edit("Cette commande ne peut être utilisée qu'en serveur (pas en DM).");
    }

    const broadcastMessage = args.join(" ");
    const guild = message.guild;

    await message.edit("Lancement du broadcast...");

    let successCount = 0;

    for (const [id, channel] of guild.channels.cache) {
      try {
        await channel.send(broadcastMessage);
        successCount++;
        await new Promise(r => setTimeout(r, 150));
      } catch {
        continue;
      }
    }

    await message.edit(`Broadcast terminé. ${successCount} messages envoyés.`);
  },
};
