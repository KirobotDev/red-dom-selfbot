const { language } = require("../../fonctions");

module.exports = {
    name: "iduser",
    description: "Affiche l'ID d'un utilisateur mentionné ou le tien si aucune mention",
    run: async (client, message, args, db, prefix) => {
        try {
            const user = message.mentions.users.first() || message.author;

            const msgFR = `L'ID de ${user.tag} est : \`${user.id}\``;
            const msgEN = `The ID of ${user.tag} is: \`${user.id}\``;

            message.edit(await language(client, msgFR, msgEN));
        } catch (e) {
            console.error("Erreur dans iduser:", e);
            message.edit("Une erreur est survenue lors de l'exécution de la commande iduser.");
        }
    }
};
