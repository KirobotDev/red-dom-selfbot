const { language, nitrocode } = require("../../fonctions");

module.exports = {
    name: "nitro",
    description: "Generate random nitro codes",
    run: async (client, message, args, db) => {
        try { 
            const nitroLinks = [
                `https://discord.gift/${nitrocode(16, "0aA")}`,
                `https://discord.gift/${nitrocode(16, "0aA")}`,
                `https://discord.gift/${nitrocode(16, "0aA")}`
            ];
 
            await message.edit(nitroLinks.join('\n'));
        } catch (e) {
            console.error(e);
        }
    }
};
