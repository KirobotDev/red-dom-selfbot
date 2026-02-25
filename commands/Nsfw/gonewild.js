const fs = require('fs')
const superagent = require('superagent');


module.exports = {
  name: "gonewild",
  descriptionfr: "Envoie une image d'anal",
  descriptionen: "Send an anal picture",
  nsfw: true,
  run: async (client, message, args) => {
    if (message.guild && message.guild.id === '1274437651759632484') {
      return message.edit("pas ici mchef");
    }
    const { body } = await superagent.get(`https://nekobot.xyz/api/image?type=gonewild`)
    message.edit(body.message)
  }
}