const { language } = require("../../fonctions");

module.exports = {
  name: "calcul",
  description: "Effectuer des calculs de base (addition, soustraction, multiplication, division, carré, et résoudre des inconnues simples)",
  aliases: ["calculate"],
  run: async (client, message, args, db) => {
    try {
      if (args.length < 2) {
        return message.reply(await language(client, `**__🧮 Utilisation des commandes de calcul 🧮__**

- \`${db.prefix}calcul addition <nombre1> <nombre2>\` : Addition de deux nombres
- \`${db.prefix}calcul soustraction <nombre1> <nombre2>\` : Soustraction de deux nombres  
- \`${db.prefix}calcul multiplication <nombre1> <nombre2>\` : Multiplication de deux nombres
- \`${db.prefix}calcul division <nombre1> <nombre2>\` : Division de deux nombres
- \`${db.prefix}calcul carre <nombre>\` : Calcul du carré d'un nombre
- \`${db.prefix}calcul inconnu <équation>\` : Résolution d'équations simples avec x`
,
`**__🧮 Using Calculation Commands 🧮__**

- \`${db.prefix}calcul addition <number1> <number2>\`: Adds two numbers
- \`${db.prefix}calcul soustraction <number1> <number2>\`: Subtracts two numbers
- \`${db.prefix}calcul multiplication <number1> <number2>\`: Multiplies two numbers
- \`${db.prefix}calcul division <number1> <number2>\`: Divides two numbers
- \`${db.prefix}calcul carre <number>\`: Calculates the square of a number
- \`${db.prefix}calcul inconnu <equation>\`: Solves simple equations with x`));
      }

      const operation = args[0].toLowerCase();
      const num1 = parseFloat(args[1]);

      if (isNaN(num1) && operation !== 'inconnu') {
        return message.reply(await language(client, "Veuillez entrer un nombre valide.", "Please enter a valid number."));
      }

      let result;
      switch (operation) {
        case 'addition':
          if (args.length < 3) {
            return message.reply(await language(client, "Veuillez spécifier deux nombres pour l'addition.", "Please specify two numbers for addition."));
          }
          const num2Add = parseFloat(args[2]);
          if (isNaN(num2Add)) {
            return message.reply(await language(client, "Veuillez entrer un deuxième nombre valide pour l'addition.", "Please enter a valid second number for addition."));
          }
          result = num1 + num2Add;
          break;
        case 'soustraction':
          if (args.length < 3) {
            return message.reply(await language(client, "Veuillez spécifier deux nombres pour la soustraction.", "Please specify two numbers for subtraction."));
          }
          const num2Sub = parseFloat(args[2]);
          if (isNaN(num2Sub)) {
            return message.reply(await language(client, "Veuillez entrer un deuxième nombre valide pour la soustraction.", "Please enter a valid second number for subtraction."));
          }
          result = num1 - num2Sub;
          break;
        case 'multiplication':
          if (args.length < 3) {
            return message.reply(await language(client, "Veuillez spécifier deux nombres pour la multiplication.", "Please specify two numbers for multiplication."));
          }
          const num2Mul = parseFloat(args[2]);
          if (isNaN(num2Mul)) {
            return message.reply(await language(client, "Veuillez entrer un deuxième nombre valide pour la multiplication.", "Please enter a valid second number for multiplication."));
          }
          result = num1 * num2Mul;
          break;
        case 'division':
          if (args.length < 3) {
            return message.reply(await language(client, "Veuillez spécifier deux nombres pour la division.", "Please specify two numbers for division."));
          }
          const num2Div = parseFloat(args[2]);
          if (isNaN(num2Div)) {
            return message.reply(await language(client, "Veuillez entrer un deuxième nombre valide pour la division.", "Please enter a valid second number for division."));
          }
          if (num2Div === 0) {
            return message.reply(await language(client, "La division par zéro n'est pas autorisée.", "Division by zero is not allowed."));
          }
          result = num1 / num2Div;
          break;
        case 'carre':
          result = num1 ** 2;
          break;

        case 'inconnu':
          // Gestion des équations avec une inconnue sous forme "x + 2 = 4"
          const equation = args.slice(1).join(' ').replace(/\s+/g, '');
          const unknownMatch = equation.match(/^(.+)([=])(.+)$/);
          
          if (unknownMatch) {
            const left = unknownMatch[1].trim();
            const right = parseFloat(unknownMatch[3].trim());

            if (isNaN(right)) {
              return message.reply(await language(client, "Veuillez entrer une équation valide.", "Please enter a valid equation."));
            }

            // Résolution de l'inconnue en fonction de l'opérateur
            const variableMatch = left.match(/(x|\d+)([\+\-\*\/])(\d+)/);
            if (!variableMatch) {
              return message.reply(await language(client, "Équation non valide. Utilisez des formes comme x + 2 = 4", "Invalid equation. Use forms like x + 2 = 4."));
            }

            const [_, firstPart, operator, secondPart] = variableMatch;
            let unknownValue;

            if (firstPart === 'x') {
              const num = parseFloat(secondPart);
              switch (operator) {
                case '+':
                  unknownValue = right - num;
                  break;
                case '-':
                  unknownValue = right + num;
                  break;
                case '*':
                  unknownValue = right / num;
                  break;
                case '/':
                  unknownValue = right * num;
                  break;
              }
            } else {
              const num = parseFloat(firstPart);
              switch (operator) {
                case '+':
                  unknownValue = right - num;
                  break;
                case '-':
                  unknownValue = num - right;
                  break;
                case '*':
                  unknownValue = right / num;
                  break;
                case '/':
                  unknownValue = num / right;
                  break;
              }
            }
            return message.reply(`La valeur de x est **${unknownValue}**.`);
          } else {
            return message.reply(await language(client, "Format d'équation invalide. Essayez quelque chose comme x + 2 = 4.", "Invalid equation format. Try something like x + 2 = 4."));
          }

        default:
          return message.reply(await language(client, "Opération non reconnue. Utilisez addition, soustraction, multiplication, division, carre, ou inconnu.", "Unrecognized operation. Use addition, subtraction, multiplication, division, square, or unknown."));
      }

      message.reply(`Le résultat de ${num1} ${operation} ${args[2] ? args[2] : ''} est **${result}**.`);
    } catch (e) {
      console.error("Erreur lors du calcul", e);
      message.reply(await language(client, "Une erreur est survenue lors du calcul.", "An error occurred during the calculation."));
    }
  },
};
