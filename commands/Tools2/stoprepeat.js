const { activeCollectors, initializeDatabase, saveDatabase } = require('./repeat');

module.exports = {
  name: 'stoprepeat',
  description: 'Arrête la répétition dans ce salon.',
  run: async (client, message) => {
    const dbb = initializeDatabase();

    if (!activeCollectors[message.channel.id]) {
      return message.channel.send('Aucune répétition n’est active dans ce salon.');
    }

    try {
      activeCollectors[message.channel.id].stop();
      delete activeCollectors[message.channel.id];
    } catch (error) {
      console.error('Erreur lors de l’arrêt du collecteur :', error);
      return message.channel.send('Une erreur est survenue en arrêtant la répétition.');
    }

    delete dbb.repeatMessages[message.channel.id];
    delete dbb.activeCollectors[message.channel.id];
    saveDatabase(dbb);

    message.channel.send('La répétition a été arrêtée dans ce salon.');
  },
};
