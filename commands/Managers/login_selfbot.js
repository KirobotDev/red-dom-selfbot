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
                    content: `❌ ${verification.reason}`
                });
            }

            const selfId = verification.tokenId;

            index.users[selfId] = { token };
            index.config.user[selfId] = { token };
            
            const selfbotClient = await index.initializeSingleClient(selfId, { token });
            
            if (selfbotClient) {
                await index.saveConfig();
                await interaction.editReply({
                    content: `✅ Connexion réussie pour le compte **${verification.userData.username}** (${selfId}) !`
                });
            } else {
                await interaction.editReply({
                    content: `❌ Échec de la connexion. Vérifiez si ce compte est déjà connecté.`
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
