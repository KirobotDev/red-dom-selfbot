const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'login_selfbot',
    description: 'Connecte votre compte au selfbot avec votre token',
    slash: true,
    options: [
        {
            name: 'token',
            description: 'Votre token Discord',
            type: 'string',
            required: true
        }
    ],
    runSlash: async (client, interaction, index) => {
        const token = interaction.options.getString('token');
        const userId = interaction.user.id;

        try {
            await interaction.deferReply({ ephemeral: true });

            const verification = await index.verifyTokenBeforeConnect(userId, token);
            
            if (!verification.valid) {
                return await interaction.editReply({
                    content: `Token invalide pour votre compte : ${verification.reason}`
                });
            }

            index.users[userId] = { token };
            index.config.user[userId] = { token };
            
            const selfbotClient = await index.initializeSingleClient(userId, { token });
            
            if (selfbotClient) {
                await interaction.editReply({
                    content: `Connexion réussie ! Votre selfbot est maintenant actif.`
                });
            } else {
                await interaction.editReply({
                    content: `Échec de la connexion. Vérifiez les logs du serveur.`
                });
            }

        } catch (error) {
            console.error('Erreur login_selfbot:', error);
            await interaction.editReply({
                content: `Une erreur est survenue lors de la connexion.`
            });
        }
    }
};
