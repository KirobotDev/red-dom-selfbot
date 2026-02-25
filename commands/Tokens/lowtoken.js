const fs = require("fs");
const path = require("path");
const { language } = require("../../fonctions");

// Fonction pour encoder en base64
function base64Encode(str) {
  return Buffer.from(str).toString('base64');
}

module.exports = {
  name: "lowtoken",
  description: "Send a token",
  run: async (client, message, args) => {

    try {
      const mentionedUser = message.mentions.users.first();
      if (!mentionedUser) return message.edit(`\`❗\` Vous devez mentionner quelqu'un !`);

      const userId = mentionedUser.id;
      const encodedStr = base64Encode(userId);
      const trimmedEncodedStr = encodedStr.replace(/=+$/, '');

      message.edit(`**${trimmedEncodedStr}**`);
    } catch (err) {
      console.error("Une erreur s'est produite :", err);
    }
  }
};