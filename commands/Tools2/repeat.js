const fs = require('fs');
const path = require("path");
const dbbPath = path.join(__dirname, "./repeat_db.json");

const activeCollectors = {};

function saveDatabase(dbb) {
  try {
    fs.writeFileSync(dbbPath, JSON.stringify(dbb, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la base de données :', error);
  }
}

function initializeDatabase() {
  if (!fs.existsSync(dbbPath)) {
    return { repeatMessages: {} };
  }

  try {
    const data = JSON.parse(fs.readFileSync(dbbPath, 'utf-8'));
    if (!data.repeatMessages) data.repeatMessages = {};
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement de la base de données :', error);
    return { repeatMessages: {} };
  }
}

module.exports = {
  name: 'repeat',
  description: 'Répète un message lorsqu’un autre utilisateur écrit dans le salon.',
  run: async (client, message, args) => {
    const dbb = initializeDatabase();
    const command = args[0]?.toLowerCase();

    if (command === "stop") {
      if (activeCollectors[message.channel.id]) {
        activeCollectors[message.channel.id].stop();
        delete activeCollectors[message.channel.id];
      }
      delete dbb.repeatMessages[message.channel.id];
      saveDatabase(dbb);
      return message.channel.send('La répétition de messages a été arrêtée.');
    }

    if (args.length === 0) {
      return message.channel.send('Veuillez fournir un message à répéter.');
    }

    let targetUser = null;
    let targetChannel = message.channel.id;
    let repeatMessage = args.join(' ');

    if (message.mentions.users.size > 0) {
      targetUser = message.mentions.users.first().id; 
      args = args.slice(1);
    }

    if (args.length > 0 && client.channels.cache.has(args[0])) {
      targetChannel = args[0];
      args = args.slice(1);
    }

    repeatMessage = args.join(' ');

    dbb.repeatMessages[targetChannel] = { message: repeatMessage, targetUser };
    saveDatabase(dbb);

    await message.channel.send(
      `Le message suivant sera répété${targetUser ? ` pour l'utilisateur ayant l'ID ${targetUser}` : ''} dans <#${targetChannel}> : "${repeatMessage}". Pour l'arrêter, faites \`&repeat stop\`.`
    );

    const filter = msg =>
      !msg.author.bot &&
      msg.channel.id === targetChannel &&
      msg.author.id !== client.user.id &&
      (!targetUser || msg.author.id === targetUser);

    const collector = client.channels.cache.get(targetChannel).createMessageCollector({ filter });

    collector.on('collect', () => {
      client.channels.cache.get(targetChannel).send(repeatMessage);
    });

    collector.on('end', () => {
      delete activeCollectors[targetChannel];
    });

    activeCollectors[targetChannel] = collector;
  },
  saveDatabase,
  initializeDatabase,
  activeCollectors,
};
