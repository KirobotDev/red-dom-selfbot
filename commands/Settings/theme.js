const { savedb } = require("../../fonctions");

module.exports = {
  name: "theme",
  description: "Modifier le thème du menu d'aide",
  run: async (client, message, args, db) => {
    try {
        if (!args[0]) {
            const themeMessage = `
** **            [ :art: THÈMES REDDOM :art: ]

╭─────────────────────────────╮
│ • &theme center        → Centré emojis
│ • &theme default       → Défaut Reddom
│ • &theme emojitel     → Tel emojis
│ • &theme emojipc     → PC emojis
│ • &theme halfpc        → PC compact
│ • &theme simple        → Mobile simple
│ • &theme simpletel   → TEL simple
│ • &theme simplepc   → PC simple
│ • &theme sortpc        → PC rangé
╰─────────────────────────────╯
            `;
            
            return message.edit(themeMessage);
        }

        const themes = {
            "center":   "Thème centré avec emojis",
            "default":  "Thème par défaut Reddom",
            "emojitel":  "Thème TEL avec emojis",
            "emojipc":  "Thème PC avec emojis",
            "halfpc":   "Thème PC compact",
            "simple":   "Thème simple",
            "simpletel": "Thème TEL simple", 
            "simplepc": "Thème PC simple", 
            "sortpc":   "Thème PC rangé"
        };

        if (!themes[args[0]]) {
            return message.edit(`╭──────────────────────────╮
│ ❌ Thème invalide !       
│ Thèmes disponibles :      
│ \`theme center\`, \`theme default\`, \`theme emojitel\`, \`theme emojipc\`, \`theme halfpc\`, \`theme simple\`, \`theme simpletel\`, \`theme simplepc\`, \`theme sortpc\`
╰──────────────────────────╯`);
        }

        db.theme = args[0];
        await savedb(client, db);
        
        const successMessage = `
** **       [ ✅ THÈME APPLIQUÉ ✅ ]

╭─────────────────────────╮
│ Thème          : ${args[0]}
│ Description : ${themes[args[0]]}
╰─────────────────────────╯
        `;
        
        message.edit(successMessage);
    }
    catch(e) {
        console.error("Erreur dans theme:", e);
        
        const errorMessage = `
╭─────────────────────────╮
│ ❌ Une erreur est survenue
│ lors du changement de thème
╰─────────────────────────╯
        `;
        
        message.edit(errorMessage);
    }
  }
};