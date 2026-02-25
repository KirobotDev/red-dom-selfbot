const { savedb } = require("../../fonctions");

module.exports = {
    name: "selfdel",
    aliases: ["delmsg", "selfclear"],
    description: "Configure la suppression automatique des commandes (off ou 10-120 secondes).",
    run: async (client, message, args, db) => {
        try { 
            if (db.clearDelay === undefined) db.clearDelay = 60;
            if (db.clear === undefined) db.clear = false;

            if (!args[0]) {
                const status = db.clear ? 'activé' : 'désactivé';
                const delay = db.clearDelay;
                
                const statusMessage = `** **           [ 🚩 REDDOM 🚩 ]

- **Suppression Automatique des commandes**

> Statut: ${status.padEnd(15)} 
> Délai: ${delay.toString().padEnd(3)}secondes  

---

- **Commandes** :

> ${db.prefix}\`selfdel off\` ➤ Ne suppr pas auto les cmds
> ${db.prefix}\`selfdel (temps)\` ➤ Suppr auto les cmds
`;
                
                return await message.edit(statusMessage);
            }

            const arg = args[0].toLowerCase();

            if (arg === 'off') { 
                db.clear = false;
                db.clearDelay = 60; 
                await savedb(client, db);
                 
                try {
                    const sqlDb = require('../../sqlDb');
                    await sqlDb.updateUserData(client.user.id, {
                        clear: false,
                        clearDelay: 60
                    });
                } catch (sqlError) {
                    console.error('Erreur SQL lors de la sauvegarde:', sqlError);
                }
                
                await message.edit(`** **           [ 🚩 REDDOM 🚩 ]

╭─────────────────────╮
│ Suppression auto    
│ désactivée ✓        
╰─────────────────────╯`);
            } else {
                const delay = parseInt(arg, 10);
                if (isNaN(delay) || delay < 10 || delay > 120) {
                    return await message.edit(`** **           [ 🚩 REDDOM 🚩 ]

╭─────────────────────╮
│ Erreur: délai       
│ invalide            
│                     
│ Utilise: 10-120s    
│ ou "off"            
╰─────────────────────╯`);
                } 
                db.clear = true;
                db.clearDelay = delay;
                await savedb(client, db);
                 
                try {
                    const sqlDb = require('../../sqlDb');
                    await sqlDb.updateUserData(client.user.id, {
                        clear: true,
                        clearDelay: delay
                    });
                } catch (sqlError) {
                    console.error('Erreur SQL lors de la sauvegarde:', sqlError);
                }
                
                await message.edit(`** **           [ 🚩 REDDOM 🚩 ]

╭─────────────────────╮
│ Suppression auto    
│ activée ✓           
│ Délai: ${delay.toString().padEnd(3)} secondes  
╰─────────────────────╯`);
            }

        } catch (error) {
            console.error('Erreur commande selfdel:', error);
            try {
                await message.edit(`** **           [ 🚩 REDDOM 🚩 ]

╭─────────────────────╮
│ Erreur: impossible  
│ de modifier la      
│ configuration       
╰─────────────────────╯`);
            } catch (e) {
                console.error('Erreur lors de l\'envoi du message d\'erreur:', e);
            }
        }
    }
};