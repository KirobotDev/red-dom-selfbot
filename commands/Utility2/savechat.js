const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'savechat',
  description: 'Enregistre un certain nombre de messages dans un fichier .txt',
  usage: '<nombre_de_messages>',
  run: async (client, message, args) => {
    // Vérifier si un nombre de messages a été fourni
    const messageCount = parseInt(args[0], 10);

    if (isNaN(messageCount) || messageCount <= 0 || messageCount > 1000) {
      return message.channel.send('Veuillez fournir un nombre valide de messages à enregistrer (entre 1 et 1000).');
    }

    // Récupérer les messages
    let messages = await message.channel.messages.fetch({ limit: Math.min(messageCount, 100) });
    let lastMessageID = messages.last().id;

    while (messages.size < messageCount) {
      const additionalMessages = await message.channel.messages.fetch({ limit: Math.min(messageCount - messages.size, 100), before: lastMessageID });
      messages = messages.concat(additionalMessages);
      lastMessageID = additionalMessages.last().id;
      if (additionalMessages.size < 100) break;
    }

    // Trier les messages par date de création (du plus ancien au plus récent)
    const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    // Construire le contenu du fichier
    let content = `Chat log for #${message.channel.name} (${message.channel.id})\n`;
    content += `Saved on: ${new Date().toLocaleString()}\n\n`;

    sortedMessages.forEach(msg => {
      content += `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;
    });

    // Définir le chemin du fichier
    const filePath = path.join(__dirname, `chat-${message.channel.id}-${Date.now()}.txt`);

    // Écrire le fichier
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error('Erreur lors de la sauvegarde du chat:', err);
        return message.channel.send('Une erreur est survenue lors de la sauvegarde du chat.');
      }

      // Envoyer le fichier dans le canal
      message.channel.send({ content: 'Chat enregistré avec succès !', files: [filePath] })
        .then(() => {
          // Supprimer le fichier après l'envoi
          fs.unlinkSync(filePath);
        })
        .catch((err) => {
          console.error('Erreur lors de l\'envoi du fichier:', err);
          message.channel.send('Une erreur est survenue lors de l\'envoi du fichier.');
        });
    });
  }
};
