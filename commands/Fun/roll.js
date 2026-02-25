module.exports = {
    name: "roll",
    description: "Lancer un dé avec le nombre de faces spécifié.",
    run: async (client, message, args) => {
      // Vérifiez si un argument a été fourni
      if (args.length === 0) {
        return message.channel.send("🎲 Vous n'avez pas spécifié le nombre de faces.");
      }
  
      const sides = parseInt(args[0]);
      
      // Vérifiez si le nombre est valide
      if (isNaN(sides) || sides <= 0) {
        return message.channel.send("❌ Le nombre de faces doit être un entier positif.");
      }
  
      // Lancer le dé
      const rollResult = Math.floor(Math.random() * sides) + 1;
      message.channel.send(`🎲 Vous avez lancé un dé à ${sides} faces et obtenu : **${rollResult}**`);
    }
  };
  