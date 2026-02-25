module.exports = {
    name: "password",
    description: "🔐 Générateur de mots de passe sécurisés",
    run: async (client, message, args, db) => {
        try {
            await message.delete().catch(() => {});

            const lowercase = 'abcdefghijklmnopqrstuvwxyz';
            const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const numbers = '0123456789';
            const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const similarChars = 'il1Lo0O';
            const ambiguousChars = '{}[]()/\'"`~,;:.<>';

            function generatePassword(length = 16, options = {}) {
                const {
                    useLowercase = true,
                    useUppercase = true,
                    useNumbers = true,
                    useSymbols = true,
                    avoidSimilar = true,
                    avoidAmbiguous = true
                } = options;

                let charset = '';
                let password = '';

                if (useLowercase) charset += lowercase;
                if (useUppercase) charset += uppercase;
                if (useNumbers) charset += numbers;
                if (useSymbols) charset += symbols;

                if (avoidSimilar) {
                    charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
                }

                if (avoidAmbiguous) {
                    charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('');
                }

                const mustInclude = [];
                if (useLowercase) mustInclude.push(lowercase);
                if (useUppercase) mustInclude.push(uppercase);
                if (useNumbers) mustInclude.push(numbers);
                if (useSymbols) mustInclude.push(symbols);

                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * charset.length);
                    password += charset[randomIndex];
                }

                mustInclude.forEach(type => {
                    let hasType = false;
                    for (let char of password) {
                        if (type.includes(char)) {
                            hasType = true;
                            break;
                        }
                    }
                    if (!hasType) {
                        const randomIndex = Math.floor(Math.random() * password.length);
                        const randomChar = type[Math.floor(Math.random() * type.length)];
                        password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
                    }
                });

                return password;
            }

            function calculateStrength(password) {
                let score = 0;
                const length = password.length;

                if (length >= 4) score += 1;
                if (length >= 8) score += 2;
                if (length >= 12) score += 3;
                if (length >= 16) score += 4;
                if (length >= 20) score += 5;

                const hasLower = /[a-z]/.test(password);
                const hasUpper = /[A-Z]/.test(password);
                const hasNumbers = /[0-9]/.test(password);
                const hasSymbols = /[^a-zA-Z0-9]/.test(password);

                if (hasLower) score += 1;
                if (hasUpper) score += 1;
                if (hasNumbers) score += 1;
                if (hasSymbols) score += 2;

                const charTypes = [hasLower, hasUpper, hasNumbers, hasSymbols].filter(Boolean).length;
                if (charTypes >= 2) score += 1;
                if (charTypes >= 3) score += 2;
                if (charTypes >= 4) score += 3;

                if (length < 8) score -= 3;
                if (/(.)\1{2,}/.test(password)) score -= 2;
                if (/^(.)\1+$/.test(password)) score -= 5;
                
                if (/^[a-zA-Z]+$/.test(password)) score -= 2;
                if (/^[0-9]+$/.test(password)) score -= 3;
                if (/^[^a-zA-Z0-9]+$/.test(password)) score -= 2;
                
                if (/(0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)/i.test(password)) {
                    score -= 3;
                }

                if (score <= 3) return { level: "🔴 TRÈS FAIBLE", color: 0xff0000 };
                if (score <= 6) return { level: "🟠 FAIBLE", color: 0xff6600 };
                if (score <= 10) return { level: "🟡 MOYEN", color: 0xffcc00 };
                if (score <= 14) return { level: "🔵 FORT", color: 0x0099ff };
                return { level: "🟢 TRÈS FORT", color: 0x00ff00 };
            }

            if (!args[0] || args[0] === 'help' || args[0] === 'h') {
                const helpMessage = `**🔐 GÉNÉRATEUR DE MOTS DE PASSE**\n\n` +
                                  `**Usage:** \`${db.prefix}password [longueur] [options]\`\n\n` +
                                  `**Options:**\n` +
                                  `• \`--no-lower\` - Exclure les minuscules\n` +
                                  `• \`--no-upper\` - Exclure les majuscules\n` +
                                  `• \`--no-numbers\` - Exclure les chiffres\n` +
                                  `• \`--no-symbols\` - Exclure les symboles\n` +
                                  `• \`--similar\` - Inclure les caractères similaires\n` +
                                  `• \`--ambiguous\` - Inclure les caractères ambigus\n` +
                                  `• \`multiple\` ou \`m\` - Générer plusieurs mots de passe\n\n` +
                                  `**Exemples:**\n` +
                                  `\`${db.prefix}password\` - Génère un mot de passe de 16 caractères\n` +
                                  `\`${db.prefix}password 20\` - Génère un mot de passe de 20 caractères\n` +
                                  `\`${db.prefix}password 12 --no-symbols\` - Sans symboles\n` +
                                  `\`${db.prefix}password multiple 5\` - 5 mots de passe\n` +
                                  `\`${db.prefix}password 8 --no-lower --no-upper\` - Chiffres et symboles seulement`;
                
                return message.channel.send(helpMessage);
            }

            let length = 16;
            let count = 1;
            const options = {
                useLowercase: true,
                useUppercase: true,
                useNumbers: true,
                useSymbols: true,
                avoidSimilar: true,
                avoidAmbiguous: true
            };

            for (let i = 0; i < args.length; i++) {
                const arg = args[i].toLowerCase();
                
                if (!isNaN(arg) && parseInt(arg) > 0) {
                    if (args[i-1] === 'multiple' || args[i-1] === 'm') {
                        count = Math.min(parseInt(arg), 10);
                    } else {
                        length = Math.min(Math.max(parseInt(arg), 4), 128);
                    }
                } else if (arg === 'multiple' || arg === 'm') {
                    count = 5;
                } else if (arg === '--no-lower') {
                    options.useLowercase = false;
                } else if (arg === '--no-upper') {
                    options.useUppercase = false;
                } else if (arg === '--no-numbers') {
                    options.useNumbers = false;
                } else if (arg === '--no-symbols') {
                    options.useSymbols = false;
                } else if (arg === '--similar') {
                    options.avoidSimilar = false;
                } else if (arg === '--ambiguous') {
                    options.avoidAmbiguous = false;
                }
            }

            if (!options.useLowercase && !options.useUppercase && !options.useNumbers && !options.useSymbols) {
                return message.channel.send('**Erreur:** Vous devez sélectionner au moins un type de caractère!');
            }

            const passwords = [];
            for (let i = 0; i < count; i++) {
                passwords.push(generatePassword(length, options));
            }

            const { level, color } = calculateStrength(passwords[0]);

            let resultMessage = `**🔐 MOT${count > 1 ? 'S' : ''} DE PASSE GÉNÉRÉ${count > 1 ? 'S' : ''}**\n\n`;
            
            if (count === 1) {
                resultMessage += `**Mot de passe:** \`\`\`${passwords[0]}\`\`\`\n`;
                resultMessage += `**Longueur:** ${length} caractères\n`;
                resultMessage += `**Force:** ${level}\n\n`;
            } else {
                resultMessage += `**${count} mots de passe générés:**\n\`\`\``;
                passwords.forEach((pwd, index) => {
                    resultMessage += `${index + 1}. ${pwd}\n`;
                });
                resultMessage += `\`\`\`\n**Longueur:** ${length} caractères par mot de passe\n\n`;
            }

            resultMessage += `💡 *Utilise \`${db.prefix}password help\` pour plus d'options*`;

            await message.channel.send(resultMessage);

        } catch (error) {
            await message.channel.send('**Une erreur est survenue lors de la génération**').catch(() => {});
        }
    }
};