module.exports = {
  name: "allnotes",
  description: "Affiche les utilisateurs auxquels vous avez ajouté des notes.",
  run: async (client, message, args) => {
    await message.delete();

    const noteLines = [];

    try {
      if (!client.notes || !client.notes.cache) {
        return message.channel.send("Le système de notes n'est pas disponible.");
      }

      for (const [userId, noteContent] of client.notes.cache) {
        if (noteContent && noteContent.trim() !== "") {
          try {
            const user = await client.users.fetch(userId);
            noteLines.push(`<@${userId}> : ${noteContent}`);
          } catch (error) {
            noteLines.push(`<@${userId}> : ${noteContent}`);
          }
        }
      }

    } catch (error) {
      console.error("Erreur lors de la récupération des notes:", error);
      return message.channel.send("Erreur lors de la récupération des notes.");
    }

    if (noteLines.length === 0) {
      return message.channel.send("Aucune note n'a été trouvée dans votre cache.");
    }

    const header = "**Vos notes :**\n\n";
    const maxLength = 2000;
    let chunk = header;

    noteLines.sort();

    for (const line of noteLines) {
      if (chunk.length + line.length + 2 > maxLength) {
        await message.channel.send(chunk);
        chunk = "**Suite de vos notes :**\n\n";
      }
      chunk += `${line}\n`;
    }

    if (chunk.length > 0) {
      await message.channel.send(chunk);
    }
  }
};