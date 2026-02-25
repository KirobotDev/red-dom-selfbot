const fs = require("fs");

module.exports = {
    name: "code",
    description: "Coder un message",
    run: async (client, message, args) => {
        if (!args.length) {
            return message.reply("Veuillez fournir un message à coder.");
        }

        const inputMessage = args.join(" ");
        const codedMessage = inputMessage
            .replace(/a/gi, "@")
            .replace(/b/gi, "ß")
            .replace(/c/gi, "¢")
            .replace(/d/gi, "Ð")
            .replace(/e/gi, "€")
            .replace(/f/gi, "ƒ")
            .replace(/g/gi, "9")
            .replace(/h/gi, "#")
            .replace(/i/gi, "!")
            .replace(/j/gi, ";")
            .replace(/k/gi, "κ")
            .replace(/l/gi, "£")
            .replace(/m/gi, "₥")
            .replace(/n/gi, "₪")
            .replace(/o/gi, "0")
            .replace(/p/gi, "₱")
            .replace(/q/gi, "¶")
            .replace(/r/gi, "₹")
            .replace(/s/gi, "§")
            .replace(/t/gi, "Ƭ")
            .replace(/u/gi, "Ω")
            .replace(/v/gi, "√")
            .replace(/w/gi, "ω")
            .replace(/x/gi, "%")
            .replace(/y/gi, "¥")
            .replace(/z/gi, "Ƶ")
            .replace(/0/g, "ø")
            .replace(/1/g, "¹")
            .replace(/2/g, "²")
            .replace(/3/g, "³")
            .replace(/4/g, "¤")
            .replace(/5/g, "¥")
            .replace(/6/g, "ζ")
            .replace(/7/g, "ξ")
            .replace(/8/g, "∞")
            .replace(/9/g, "§");

        await message.delete();
        message.channel.send(`\`${codedMessage}\``);
    },
};
