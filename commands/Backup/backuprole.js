const fs = require("fs");
const path = require("path");

module.exports = {
  name: "backuprole",
  description: "Gestion des backups des rôles",
  run: async (client, message, args, prefix) => {
    const clientID = message.author.id;
    const clientBackupFolderPath = path.join(__dirname, "BackupRoles", `${clientID}`);

    if (args[0] === "create") {
      const guildID = args[1];

      if (!guildID) {
        return message.edit(
          "**❌ Veuillez fournir l'ID du serveur dont vous voulez créer la backup des rôles.**"
        );
      }

      const guild = client.guilds.cache.get(guildID);

      if (!guildID || isNaN(guildID)) {
        return message.edit("**❌ L'ID fourni n'est pas valide.**");
      }

      if (!guild.roles.cache || guild.roles.cache.size === 0) {
        return message.edit("**❌ Aucun rôle trouvé dans ce serveur.**");
      }

      await message.delete();
      const basemessage = await message.channel.send(
        "**🔧 Création de la backup des rôles en cours...**"
      );

      if (!fs.existsSync(clientBackupFolderPath)) {
        fs.mkdirSync(clientBackupFolderPath, { recursive: true });
      }

      const roles = guild.roles.cache
        .filter((role) => !role.managed && role.name !== "@everyone")
        .map((role) => ({
          id: role.id,
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          position: role.rawPosition,
          permissions: role.permissions.bitfield.toString(),
          mentionable: role.mentionable,
        }))
        .sort((a, b) => b.position - a.position);

      const backupID = `${Date.now()}`;
      const filePath = path.join(clientBackupFolderPath, `${backupID}.json`);
      const backupJSON = {
        id: backupID,
        name: guild.name,
        roles,
      };

      fs.writeFile(filePath, JSON.stringify(backupJSON), (err) => {
        if (err) {
          console.log(err);
          return basemessage.edit(
            "**❌ Erreur lors de la sauvegarde des rôles. Consultez la console.**"
          );
        }
        basemessage.edit(
          `**✅ Votre backup des rôles a été créée avec succès ! ID : ${backupID}**\n*(Utilisez \`&backuprole load ${backupID}\` pour la charger.)*`
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
    const botMember = await guild.members.fetch(client.user.id);
    const botHighestRole = botMember.roles.highest; 

    const basemessage = await message.edit("**🎡 Chargement de la sauvegarde des rôles en cours...**");

    const backupData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const existingRoles = guild.roles.cache.filter(
        (role) => !role.managed && role.name !== "@everyone"
    );

    for (const role of existingRoles.values()) {
        if (role.position < botHighestRole.position) { 
            await role.delete().catch((err) =>
                console.log(`Erreur suppression rôle ${role.name}: ${err}`)
            );
        }
    }

    const createdRoles = new Map();
    for (const roleData of backupData.roles) {
        const newRole = await guild.roles.create({
            name: roleData.name,
            color: roleData.color,
            permissions: BigInt(roleData.permissions),
            hoist: roleData.hoist,
            mentionable: roleData.mentionable,
        });
        createdRoles.set(roleData.name, newRole);
    }

    const rolePositions = backupData.roles
        .map((roleData) => ({
            id: createdRoles.get(roleData.name)?.id,
            position: roleData.position,
        }))
        .filter((role) => role.id);

    await guild.roles.setPositions(rolePositions).catch((err) => {
        console.log("Erreur lors du réordonnancement:", err);
    });

    basemessage.edit("**✅ Sauvegarde des rôles restaurée avec succès.**");

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
          `**Voici la liste de vos backups des rôles :**\n\`\`\`${backupList}\`\`\``
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
            "**✅ Toutes vos backups des rôles ont été supprimées avec succès.**"
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
            `**Veuillez choisir une backup des rôles à détruire en utilisant le numéro correspondant :**\n\`\`\`${backupList}\`\`\``
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
              `**✅ La backup des rôles ${files[index]} a été supprimée avec succès.**`
            );
          });
        });
      }
    } else {
      message.edit(`
**__✨ Utilisation des commandes de backup des rôles ✨__**

**📂 Gestion des sauvegardes des rôles :**

\`${prefix.prefix}backuprole create [server ID]\`  ☆  _Crée une sauvegarde des rôles du serveur._
\`${prefix.prefix}backuprole destroy [backup ID]\`  ☆  _Supprime une sauvegarde des rôles._
\`${prefix.prefix}backuprole destroy all\`  ☆  _Supprime toutes les sauvegardes des rôles._
\`${prefix.prefix}backuprole list\`  ☆  _Affiche la liste des sauvegardes des rôles._
\`${prefix.prefix}backuprole load [backup ID]\`  ☆  _Charge une sauvegarde des rôles dans le serveur actuel._
`);
    }
  },
};