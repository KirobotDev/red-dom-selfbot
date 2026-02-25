const fs = require('fs');
const superagent = require('superagent');

module.exports = {
  name: "4k",
  descriptionfr: "Envoie une image en 4K",
  descriptionen: "Send a 4K Picture",
  nsfw: true,
  run: async (client, message, args) => { 
    if (message.guild && message.guild.id === '1274437651759632484') {
      return message.edit("pas ici mchef");
    }
    
    const { body } = await superagent.get(`https://nekobot.xyz/api/image?type=4k`);
    message.edit(body.message);
  }
};