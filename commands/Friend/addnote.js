module.exports = {
  name: "addnote",
  descriptionfr: "Ajoute une note à quelqu'un",
  descriptionen: "Add a note to someone",
  usage: "<ID_utilisateur> <note>",
  run: async (client, message, args) => {
    await message.delete().catch(() => false);

    const sendTempMessage = async (content) => {
      const msg = await message.channel.send(content);
      return msg;
    };

    if (args.length < 2) {
      return sendTempMessage("Utilisation: `addnote <ID_utilisateur> <note>`\nExemple: `addnote 123456789012345678 Ma note`");
    }

    try {
      const userId = args[0].replace(/[<@!>]/g, '');
      
      if (!/^\d{17,20}$/.test(userId)) {
        return sendTempMessage("ID utilisateur invalide. Un ID Discord doit contenir 17 à 20 chiffres.");
      }

      const noteContent = args.slice(1).join(" ").trim();
      
      if (!noteContent) {
        return sendTempMessage("La note ne peut pas être vide.");
      }

      if (noteContent.length > 1000) {
        return sendTempMessage("La note est trop longue (max 1000 caractères).");
      }

      if (!client.notes || typeof client.notes.updateNote !== 'function') {
        return sendTempMessage("Le système de notes n'est pas disponible.");
      }

      await client.notes.updateNote(userId, noteContent);
      
      return sendTempMessage(`Note ajoutée pour l'ID **${userId}**\nContenu: "${noteContent.substring(0, 80)}${noteContent.length > 80 ? '...' : ''}"`);

    } catch (error) {
      console.error("Erreur addnote:", error);
      return sendTempMessage("Erreur lors de l'ajout de la note.");
    }
  }
};