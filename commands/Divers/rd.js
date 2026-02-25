const fs = require('fs')

module.exports = {
  name: "rd",
  descriptionfr: "༼ つ ◕_◕ ༽つ",
  usage: "",
  run: async (client, message, args) => {
    message.delete().catch(() => false)
    message.channel.send("REDDOM MOUAHAHAAAHAH")
  }
}