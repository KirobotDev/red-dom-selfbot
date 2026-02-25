const { savedb } = require("../../fonctions");

module.exports = {
  name: "setemoji",
  description: "Modifier les emojis autour du nom REDDOM dans les menus",
  run: async (client, message, args, db) => {
    try {
        if (!args[0]) {
            const currentEmoji = db.emoji || '🚩';
            
            const helpMessage = `** **           [ ${currentEmoji} REDDOM ${currentEmoji} ]

╭─────────────────────╮
│ • ${db.prefix}setemoji [emoji] → Définir un emoji
│ • ${db.prefix}setemoji remove → Suppr les emojis
╰─────────────────────╯`;
            
            return message.edit(helpMessage);
        }

        if (args[0].toLowerCase() === 'remove') {
            db.emoji = '';
            await savedb(client, db);
            
            return message.edit(`** **                 [  REDDOM  ]

╭─────────────────────╮
│ Les emojis ont été supprimés
│ avec succès !       
│            
│ Affichage : [  REDDOM  ] 
╰─────────────────────╯`);
        }

        const newEmoji = args[0];
        db.emoji = newEmoji;
        await savedb(client, db);
        
        const successMessage = `[  ${newEmoji} REDDOM ${newEmoji}  ]

╭──────────────╮
│ Emoji défini : ${newEmoji.padEnd(2)} 
╰──────────────╯ `;
        
        message.edit(successMessage);
    }
    catch(e) {
        console.error("Erreur dans setemoji:", e);
        
        const errorMessage = `
╭─────────────────────╮
│ Une erreur est      
│ survenue lors de la 
│ modification des    
│ emojis.             
╰─────────────────────╯`;
        
        message.edit(errorMessage);
    }
  }
};