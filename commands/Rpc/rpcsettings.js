const { language, savedb } = require("../../fonctions");

module.exports = {
  name: "rpcsettings",
  description: "Affiche la configuration complète du RPC",
  run: async (client, message, args, db, prefix) => {
    try {
        
      const formatTime = (date) => {
        if (!date) return "None";
        return new Date(date).toLocaleString();
      };

      const formatButtons = () => {
        let buttons = [];
        if (db.buttontext1 && db.buttonlink1) {
          buttons.push(`↳ Bouton 1: [${db.buttontext1}](${db.buttonlink1})`);
        }
        if (db.buttontext2 && db.buttonlink2) {
          buttons.push(`↳ Bouton 2: [${db.buttontext2}](${db.buttonlink2})`);
        }
        return buttons.length > 0 ? buttons.join("\n") : "None";
      };

      const formatParty = () => {
        if (db.rpcminparty && db.rpcmaxparty) {
          return `${db.rpcminparty}/${db.rpcmaxparty}`;
        }
        return "None";
      };

      message.edit(await language(client, 
        `⛧__**RPC - Paramètres Complets**__⛧
        
**Configuration Principale:**
> **Nom:** \`${db.rpctitle || "Non configuré"}\`
> **Type:** \`${db.rpctype || "Non configuré"}\`
> **État:** \`${db.rpcstate || "Non configuré"}\`
> **Détails:** \`${db.rpcdetails || "Non configuré"}\`

**Images:**
> **Grande Image:** \`${db.rpclargeimage || "Non configuré"}\`
> **Texte Grande Image:** \`${db.rpclargeimagetext || "Non configuré"}\`
> **Petite Image:** \`${db.rpcsmallimage || "Non configuré"}\`
> **Texte Petite Image:** \`${db.rpcsmallimagetext || "Non configuré"}\`

**Autres Paramètres:**
> **Party:** \`${formatParty()}\`
> **Timestamp:** \`${formatTime(db.rpctime)}\`
> **Twitch:** \`${db.twitch || "Non configuré"}\`

**Boutons:**
${formatButtons()}

Utilisez \`${prefix}configrpc\` pour modifier ces paramètres`,

        `⛧__**RPC - Full Settings**__⛧
        
**Main Configuration:**
> **Name:** \`${db.rpctitle || "Not set"}\`
> **Type:** \`${db.rpctype || "Not set"}\`
> **State:** \`${db.rpcstate || "Not set"}\`
> **Details:** \`${db.rpcdetails || "Not set"}\`

**Images:**
> **Large Image:** \`${db.rpclargeimage || "Not set"}\`
> **Large Text:** \`${db.rpclargeimagetext || "Not set"}\`
> **Small Image:** \`${db.rpcsmallimage || "Not set"}\`
> **Small Text:** \`${db.rpcsmallimagetext || "Not set"}\`

**Other Settings:**
> **Party:** \`${formatParty()}\`
> **Timestamp:** \`${formatTime(db.rpctime)}\`
> **Twitch:** \`${db.twitch || "Non configuré"}\`

**Buttons:**
${formatButtons()}

Use \`${prefix}configrpc\` to modify these settings`));

    } catch(e) {
      console.error("Erreur dans rpcsettings:", e);
    }
  }
};