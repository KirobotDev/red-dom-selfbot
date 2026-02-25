const figlet = require('figlet');

module.exports = {
    name: "art",
    description: "Transforme ton texte en ASCII art avec wrapping automatique",
    run: async (client, message, args) => {

        await message.delete();

        if (!args[0]) return message.channel.send("Veuillez entrer un texte !");

        const text = args.join(" ");
        const maxWidth = 50;

        const letters = text.split('');

        function asciiLetter(letter) {
            const ascii = figlet.textSync(letter, { font: 'Standard' }).split('\n');
            const maxLen = Math.max(...ascii.map(l => l.length));
            return ascii.map(l => l.padEnd(maxLen, ' ')); 
        }

        let finalLines = [];
        let currentLines = Array(6).fill('');

        for (let letter of letters) {
            const ascii = asciiLetter(letter);

            if (currentLines[0].length + ascii[0].length > maxWidth) {
                finalLines.push(...currentLines);
                currentLines = Array(6).fill('');
            }

            for (let i = 0; i < currentLines.length; i++) {
                currentLines[i] += ascii[i];
            }
        }

        finalLines.push(...currentLines);

        const output = finalLines.join('\n');
        if (output.length > 2000) return message.channel.send("Le rendu est trop long pour Discord !");

        message.channel.send("```" + output + "```");
    }
};
