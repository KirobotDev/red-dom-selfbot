module.exports = {
  name: "delete",
  description: "Supprime un nombre de messages avec ou sans filtre de texte.",
  run: async (client, message, args) => {
      try {
          // Supprimer le message de commande
          await message.delete()

          // Vérifier si le dernier argument est un nombre (nombre de messages à supprimer)
          const deleteAmount = parseInt(args[args.length - 1]);
          if (isNaN(deleteAmount) || deleteAmount < 1 || deleteAmount > 100) {
              return message.channel.send("Veuillez spécifier un nombre valide de messages à supprimer (entre 1 et 100).");
          }

          // Filtre de texte, basé sur tous les arguments sauf le dernier
          const filterText = args.slice(0, -1).join(" ");  // On prend tout sauf le dernier argument

          let i = 0;  // Compteur de suppression

          const fetchAndDelete = async (lastMessageId = null) => {
              // Récupérer jusqu'à 100 messages à la fois
              const options = { limit: 100 };
              if (lastMessageId) {
                  options.before = lastMessageId;
              }

              const messages = await message.channel.messages.fetch(options);

              // Si aucun message n'est trouvé, on arrête
              if (messages.size === 0) {
                  return;
              }

              // Parcourir les messages récupérés
              for (const singleMessage of messages.values()) {
                  if (i >= deleteAmount) break;  // Arrêter si le nombre de suppressions est atteint

                  // Supprimer seulement les messages qui contiennent le texte (si un filtre est appliqué)
                  if (!filterText || singleMessage.content.includes(filterText)) {
                      await singleMessage.delete().catch(() => {});  // Supprimer le message
                      i++;  // Incrémenter le compteur
                  }
              }

              // Continuer à supprimer tant que la limite n'est pas atteinte
              if (i < deleteAmount) {
                  await fetchAndDelete(messages.last().id);  // Appel récursif pour continuer à supprimer
              }
          };

          // Lancer le processus de suppression
          await fetchAndDelete();

      } catch (error) {
          console.log("Erreur lors de la suppression des messages : ", error);
          return message.channel.send("Une erreur s'est produite lors de la suppression des messages.");
      }
  }
};
