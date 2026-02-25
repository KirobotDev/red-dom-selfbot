const fs = require('fs')
const superagent = require('superagent');


module.exports = {
  name: "hneko",
  descriptionfr: "Envoie une image hneko",
  descriptionen: "Send an hneko picture",
  nsfw: true,
  run: async (client, message, args) => {
     if (message.guild && message.guild.id === '1274437651759632484') {
      return message.edit("pas ici mchef");
    }
    const { body } = await superagent.get(`https://nekobot.xyz/api/image?type=hneko`)
    message.edit(body.message)
  }
}