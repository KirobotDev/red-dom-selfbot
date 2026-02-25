const superagent = require('superagent');

module.exports = {
  name: "pussy",
  descriptionfr: "bref",
  descriptionen: "bref",
  nsfw: true,
  run: async (client, message, args) => {
    if (message.guild && message.guild.id === '1274437651759632484') {
      return message.edit("pas ici mchef");
    }
    try {
      const { body } = await superagent.get('https://nekobot.xyz/api/image?type=pussy');
      message.edit(body.message);
    } catch (error) { 
      message.edit('Il y a eu une erreur en récupérant l\'image.');
    }
  }
}
