const insults = [
  "Espèce de tête de lard !",
  "T'es aussi utile qu'une boussole dans une forêt de bonbons.",
  "Va donc jouer au trafic avec un escargot.",
  "Ton cerveau est aussi petit qu'une cacahuète !",
  "T'as l'air d'avoir été élevé par des poneys sauvages.",
  "T'es tellement bête que tu crois que les poupées Barbie sont des modèles de femme idéale.",
  "T'as dû passer ton enfance à jouer avec des cailloux.",
  "Tu ressembles à un sandwich sans pain.",
  "Tu es si lent que tu prends 3 heures pour faire un tour de piste.",
  "Tu es si laid que les miroirs se cassent.",
  "Tu es si moche que tu fais fuir les papillons.",
  "Tu es si idiot que tu as cru que le fromage venait des vaches."
];

module.exports = {
  name: "insulte",
  description: "Génère une insulte aléatoire.",
  run: async (client, message, args) => {
    const randomInsult = insults[Math.floor(Math.random() * insults.length)];
    message.channel.send(randomInsult);
  }
};