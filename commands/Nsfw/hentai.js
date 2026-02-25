const fs = require('fs')
const superagent = require('superagent');


module.exports = {
  name: "hentai",
  descriptionfr: "Envoie une image d'hentai",
  descriptionen: "Send an hentai picture",
  nsfw: true,
  run: async (client, message, args) => {
    if (message.guild && message.guild.id === '1274437651759632484') {
      return message.edit("pas ici mchef");
    }
    const { body } = await superagent.get(`https://nekobot.xyz/api/image?type=hentai`)
    message.edit(body.message)
  }
}