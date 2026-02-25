const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const fetch = global.fetch;
const { AttachmentBuilder } = require("discord.js");

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const unlinkAsync = promisify(fs.unlink);
const rmAsync = promisify(fs.rm);

module.exports = {
  name: "backupemoji",
  description: "Gestion des backups d'emojis",
  run: async (client, message, args, prefix) => {
    const clientID = message.author.id;
    const clientBackupFolderPath = path.join(__dirname, "Backupemoji", `${clientID}`);

    if (!fs.existsSync(clientBackupFolderPath)) {
      fs.mkdirSync(clientBackupFolderPath, { recursive: true });
    }

    if (args[0] === "create") {
      const guildID = args[1];

      if (!guildID) {
        return message.edit("**❌ Veuillez fournir l'ID du serveur dont vous voulez créer la backup des emojis.**");
      }

      const guild = client.guilds.cache.get(guildID);
      if (!guild) {
        return message.edit("**❌ Impossible de trouver le serveur avec l'ID fourni (Vous devez être sur le serveur).**");
      }

      const basemessage = await message.edit("**🔧 Création de la backup des emojis en cours...**");

      try {
        const emojis = guild.emojis.cache.map(emoji => ({
          name: emoji.name,
          url: emoji.url,
          id: emoji.id,
          animated: emoji.animated
        }));

        const backupID = `${Date.now()}`;
        const filePath = path.join(clientBackupFolderPath, `${backupID}.json`);
        const backupJSON = {
          id: backupID,
          name: guild.name,
          emojis: emojis,
          createdAt: new Date().toISOString()
        };

        await writeFileAsync(filePath, JSON.stringify(backupJSON, null, 2));
        
        await basemessage.edit(
          `**✅ Votre backup des emojis a bien été créée avec l'id \`${backupID}\` !**\n` +
          `*(Utilisez la commande \`${prefix}backupemoji load ${backupID}\` pour la charger.)*\n` +
          `**Emojis sauvegardés:** ${emojis.length} (${emojis.filter(e => e.animated).length} animés)`
        );
      } catch (err) {
        console.error("Erreur lors de la création de la backup:", err);
        await basemessage.edit(
          "**❌ Erreur lors de la sauvegarde des emojis. Vérifiez la console pour plus d'informations.**"
        );
      }

    } else if (args[0] === "load") {
      if (!message.member.permissions.has("ADMINISTRATOR")) {
          return message.edit("**❌ Vous n'avez pas les permissions requises pour exécuter cette commande**");
      }

      const backupID = args[1];
      if (!backupID) {
          return message.edit("**❌ Veuillez fournir l'ID de la sauvegarde des emojis.**");
      }

      const filePath = path.join(clientBackupFolderPath, `${backupID}.json`);
      if (!fs.existsSync(filePath)) {
          return message.edit("**❌ La sauvegarde des emojis demandée n'existe pas.**");
      }

      const guild = message.guild;
      if (!guild) {
          return message.edit("**❌ Impossible de récupérer le serveur où la commande est exécutée.**");
      }

      const loadingMessage = await message.edit("**🎡 Chargement de la sauvegarde des emojis en cours...**");

      try {
          const backupData = JSON.parse(await readFileAsync(filePath, "utf-8"));
          
          for (const emoji of guild.emojis.cache.values()) {
            await emoji.delete().catch(err => console.log(`Erreur lors de la suppression des emojis : ${err}`));
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          let successCount = 0;
          let failCount = 0;
          const failedEmojis = [];
          
          for (const emoji of backupData.emojis) {
            try {
              await guild.emojis.create(emoji.url, emoji.name).catch(err => {
                console.log(`Erreur lors de la création de l'émoji ${emoji.name}: ${err}`);
              });
              successCount++;
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
              console.error(`Erreur sur l'emoji ${emoji.name}:`, err);
              failCount++;
              failedEmojis.push(emoji.name);
            }
          }

          let resultMessage = `**✅ Chargement terminé !**\n` +
                           `Emojis créés: **${successCount}**/${backupData.emojis.length}`;
          
          if (failCount > 0) {
              resultMessage += `\n**❌ Échecs:** ${failCount}`;
              if (failedEmojis.length > 0) {
                  resultMessage += `\n\`\`\`${failedEmojis.slice(0, 15).join(", ")}${failedEmojis.length > 15 ? "..." : ""}\`\`\``;
              }
          }

          await loadingMessage.edit(resultMessage);

      } catch (err) {
          console.error("Erreur globale:", err);
          await loadingMessage.edit(`**❌ Erreur fatale:**\n\`\`\`${err.message}\`\`\``);
      }

    } else if (args[0] === "list") {
      try {
        const files = await readdirAsync(clientBackupFolderPath);
        
        if (files.length === 0) {
          return message.edit("**❌ Aucun backup trouvé pour cet utilisateur.**");
        }

        const backups = await Promise.all(
          files.map(async file => {
            try {
              const content = await readFileAsync(path.join(clientBackupFolderPath, file), "utf-8");
              const backupData = JSON.parse(content);
              
              let backupDate = "Date inconnue";
              try {
                if (backupData.createdAt) {
                  backupDate = new Date(backupData.createdAt).toLocaleString();
                } else {
                  const timestamp = file.split('.')[0];
                  if (!isNaN(timestamp)) {
                    backupDate = new Date(parseInt(timestamp)).toLocaleString();
                  }
                }
              } catch (e) {
                console.error("Erreur de format de date:", e);
              }
              
              return {
                id: backupData.id || file.split('.')[0],
                name: backupData.name || "Serveur inconnu",
                emojiCount: backupData.emojis?.length || 0,
                date: backupDate
              };
            } catch (err) {
              console.error(`Erreur de lecture du fichier ${file}:`, err);
              return {
                id: file.split('.')[0],
                name: "Format invalide",
                emojiCount: 0,
                date: "Date inconnue"
              };
            }
          })
        );

        const backupList = backups
          .map((backup, index) => 
            `${index + 1}. ${backup.name} (ID: ${backup.id})\n` +
            `   📅 ${backup.date} | 🎭 ${backup.emojiCount} emojis`
          )
          .join("\n\n");

        await message.edit(
          `**📂 Vos sauvegardes d'emojis (${backups.length}):**\n\`\`\`\n${backupList}\n\`\`\``
        );

      } catch (err) {
        console.error("Erreur lors de la liste des backups:", err);
        await message.edit("**❌ Erreur lors de la lecture des sauvegardes.**");
      }

    } else if (args[0] === "destroy") {
      if (args[1] === "all") {
        try {
          await rmAsync(clientBackupFolderPath, { recursive: true, force: true });
          await message.edit("**✅ Toutes vos backups des emojis ont été supprimées avec succès.**");
        } catch (err) {
          console.error("Erreur lors de la suppression des backups:", err);
          await message.edit("**❌ Erreur lors de la suppression des backups.**");
        }
      } else if (!args[1]) {
        try {
          const files = await readdirAsync(clientBackupFolderPath);
          
          if (files.length === 0) {
            return message.edit("**❌ Aucun backup trouvé pour cet utilisateur.**");
          }

          const backupList = files
            .map((file, index) => {
              try {
                const backupData = JSON.parse(fs.readFileSync(path.join(clientBackupFolderPath, file), "utf-8"));
                return `${index + 1} - ${backupData.name || "Serveur inconnu"} (ID: ${backupData.id || file.split('.')[0]})`;
              } catch (err) {
                return `${index + 1} - Format invalide (${file})`;
              }
            })
            .join("\n");

          await message.edit(
            `**Veuillez choisir une backup des emojis à détruire :**\n\`\`\`\n${backupList}\n\`\`\``
          );
        } catch (err) {
          console.error("Erreur lors de la liste des backups:", err);
          await message.edit("**❌ Erreur lors de la lecture des sauvegardes.**");
        }
      } else {
        const index = parseInt(args[1], 10) - 1;
        
        try {
          const files = await readdirAsync(clientBackupFolderPath);
          
          if (index < 0 || index >= files.length) {
            return message.edit("**❌ Numéro de backup invalide.**");
          }

          await unlinkAsync(path.join(clientBackupFolderPath, files[index]));
          await message.edit(`**✅ La backup "${files[index]}" a été supprimée avec succès.**`);
        } catch (err) {
          console.error("Erreur lors de la suppression de la backup:", err);
          await message.edit("**❌ Erreur lors de la suppression de la backup.**");
        }
      }
    } else {
      await message.edit(`
**__✨ Utilisation des commandes de backup des emojis ✨__**

**📂 Gestion des sauvegardes des emojis :**

\`${prefix.prefix}backupemoji create [server ID]\`  ☆  _Crée une sauvegarde des emojis du serveur_
\`${prefix.prefix}backupemoji destroy [backup ID]\`  ☆  _Supprime une sauvegarde d'emojis_
\`${prefix.prefix}backupemoji destroy all\`  ☆  _Supprime toutes les sauvegardes d'emojis_
\`${prefix.prefix}backupemoji list\`  ☆  _Affiche la liste des sauvegardes d'emojis_
\`${prefix.prefix}backupemoji load [backup ID]\`  ☆  _Charge une sauvegarde des emojis dans le serveur actuel_
`);
    }
  }
};