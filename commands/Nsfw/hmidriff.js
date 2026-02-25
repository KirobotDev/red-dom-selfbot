const fs = require('fs')
const superagent = require('superagent');


module.exports = {
  name: "hmidriff",
  descriptionfr: "même moi je sais pas c'est quoi dsl",
  descriptionen: "I don't know what's that sry",
  nsfw: true,
  run: async (client, message, args) => {
    if (message.guild && message.guild.id === '1274437651759632484') {
      return message.edit("pas ici mchef");
    }
    const { body } = await superagent.get(`https://nekobot.xyz/api/image?type=hmidriff`)
    message.edit(body.message)
  }
}