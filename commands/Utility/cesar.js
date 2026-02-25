module.exports = {
  name: "cesar",
  descriptionfr: "Chiffrement César avec un décalage donné",
  usage: "&cesar <décalage> <message>",
  run: async (client, message, args) => {
    // Supprime le message original
    message.delete().catch(() => false);

    // Si le nombre d'arguments est inférieur à 2, on donne un message d'erreur
    if (args.length < 2) {
      return message.channel.send("Usage incorrect. Exemple: `&cesar 1 abc`");
    }

    // Récupère le décalage et le message
    const shift = parseInt(args[0], 10); // Le décalage
    const text = args.slice(1).join(" "); // Le message

    // Fonction pour appliquer le chiffrement César
    const cesarCipher = (str, shift) => {
      let result = '';

      for (let i = 0; i < str.length; i++) {
        let char = str[i];

        // Applique le chiffrement uniquement pour les lettres alphabétiques
        if (char.match(/[a-z]/i)) {
          let code = str.charCodeAt(i);

          // Si la lettre est en minuscule
          if (char >= 'a' && char <= 'z') {
            char = String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
          }
          // Si la lettre est en majuscule
          else if (char >= 'A' && char <= 'Z') {
            char = String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
          }
        }

        result += char;
      }

      return result;
    };

    // Applique le chiffrement ou déchiffrement en fonction du décalage
    const encryptedMessage = cesarCipher(text, shift);

    // Envoie le message chiffré
    message.channel.send(`Message original: ${text}\nMessage chiffré: ${encryptedMessage}`);
  }
};
