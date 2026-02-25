module.exports = {
  name: "delnote",
  descriptionfr: "Supprime une note d'un utilisateur",
  descriptionen: "Delete a note from someone",
  usage: "<ID_utilisateur>",
  run: async (client, message, args) => {
    await message.delete().catch(() => false);

    const sendTempMessage = async (content) => {
      const msg = await message.channel.send(content);
      return msg;
    };

    if (!args[0]) {
      return sendTempMessage("Utilisation: `delnote <ID_utilisateur>`");
    }

    try {
      const userId = args[0].replace(/[<@!>]/g, '');
      
      if (!client.notes?.cache?.has(userId)) {
        return sendTempMessage(`Aucune note trouvée pour l'ID ${userId}.`);
      }

      const noteContent = client.notes.cache.get(userId);
      
      await client.notes.updateNote(userId, null);
      
      return sendTempMessage(`Note pour l'ID **${userId}** supprimée.`);

    } catch (error) {
      console.error("Erreur delnote:", error);
      return sendTempMessage("Erreur lors de la suppression.");
    }
  }
};