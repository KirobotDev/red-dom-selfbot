const fs = require('fs')

module.exports = {
  name: "sad",
  descriptionfr: "༼ つ ◕_◕ ༽つ",
  usage: "",
  run: async (client, message, args) => {
    message.delete().catch(() => false)
    message.channel.send("https://media.discordapp.net/attachments/1093487822272483358/1322338031155548160/image-removebg-preview41.png?ex=677082c2&is=676f3142&hm=c571d61c811cfd92245d454f77783a2a62dc14bdcea5f248b6b7df4085998fb8&=&format=webp&quality=lossless")
  }
}