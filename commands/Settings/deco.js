const chalk = require('chalk');

module.exports = {
  name: "deco",
  description: "Déconnecte complètement votre compte du selfbot",
  run: async (client, message, args) => {
    try {
      const userId = client.user.id;
      
      const { users, config, globalDb, dbManager, clients } = require('../../index.js');
      
      const existingToken = users[userId]?.token || config.user[userId]?.token;
      
      if (!existingToken) {
        return await message.channel.send('Faites la commande \`/deco\` dans ce salon pour vous déconnecter : <#1446253964843679764>');
      }

      await message.channel.send('**Déconnexion complète réussie !**\n\n' +
            '• Token supprimé de la base de données\n' +
            '• Compte déconnecté du selfbot\n' +
            '• Vous pouvez vous reconnecter avec `/login_selfbot`');

      const userClient = clients.find(c => c.userId === userId);
      
      if (userClient) {
        try {
          console.log(chalk.yellow(`Déconnexion du client ${userId}...`));
          
          if (userClient.reconnectInterval) {
            clearInterval(userClient.reconnectInterval); 
          }
          
          if (userClient.voice?.connections) {
            for (const connection of userClient.voice.connections.values()) {
              connection.destroy();
            } 
          }
          
          userClient.removeAllListeners();
          await userClient.destroy(); 
          
          const clientIndex = clients.findIndex(c => c.userId === userId);
          if (clientIndex !== -1) {
            clients.splice(clientIndex, 1); 
          }
          
        } catch (clientError) {
          console.error(chalk.red(`❌ Erreur déconnexion client ${userId}:`), clientError);
        }
      } 
      
      if (users[userId]) {
        delete users[userId]; 
      }
      
      if (config.user && config.user[userId]) {
        delete config.user[userId]; 
      }
      
      if (globalDb[userId]) {
        delete globalDb[userId];
      }
        
      try {
        const userData = await dbManager.getUserData(userId);
        
        if (userData && userData.token) {
          delete userData.token;
           
          try { 
            await dbManager.query(
              'DELETE FROM user_data WHERE user_id = ?',
              [userId]
            ); 
            
          } catch (dbError) {
            console.error(chalk.red(`❌ Erreur suppression DB SQL pour ${userId}:`), dbError);
          }
        }
      } catch (error) {
        console.error(chalk.red(`❌ Erreur récupération données ${userId}:`), error);
      }

      try {
        const { saveConfig } = require('../../index.js');
        await saveConfig(); 
      } catch (saveError) {
        console.error(chalk.red('❌ Erreur sauvegarde:'), saveError);
      }

      try {
        const finalCheck = await dbManager.getUserData(userId);
        const stillHasToken = finalCheck?.token ? true : false;
        
        if (stillHasToken) {
          console.log(chalk.red(`❌ ATTENTION: Token toujours présent dans la DB pour ${userId}`));
          await message.channel.send('⚠️ Déconnexion partielle - contactez un administrateur.');
        } else {
        }
      } catch (checkError) {
        console.error(chalk.red(`❌ Erreur vérification: ${checkError.message}`)); 
      }

    } catch (error) {
      console.error(chalk.red('❌ Erreur commande deco:'), error);
      await message.channel.send('❌ Erreur lors de la déconnexion.');
    }
  }
};