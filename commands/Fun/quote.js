const fs = require('fs');
const path = require('path');

// Spécifiez le chemin relatif correct vers le fichier quotes.json
const quotesFilePath = path.join(__dirname, 'quotes.json');

// Essayez de lire le fichier JSON
let quotes;
try {
  quotes = JSON.parse(fs.readFileSync(quotesFilePath, 'utf8'));
} catch (err) {
  console.error('Erreur lors de la lecture du fichier quotes.json', err);
  quotes = []; // Définir un tableau vide si une erreur se produit
}

// Fonction pour obtenir une citation aléatoire
function getRandomQuote() {
  if (quotes.length === 0) {
    return 'Aucune citation disponible.';
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

// Exemple d'utilisation dans une commande de bot
module.exports = {
  name: 'quote',
  description: 'Affiche une citation aléatoire.',
  run: async (client, message) => {
    const quote = getRandomQuote();
    message.channel.send(quote);
  },
};
