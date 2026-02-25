module.exports = {
    name: "base64",
    description: "🔤 Encode/Décode en Base64",
    run: async (client, message, args, db) => {
        try {
            await message.delete().catch(() => {});

            if (args.length < 2) {
                return message.channel.send(`**Usage:**\n\`${db.prefix}base64 encode <texte>\` - Encoder en Base64\n\`${db.prefix}base64 decode <base64>\` - Décoder depuis Base64`);
            }

            const action = args[0].toLowerCase();
            const input = args.slice(1).join(' ');

            switch (action) {
                case 'encode':
                case 'enc':
                case 'e':
                    try {
                        const encoded = Buffer.from(input).toString('base64');
                        const response = `**ENCODAGE BASE64**\n\n` +
                                        `**Texte original:**\n\`\`\`${input}\`\`\`\n` +
                                        `**Texte encodé:**\n\`\`\`${encoded}\`\`\`\n`
                        
                        if (response.length > 2000) {
                            const part1 = `**ENCODAGE BASE64**\n\n**Texte original:**\n\`\`\`${input.substring(0, 1000)}...\`\`\`\n**Texte encodé:**\n\`\`\`${encoded}\`\`\``;
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
                        
                        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(input)) {
                            return message.channel.send('**Format Base64 invalide**');
                        }

                        const decoded = Buffer.from(input, 'base64').toString('utf8');
                        
                        if (!decoded.trim()) {
                            return message.channel.send('**Le texte décodé est vide**');
                        }

                        const response = `**DÉCODAGE BASE64**\n\n` +
                                        `**Texte encodé:**\n\`\`\`${input}\`\`\`\n` +
                                        `**Texte décodé:**\n\`\`\`${decoded}\`\`\`\n`
                        
                        if (response.length > 2000) {
                            const part1 = `**DÉCODAGE BASE64**\n\n**Texte encodé:**\n\`\`\`${input}\`\`\`\n**Texte décodé:**\n\`\`\`${decoded.substring(0, 1000)}...\`\`\``;
                            await message.channel.send(part1);
                        } else {
                            await message.channel.send(response);
                        }
                    } catch (error) {
                        await message.channel.send('**Erreur lors du décodage - Format Base64 invalide**');
                    }
                    break;

                case 'help':
                case 'h':
                    const helpMessage = `**AIDE COMMANDE BASE64**\n\n` +
                                      `**Syntaxe:**\n\`${db.prefix}base64 <action> <texte>\`\n\n` +
                                      `**Actions disponibles:**\n` +
                                      `• \`encode\`, \`enc\`, \`e\` - Encoder du texte en Base64\n` +
                                      `• \`decode\`, \`dec\`, \`d\` - Décoder du Base64 en texte\n` +
                                      `• \`help\`, \`h\` - Afficher cette aide\n\n` +
                                      `**Exemples:**\n` +
                                      `\`${db.prefix}base64 encode Hello World\`\n` +
                                      `\`${db.prefix}base64 decode SGVsbG8gV29ybGQ=\`\n` +
                                      `\`${db.prefix}base64 e Je t'aime\`\n` +
                                      `\`${db.prefix}base64 d SmUgdCdh\``;
                    await message.channel.send(helpMessage);
                    break;

                default:
                    await message.channel.send(`**Action non reconnue**\nUtilise \`${db.prefix}base64 help\` pour voir les actions disponibles.`);
            }

        } catch (error) {
            await message.channel.send('**Une erreur est survenue**').catch(() => {});
        }
    }
};