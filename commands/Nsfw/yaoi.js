const fs = require('fs')
const superagent = require('superagent');


module.exports = {
  name: "yaoi",
  descriptionfr: "Envoie une image d'un yaoi",
  descriptionen: "Send a yaoi picture",
  nsfw: true,
  run: async (client, message, args) => {
    if (message.guild && message.guild.id === '1274437651759632484') {
      return message.edit("pas ici mchef");
    }
    const { body } = await superagent.get(`https://nekobot.xyz/api/image?type=yaoi`)
    message.edit(body.message)
  }
}