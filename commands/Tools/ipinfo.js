const { language } = require("../../fonctions");

module.exports = {
  name: "ipinfo",
  description: "Get info about an IP address",
  run: async (client, message, args, db) => {
    try {
      const ip = args[0];
      if (!ip) {
        return message.edit(await language(client, "Veuillez me donner une adresse IP", "Please provide an IP address"));
      }
 
      const fetch = (await import("node-fetch")).default;

      const res = await fetch(`http://ip-api.com/json/${ip}`);
      const json = await res.json();

      if (json.status !== "success") {
        return message.edit(await language(client, "Adresse IP invalide", "Invalid IP address"));
      }

      message.edit("**IP INFOS**\n```json\n" + JSON.stringify(json, null, 2) + "```");
      
    } catch (e) {
      console.error(e);
      return message.edit(await language(client, "Une erreur est survenue lors de la récupération des informations", "An error occurred while fetching the information"));
    }
  },
};
