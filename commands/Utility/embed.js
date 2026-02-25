const WebEmbed = require('safeness-sb-new/src/structures/WebEmbed');

module.exports = {
    name: 'embed',
    description: 'Commande pour créer un embed personnalisé.',
    run: async (client, message, args) => {
       
        message.delete().catch(console.error);

        if (!args[0]) {
            return message.channel.send('Il faut préciser un message pour l\'embed :/');
        }
 
        function toBoldText(text) {
            const boldMap = { 
                'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣',
                'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭',
                'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
                'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉',
                'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓',
                'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
                '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗',
                'à': '𝐚', 'á': '𝐚', 'â': '𝐚', 'ã': '𝐚', 'ä': '𝐚', 'å': '𝐚',
                'è': '𝐞', 'é': '𝐞', 'ê': '𝐞', 'ë': '𝐞',
                'ì': '𝐢', 'í': '𝐢', 'î': '𝐢', 'ï': '𝐢',
                'ò': '𝐨', 'ó': '𝐨', 'ô': '𝐨', 'õ': '𝐨', 'ö': '𝐨',
                'ù': '𝐮', 'ú': '𝐮', 'û': '𝐮', 'ü': '𝐮',
                'ñ': '𝐧', 'ç': '𝐜',
                'À': '𝐀', 'Á': '𝐀', 'Â': '𝐀', 'Ã': '𝐀', 'Ä': '𝐀', 'Å': '𝐀',
                'È': '𝐄', 'É': '𝐄', 'Ê': '𝐄', 'Ë': '𝐄',
                'Ì': '𝐈', 'Í': '𝐈', 'Î': '𝐈', 'Ï': '𝐈',
                'Ò': '𝐎', 'Ó': '𝐎', 'Ô': '𝐎', 'Õ': '𝐎', 'Ö': '𝐎',
                'Ù': '𝐔', 'Ú': '𝐔', 'Û': '𝐔', 'Ü': '𝐔',
                'Ñ': '𝐍', 'Ç': '𝐂'
            };
            
            return text.split('').map(char => boldMap[char] || char).join('');
        }

        const originalText = args.join(' ');
        const boldText = toBoldText(originalText); 

        const embed = new WebEmbed()
            .setDescription(`${boldText}`);

        const finalUrl = embed.toString();

        message.channel.send({ content: finalUrl });
    },
};