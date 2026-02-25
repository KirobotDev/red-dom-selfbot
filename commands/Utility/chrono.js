let activeTimeout = null;
let initialMessage = null;

module.exports = {
  name: "chrono",
  
  run: async (client, message, args) => {
    if (args[0] === "reset") {
      if (activeTimeout) {
        clearTimeout(activeTimeout);
        activeTimeout = null;
        if (initialMessage) {
          await initialMessage.edit("⏹️ Chronomètre arrêté.");
          initialMessage = null;
        }
        return message.edit("Chronomètre réinitialisé.");
      } else {
        return message.edit("Aucun chronomètre en cours.");
      }
    }

    if (!args[0]) {
      return message.edit("Vous devez spécifier un temps en secondes, minutes ou heures (ex: 10s, 5m, 1h).");
    }

    const timeInput = args[0];
    let timeInMs;

    if (timeInput.endsWith('s')) {
      timeInMs = parseInt(timeInput.slice(0, -1)) * 1000;
    } else if (timeInput.endsWith('m')) {
      timeInMs = parseInt(timeInput.slice(0, -1)) * 60000;
    } else if (timeInput.endsWith('h')) {
      timeInMs = parseInt(timeInput.slice(0, -1)) * 3600000;
    } else {
      return message.edit("Format invalide. Utilisez 's' pour les secondes, 'm' pour les minutes, ou 'h' pour les heures.");
    }

    if (isNaN(timeInMs) || timeInMs <= 0) {
      return message.edit("Temps invalide. Veuillez entrer un temps valide.");
    }

    if (activeTimeout) {
      clearTimeout(activeTimeout);
      if (initialMessage) {
        await initialMessage.edit("⏹️ Chronomètre arrêté.");
      }
    }
 
    initialMessage = await message.edit(`⏳ Chrono lancé - Calcul...`);
     
    const endTime = Date.now() + timeInMs + 5000;
    const timestamp = `<t:${Math.floor(endTime / 1000)}:T>`;
     
    await initialMessage.edit(`⏳ Chrono lancé - Fin à : ${timestamp}`);

    activeTimeout = setTimeout(async () => {
      try {
        await message.channel.send(`⏰ Chrono fini !`);
        await initialMessage.edit(`Chrono terminé`);
        activeTimeout = null;
        initialMessage = null;
      } catch (error) {
        console.error("Erreur lors de la gestion du chrono :", error);
      }
    }, timeInMs);
  }
};