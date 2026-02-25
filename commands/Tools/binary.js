module.exports = {
    name: "binary",
	aliases: ["binaire"],
    description: "🔤 Encode/Décode en binaire",
    run: async (client, message, args, db) => {
        try {
            await message.delete().catch(() => {});

            if (args.length < 2) {
                return message.channel.send(`**Usage:**\n\`${db.prefix}binary encode <texte>\` - Encoder en binaire\n\`${db.prefix}binary decode <binaire>\` - Décoder depuis le binaire`);
            }

            const action = args[0].toLowerCase();
            const input = args.slice(1).join(' ');

            switch (action) {
                case 'encode':
                case 'enc':
                case 'e':
                    try {
                        const encoded = input.split("").map(char => char.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
                        const response = `**ENCODAGE BINAIRE**\n\n` +
                                        `**Texte original:**\n\`\`\`${input}\`\`\`\n` +
                                        `**Texte encodé:**\n\`\`\`${encoded}\`\`\`\n`;
                        
                        if (response.length > 2000) {
                            const part1 = `**ENCODAGE BINAIRE**\n\n**Texte original:**\n\`\`\`${input.substring(0, 1000)}...\`\`\`\n**Texte encodé:**\n\`\`\`${encoded.substring(0, 1000)}...\`\`\``;
                            await message.channel.send(part1);
                        } else {
                            await message.channel.send(response);
                        }
                    } catch (error) {
                        await message.channel.send('**Erreur lors de l\'encodage**');
                    }
                    break;

                case 'decode':
                case 'dec':
                case 'd':
                    try {
                        const binaryArray = input.split(" ");
                        if (!binaryArray.every(b => /^[01]{8}$/.test(b))) {
                            return message.channel.send('**Format binaire invalide** (doit être des octets de 8 bits séparés par des espaces)');
                        }

                        const decoded = binaryArray.map(b => String.fromCharCode(parseInt(b, 2))).join("");
                        if (!decoded.trim()) {
                            return message.channel.send('**Le texte décodé est vide**');
                        }

                        const response = `**DÉCODAGE BINAIRE**\n\n` +
                                        `**Texte encodé:**\n\`\`\`${input}\`\`\`\n` +
                                        `**Texte décodé:**\n\`\`\`${decoded}\`\`\`\n`;

                        if (response.length > 2000) {
                            const part1 = `**DÉCODAGE BINAIRE**\n\n**Texte encodé:**\n\`\`\`${input.substring(0, 1000)}...\`\`\`\n**Texte décodé:**\n\`\`\`${decoded.substring(0, 1000)}...\`\`\``;
                            await message.channel.send(part1);
                        } else {
                            await message.channel.send(response);
                        }
                    } catch (error) {
                        await message.channel.send('**Erreur lors du décodage - Format binaire invalide**');
                    }
                    break;

                case 'help':
                case 'h':
                    const helpMessage = `**AIDE COMMANDE BINAIRE**\n\n` +
                                      `**Syntaxe:**\n\`${db.prefix}binary <action> <texte>\`\n\n` +
                                      `**Actions disponibles:**\n` +
                                      `• \`encode\`, \`enc\`, \`e\` - Encoder du texte en binaire\n` +
                                      `• \`decode\`, \`dec\`, \`d\` - Décoder du binaire en texte\n` +
                                      `• \`help\`, \`h\` - Afficher cette aide\n\n` +
                                      `**Exemples:**\n` +
                                      `\`${db.prefix}binary encode Hello\`\n` +
                                      `\`${db.prefix}binary decode 01001000 01100101 01101100 01101100 01101111\``;
                    await message.channel.send(helpMessage);
                    break;

                default:
                    await message.channel.send(`**Action non reconnue**\nUtilise \`${db.prefix}binary help\` pour voir les actions disponibles.`);
            }

        } catch (error) {
            await message.channel.send('**Une erreur est survenue**').catch(() => {});
        }
    }
};
