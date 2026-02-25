module.exports = {
    name: "choose",
    description: "Choisir une option aléatoire parmi celles fournies.",
    run: async (client, message, args) => {
      if (args.length === 0) {
        return message.channel.send("Veuillez fournir au moins une option.");
      }
  
      const randomChoice = args[Math.floor(Math.random() * args.length)];
      message.channel.send(`Je choisis : **${randomChoice}**`);
    }
  };
  