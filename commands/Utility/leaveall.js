const fs = require("fs");
const path = require("path");

module.exports = {
  name: "leaveall",
  description: "Quitte tous les serveurs où le bot est présent, avec confirmation",
  run: async (client, message, args) => {
    const dbPath = path.join(__dirname, "confirmation2.json");

    try {
      let db = {};
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, "utf8");
        db = JSON.parse(fileContent);
      }

      const userId = message.author.id;
      if (!db[userId]) {
        db[userId] = { confirmation: 0 };
      }

      if (db[userId].confirmation === 0) {
        message.channel.send("Êtes-vous sûr de vouloir quitter tous les serveurs ? Refaites la commande pour confirmer.");
        db[userId].confirmation = 1;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        return;
      } else if (db[userId].confirmation === 1) {
        const guilds = client.guilds.cache;

        if (!guilds || guilds.size === 0) {
          message.channel.send("Le bot n'est présent sur aucun serveur à quitter.");
          db[userId].confirmation = 0;
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
          return;
        }

        message.channel.send(`Début du départ de ${guilds.size} serveurs.`);

        for (const [id, guild] of guilds) {
          try {
            await guild.leave();
          } catch (error) {
            console.error(`Erreur lors de la tentative de quitter ${guild.name} : ${error.message}`);
          }
        }

        message.channel.send("Tous les serveurs accessibles ont été quittés avec succès.");
        db[userId].confirmation = 0;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      }
    } catch (error) {
      console.error("Erreur dans la commande leaveall :", error.message);
      message.channel.send("Une erreur s'est produite lors de la tentative de quitter les serveurs.");
    }
  },
};
