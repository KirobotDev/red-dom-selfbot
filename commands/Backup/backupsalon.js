const fs = require("fs");
const path = require("path");

module.exports = {
  name: "backupsalon",
  description: "Gestion des backups des salons et catégories",
  run: async (client, message, args, prefix) => {
    const clientID = message.author.id;
    const clientBackupFolderPath = path.join(__dirname, "BackupChannels", `${clientID}`);

    if (args[0] === "create") {
        const guildID = args[1];
  
        if (!guildID) {
          return message.edit(
            "**❌ Veuillez fournir l'ID du serveur dont vous voulez créer la backup des salons et catégories.**"
          );
        }
  
        const guild = client.guilds.cache.get(guildID);
  
        if (!guild) {
          return message.edit(
            "**❌ Impossible de trouver le serveur avec l'ID fourni (Vous devez être sur le serveur).**"
          );
        }
  
        const basemessage = await message.edit(
          "**🔧 Création de la backup des salons et catégories en cours...**"
        );
  
        if (!fs.existsSync(clientBackupFolderPath)) {
          fs.mkdirSync(clientBackupFolderPath, { recursive: true });
        }
        const channels = guild.channels.cache
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          type: channel.type,
          position: channel.rawPosition,
          parent: channel.parentId || null,
          permissionOverwrites: channel.permissionOverwrites?.cache 
            ?.filter((overwrite) => overwrite.id === guild.id) 
            .map((overwrite) => ({
              id: overwrite.id,
              type: overwrite.type,
              allow: overwrite.allow.bitfield.toString(),
              deny: overwrite.deny.bitfield.toString(),
            })) || [],
        }))      
          .sort((a, b) => a.position - b.position); 
  
        const backupID = `${Date.now()}`;
		const filePath = path.join(clientBackupFolderPath, `${backupID}.json`);
        const backupJSON = {
          id: backupID,
          name: guild.name,
          channels,
        };
  
        fs.writeFile(filePath, JSON.stringify(backupJSON), (err) => {
          if (err) {
            console.log(err);
            return basemessage.edit(
              "**❌ Erreur lors de la sauvegarde des salons. Consultez la console.**"
            );
          }
          basemessage.edit(
            `**✅ Votre backup des salons a été créée avec succès ! ID : ${backupID}**\n*(Utilisez \`&backupsalon load ${backupID}\` pour la charger.)*`
          );
        });
      } else if (args[0] === "load") {
        const backupID = args[1];
        if (!backupID) {
            return message.edit("**❌ Veuillez fournir l'ID de la sauvegarde à charger.**");
        }
    
        const filePath = path.join(clientBackupFolderPath, `${backupID}.json`);
    
        if (!fs.existsSync(filePath)) {
            return message.edit("**❌ La sauvegarde demandée n'existe pas.**");
        }
    
        const guild = message.guild;
        const basemessage = await message.edit("**🎡 Chargement de la sauvegarde en cours...**");
    
        const backupData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
        const isCommunity = guild.features.includes("COMMUNITY");
    
        await Promise.all(
            guild.channels.cache.map((channel) =>
                channel.delete().catch((err) =>
                    console.log(`Erreur suppression salon ${channel.name}: ${err}`)
                )
            )
        );
    
        const createdCategories = new Map();
    
        for (const channel of backupData.channels.filter(
            (c) => c.type === "GUILD_CATEGORY"
        )) {
            const newCategory = await guild.channels.create(channel.name, {
                type: "GUILD_CATEGORY",
                position: channel.position,
            });
    
            createdCategories.set(channel.id, newCategory.id);
        }
    
        for (const channel of backupData.channels.filter(
            (c) => c.type === "GUILD_TEXT" || c.type === "GUILD_VOICE"
        )) {

            if (channel.type === "GUILD_FORUM" || channel.type === "GUILD_THREAD") {
                console.log(`Salon de type ${channel.type} ignoré.`);
                continue; 
            }
    
            const newChannel = await guild.channels.create(channel.name, {
                type: channel.type,
                position: channel.position,
                parent: createdCategories.get(channel.parent) || null,
            });
    
            for (const overwrite of channel.permissionOverwrites) {
                if (overwrite.id === guild.id) {
                    await newChannel.permissionOverwrites.create(overwrite.id, {
                        allow: BigInt(overwrite.allow),
                        deny: BigInt(overwrite.deny),
                    });
                }
            }
        }    
    } else if (args[0] === "list") {
      if (!fs.existsSync(clientBackupFolderPath)) {
        return message.edit("**❌ Aucun backup trouvé pour cet utilisateur.**");
      }

      fs.readdir(clientBackupFolderPath, (err, files) => {
        if (err) {
          console.log(err);
          return message.edit(
            "**❌ Erreur lors de la lecture des fichiers de backup.**"
          );
        }

        if (files.length === 0) {
          return message.edit(
            "**❌ Aucun backup trouvé pour cet utilisateur.**"
          );
        }

        const backupList = files
          .map((file, index) => {
            const backupData = JSON.parse(
              fs.readFileSync(path.join(clientBackupFolderPath, file), "utf-8")
            );
            return `${index + 1} - Nom du serveur : ${backupData.name} | ID de sauvegarde : ${backupData.id}`;
          })
          .join("\n");

        message.edit(
          `**Voici la liste de vos backups des salons :**\n\`\`\`${backupList}\`\`\``
        );
      });
    } else if (args[0] === "destroy") {
      if (!fs.existsSync(clientBackupFolderPath)) {
        return message.edit("**❌ Aucun backup trouvé pour cet utilisateur.**");
      }

      if (args[1] === "all") {
        fs.rm(clientBackupFolderPath, { recursive: true, force: true }, (err) => {
          if (err) {
            console.log(err);
            return message.edit(
              "**❌ Erreur lors de la suppression des backups.**"
            );
          }

          message.edit(
            "**✅ Toutes vos backups des salons ont été supprimées avec succès.**"
          );
        });
      } else if (!args[1]) {
        fs.readdir(clientBackupFolderPath, (err, files) => {
          if (err) {
            console.log(err);
            return message.edit(
              "**❌ Erreur lors de la lecture des fichiers de backup.**"
            );
          }

          if (files.length === 0) {
            return message.edit(
              "**❌ Aucun backup trouvé pour cet utilisateur.**"
            );
          }

          const backupList = files
            .map((file, index) => {
              const backupData = JSON.parse(
                fs.readFileSync(path.join(clientBackupFolderPath, file), "utf-8")
              );
              return `${index + 1} - ${backupData.name}`;
            })
            .join("\n");

          message.edit(
            `**Veuillez choisir une backup des salons à détruire en utilisant le numéro correspondant :**\n\`\`\`${backupList}\`\`\``
          );
        });
      } else {
        const index = parseInt(args[1], 10) - 1;

        fs.readdir(clientBackupFolderPath, (err, files) => {
          if (err) {
            console.log(err);
            return message.edit(
              "**❌ Erreur lors de la lecture des fichiers de backup.**"
            );
          }

          if (index < 0 || index >= files.length) {
            return message.edit("**❌ Numéro de backup invalide.**");
          }

		    const filePath = path.join(clientBackupFolderPath, files[index]);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.log(err);
              return message.edit(
                "**❌ Erreur lors de la suppression de la backup.**"
              );
            }

            message.edit(
              `**✅ La backup des salons ${files[index]} a été supprimée avec succès.**`
            );
          });
        });
      }
    } else {
      message.edit(`
**__✨ Utilisation des commandes de backup des salons ✨__**

**📂 Gestion des sauvegardes des salons :**

\`${prefix.prefix}backupsalon create [server ID]\`  ☆  _Crée une sauvegarde des salons et catégories du serveur._
\`${prefix.prefix}backupsalon destroy [backup ID]\`  ☆  _Supprime une sauvegarde des salons._
\`${prefix.prefix}backupsalon destroy all\`  ☆  _Supprime toutes vos sauvegardes des salons._
\`${prefix.prefix}backupsalon list\`  ☆  _Affiche la liste des sauvegardes des salons._
\`${prefix.prefix}backupsalon load [backup ID]\`  ☆  _Charge une sauvegarde des salons dans le serveur actuel._
`);
    }
  },
};
