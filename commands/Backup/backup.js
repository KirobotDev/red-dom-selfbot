const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { AttachmentBuilder } = require("discord.js");

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const unlinkAsync = promisify(fs.unlink);
const rmAsync = promisify(fs.rm);
const mkdirAsync = promisify(fs.mkdir);

module.exports = {
  name: "backup",
  description: "Système complet de backup",
  run: async (client, message, args, prefix) => {
    const pprefix = prefix.prefix
    const clientID = message.author.id;
    const backupBasePath = path.join(__dirname, "BackupSystem");

    const backupPaths = {
      full: path.join(backupBasePath, "backup", clientID)
    };

    for (const folderPath of Object.values(backupPaths)) {
      if (!fs.existsSync(folderPath)) {
        await mkdirAsync(folderPath, { recursive: true });
      }
    }

    const sendMessage = async (content, originalMessage = message) => {
      try {
        if (originalMessage.editable) {
          return await originalMessage.channel.send(content);
        } else {
          return await originalMessage.channel.send(content);
        }
      } catch (err) {
        return await originalMessage.channel.send(content);
      }
    };

    if (args[0] === "create") {
      const guildID = args[1];

      if (!guildID) {
        return await sendMessage("❌ Veuillez fournir l'ID du serveur.");
      }

      const guild = client.guilds.cache.get(guildID);
      if (!guild) {
        return await sendMessage("❌ Serveur introuvable.");
      }

      const backupMessage = await sendMessage("🔧 Création de la backup en cours...");

      try {
        const backupID = `${Date.now()}`;
        
        const iconURL = guild.iconURL({ format: 'png', size: 4096 });
        
        const emojis = guild.emojis.cache.map(emoji => ({
          name: emoji.name,
          url: emoji.url,
          id: emoji.id,
          animated: emoji.animated
        }));

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

        const channels = guild.channels.cache
          .map((channel) => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            position: channel.rawPosition,
            parent: channel.parentId || null,
            permissionOverwrites: channel.permissionOverwrites?.cache?.map((overwrite) => ({
              id: overwrite.id,
              type: overwrite.type,
              allow: overwrite.allow.bitfield.toString(),
              deny: overwrite.deny.bitfield.toString(),
            })) || [],
          }))      
          .sort((a, b) => a.position - b.position);

        const stickers = guild.stickers.cache.map(sticker => ({
          name: sticker.name,
          description: sticker.description,
          tags: sticker.tags,
          format: sticker.format,
          url: sticker.url
        }));

        const fullBackup = {
          id: backupID,
          name: guild.name,
          iconURL: iconURL,
          createdAt: new Date().toISOString(),
          emojis,
          roles,
          channels,
          stickers
        };

        const filePath = path.join(backupPaths.full, `${backupID}.json`);
        await writeFileAsync(filePath, JSON.stringify(fullBackup, null, 2));

        await sendMessage(
          `✅ Backup créée | ${guild.name}

> Contenu: ${emojis.length} emojis, ${roles.length} rôles, ${channels.length} salons
> 
> Utilisez \`${pprefix}backup load ${backupID}\` pour la charger`,
          backupMessage
        );

      } catch (err) {
        await sendMessage("❌ Erreur lors de la création de la backup.", backupMessage);
      }

    } else if (args[0] === "load") {
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return await sendMessage("❌ Permissions administrateur requises.");
      }

      const backupID = args[1];
      if (!backupID) {
        return await sendMessage("❌ Veuillez fournir l'ID de la backup.");
      }

      const filePath = path.join(backupPaths.full, `${backupID}.json`);
      if (!fs.existsSync(filePath)) {
        return await sendMessage("❌ Backup introuvable.");
      }

      const guild = message.guild;
      let loadingMessage = await sendMessage("🎡 Chargement de la backup en cours...");

      try {
        const backupData = JSON.parse(await readFileAsync(filePath, "utf-8"));
        let roleMapping = new Map(); 
        const channelId = message.channel.id;

        try {
          loadingMessage = await sendMessage("🔄 Mise à jour du nom et de l'icône du serveur...", loadingMessage);
          
          if (backupData.name && guild.me.permissions.has("MANAGE_GUILD")) {
            await guild.setName(backupData.name);
          }
          
          if (backupData.iconURL && guild.me.permissions.has("MANAGE_GUILD")) {
            try {
              const response = await fetch(backupData.iconURL);
              const buffer = await response.arrayBuffer();
              const iconBuffer = Buffer.from(buffer);
              await guild.setIcon(iconBuffer);
            } catch (iconErr) {}
          }
        } catch (err) {}

        try {
          loadingMessage = await sendMessage("🔄 Suppression des rôles...", loadingMessage);
          
          const botMember = await guild.members.fetch(client.user.id);
          const isBotOwner = guild.ownerId === client.user.id;

          const existingRoles = guild.roles.cache.filter(role => 
            !role.managed && 
            role.name !== "@everyone" && 
            role.id !== guild.roles.everyone.id
          );
            
          const rolesToDelete = isBotOwner 
            ? Array.from(existingRoles.values()).sort((a, b) => a.position - b.position)
            : Array.from(existingRoles.values())
                .filter(role => role.position < botMember.roles.highest.position && role.editable)
                .sort((a, b) => a.position - b.position);
          
          for (const role of rolesToDelete) {
            try {
              await role.delete("Backup restoration");
              await new Promise(resolve => setTimeout(resolve, 800));
            } catch (err) {
              if (err.message.includes("rate limited")) {
                loadingMessage = await sendMessage("⏳ Rate limit détecté, attente...", loadingMessage);
                await new Promise(resolve => setTimeout(resolve, 5000));
              }
            }
          }
        } catch (err) {}

        try {
          loadingMessage = await sendMessage("🔄 Création des rôles...", loadingMessage);
          
          for (const roleData of backupData.roles) {
            try {
              const newRole = await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                permissions: BigInt(roleData.permissions),
                hoist: roleData.hoist,
                mentionable: roleData.mentionable,
                reason: "Backup restoration"
              });
              roleMapping.set(roleData.id, newRole.id);
              await new Promise(resolve => setTimeout(resolve, 500)); 
            } catch (err) {
              if (err.message.includes("rate limited")) {
                loadingMessage = await sendMessage("⏳ Rate limit détecté, attente...", loadingMessage);
                await new Promise(resolve => setTimeout(resolve, 5000));
              }
            }
          }
        } catch (err) {}

        try {
          loadingMessage = await sendMessage("🔄 Suppression des salons...", loadingMessage);

          const channelsToDelete = guild.channels.cache.filter(ch => 
            ch.id !== channelId && 
            ch.deletable
          );
          
          for (const channel of channelsToDelete.values()) {
            try {
              await channel.delete("Backup restoration");
            } catch (err) {
              if (err.message.includes("rate limited")) {
                loadingMessage = await sendMessage("⏳ Rate limit détecté, attente...", loadingMessage);
              }
            }
          }
        } catch (err) {}

        let channel;
        try {
          channel = await client.channels.fetch(channelId);
        } catch (err) {
          try {
            channel = await guild.channels.create("backup-restauration", {
              type: "GUILD_TEXT",
              position: 0,
              reason: "Backup restoration"
            });
          } catch (createErr) {
            return;
          }
        }

        try {
          loadingMessage = await sendMessage("🔄 Création des salons...", loadingMessage);
          const createdCategories = new Map();
          const createdChannels = new Map();

          let originalGuildId = null;
          for (const channel of backupData.channels) {
            for (const overwrite of channel.permissionOverwrites || []) {
              if (overwrite.type === "role" && !roleMapping.has(overwrite.id)) {
                originalGuildId = overwrite.id;
                break;
              }
            }
            if (originalGuildId) break;
          }

          if (originalGuildId) {
            roleMapping.set(originalGuildId, guild.roles.everyone.id);
          }

          const categories = backupData.channels.filter((c) => c.type === "GUILD_CATEGORY");
          
          for (const channelData of categories) {
              try {
                  const permissionOverwrites = [];
                  if (channelData.permissionOverwrites && channelData.permissionOverwrites.length > 0) {
                    for (const overwrite of channelData.permissionOverwrites) {
                      const newTargetId = roleMapping.get(overwrite.id);
                      if (newTargetId) {
                        permissionOverwrites.push({
                          id: newTargetId,
                          allow: BigInt(overwrite.allow),
                          deny: BigInt(overwrite.deny),
                        });
                      }
                    }
                  }
                  
                  const newCategory = await guild.channels.create(channelData.name, {
                      type: "GUILD_CATEGORY",
                      position: channelData.position,
                      permissionOverwrites: permissionOverwrites,
                      reason: "Backup restoration"
                  });
                  
                  createdCategories.set(channelData.id, newCategory.id);
                  createdChannels.set(channelData.name, newCategory);
                  await new Promise(resolve => setTimeout(resolve, 1500));
              } catch (err) {
                if (err.message.includes("rate limited")) {
                  loadingMessage = await sendMessage("⏳ Rate limit détecté, attente...", loadingMessage);
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              }
          }

          const textVoiceChannels = backupData.channels.filter(
              (c) => c.type === "GUILD_TEXT" || c.type === "GUILD_VOICE"
          );
          
          for (const channelData of textVoiceChannels) {
              try {
                  const permissionOverwrites = [];
                  if (channelData.permissionOverwrites && channelData.permissionOverwrites.length > 0) {
                    for (const overwrite of channelData.permissionOverwrites) {
                      const newTargetId = roleMapping.get(overwrite.id);
                      if (newTargetId) {
                        permissionOverwrites.push({
                          id: newTargetId,
                          allow: BigInt(overwrite.allow),
                          deny: BigInt(overwrite.deny),
                        });
                      }
                    }
                  }
                  
                  const newChannel = await guild.channels.create(channelData.name, {
                      type: channelData.type,
                      position: channelData.position,
                      parent: createdCategories.get(channelData.parent) || null,
                      permissionOverwrites: permissionOverwrites,
                      reason: "Backup restoration"
                  });

                  createdChannels.set(channelData.name, newChannel);
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
              } catch (err) {
                if (err.message.includes("rate limited")) {
                  loadingMessage = await sendMessage("⏳ Rate limit détecté, attente...", loadingMessage);
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              }
          }
          
          await new Promise(resolve => setTimeout(resolve, 5000));
          
        } catch (err) {}

      let emojiSuccess = 0;
let emojiFailed = 0;
try {
  loadingMessage = await sendMessage("🔄 Gestion des emojis...", loadingMessage); 
  
  const existingEmojis = guild.emojis.cache;
  for (const emoji of existingEmojis.values()) {
    if (emoji.deletable) {
      try {
        await emoji.delete("Backup restoration");
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        if (err.message.includes("rate limited") || err.message.includes("rate limit") || err.status === 429) {
          const waitTime = 5000;
          loadingMessage = await sendMessage(`⏳ Rate limit emoji suppression, attente ${waitTime/1000}s...`, loadingMessage);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
  }
  
  for (const [index, emojiData] of backupData.emojis.entries()) {
    let attempts = 0;
    const maxAttempts = 3;
    let created = false;
    
    while (attempts < maxAttempts && !created) {
      try {
        await guild.emojis.create(emojiData.url, emojiData.name, {
          reason: "Backup restoration"
        });
        emojiSuccess++;
        created = true;
        
        const baseDelay = 2000; 
        const progressiveDelay = Math.min(index * 500, 10000); 
        await new Promise(resolve => setTimeout(resolve, baseDelay + progressiveDelay));
        
      } catch (err) {
        attempts++;
        
        if (err.message.includes("rate limited") || err.message.includes("rate limit") || err.status === 429) {
          let waitTime = 60000;
          const match = err.message.match(/retry after (\d+)/i) || 
                       err.message.match(/wait (\d+)/i);
          
          if (match) {
            waitTime = parseInt(match[1]) * 1000 || 60000;
          }
          
          loadingMessage = await sendMessage(
            `⏳ Rate limit emoji (${index + 1}/${backupData.emojis.length}), attente ${waitTime/1000}s...`, 
            loadingMessage
          );
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else { 
          emojiFailed++;
          break;
        }
      }
    }
    
    if (!created && attempts >= maxAttempts) {
      emojiFailed++;
      loadingMessage = await sendMessage(
        `❌ Échec création emoji ${emojiData.name} après ${maxAttempts} tentatives`,
        loadingMessage
      );
    }
  }
} catch (err) {
  console.error("Erreur générale emojis:", err);
}

        try {
          loadingMessage = await sendMessage("🔄 Gestion des stickers...", loadingMessage); 
          
          for (const sticker of guild.stickers.cache.values()) {
            if (sticker.deletable) {
              try {
                await sticker.delete("Backup restoration");
                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (err) {
                if (err.message.includes("rate limited")) {
                  loadingMessage = await sendMessage("⏳ Rate limit détecté, attente...", loadingMessage);
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              }
            }
          }
        } catch (err) {}

        const finalStats = `
# Chargement de la Backup terminée

• **Nom du serveur**: ${backupData.name || "Non changé"}
• **Rôles**: créés avec succès
• **Salons**: créés avec succès  
• **Emojis**: ${emojiSuccess}/${backupData.emojis.length} créés (${emojiFailed} échecs)
• **Stickers**: gestion terminée
        `;

        await loadingMessage.edit(finalStats);

      } catch (err) {
        try {
          const channel = await client.channels.fetch(message.channel.id).catch(() => null);
          if (channel) {
            await channel.send("❌ Erreur lors de la restauration.");
          }
        } catch (e) {}
      }
        
    } else if (args[0] === "general" || args[0] === "géneral" || args[0] === "général" || args[0] === "genéral") {
      await message.delete()
      message.channel.send(`
**📂 Gestion des sauvegardes de serveur :**

\`${pprefix}backup create [server ID]\`  ☆  _Crée une sauvegarde complète du serveur._
\`${pprefix}backup destroy [backup ID]\`  ☆  _Supprime une sauvegarde._
\`${pprefix}backup destroy all\`  ☆  _Supprime toutes vos sauvegardes._
\`${pprefix}backup list\`  ☆  _Affiche la liste des sauvegardes._
\`${pprefix}backup load [backup ID]\`  ☆  _Charge une sauvegarde dans le serveur actuel._
`)

    } else if (args[0] === "list") {
      try {
        const files = await readdirAsync(backupPaths.full);
        
        if (files.length === 0) {
          return await sendMessage("❌ Aucune backup trouvée.");
        }

        const backups = await Promise.all(
          files.map(async file => {
            try {
              const content = await readFileAsync(path.join(backupPaths.full, file), "utf-8");
              const backupData = JSON.parse(content);
              
              const backupDate = backupData.createdAt ? 
                new Date(backupData.createdAt).toLocaleString() : "Date inconnue";
              
              return {
                id: backupData.id || file.split('.')[0],
                name: backupData.name || "Serveur inconnu",
                emojis: backupData.emojis?.length || 0,
                roles: backupData.roles?.length || 0,
                channels: backupData.channels?.length || 0,
                stickers: backupData.stickers?.length || 0,
                date: backupDate
              };
            } catch (err) {
              return {
                id: file.split('.')[0],
                name: "Format invalide",
                emojis: 0, roles: 0, channels: 0, stickers: 0,
                date: "Date inconnue"
              };
            }
          })
        );

const backupList = backups
  .map((backup, index) => 
    `${index + 1} ${backup.name} (ID: \`${backup.id}\`) | ${backup.date}\n` +
    `➤ ${backup.roles} rôles | ${backup.channels} salons | ${backup.emojis} emojis | ${backup.stickers} stickers`
  )
  .join("\n\n");

await sendMessage(
  `📂 Vos backups (${backups.length}):\n\n${backupList}`
);

      } catch (err) {
        await sendMessage("❌ Erreur lors de la lecture des backups.");
      }

    } else if (args[0] === "destroy") {
      if (args[1] === "all") {
        try {
          await rmAsync(backupBasePath, { recursive: true, force: true });
          await sendMessage("✅ Toutes vos backups ont été supprimées.");
        } catch (err) {
          await sendMessage("❌ Erreur lors de la suppression.");
        }
      } else if (!args[1]) {
        try {
          const files = await readdirAsync(backupPaths.full);
          
          if (files.length === 0) {
            return await sendMessage("❌ Aucune backup trouvée.");
          }

          const backupList = files
            .map((file, index) => {
              try {
                const backupData = JSON.parse(fs.readFileSync(path.join(backupPaths.full, file), "utf-8"));
                return `${index + 1} - ${backupData.name || "Serveur inconnu"} (ID: ${backupData.id || file.split('.')[0]})`;
              } catch (err) {
                return `${index + 1} - Format invalide (${file})`;
              }
            })
            .join("\n");

          await sendMessage(
            `Veuillez choisir une backup à supprimer :\`\`\`${backupList}\`\`\``
          );
        } catch (err) {
          await sendMessage("❌ Erreur lors de la lecture des backups.");
        }
      } else {
        const index = parseInt(args[1], 10) - 1;
        
        try {
          const files = await readdirAsync(backupPaths.full);
          
          if (index < 0 || index >= files.length) {
            return await sendMessage("❌ Numéro de backup invalide.");
          }

          await unlinkAsync(path.join(backupPaths.full, files[index]));
          await sendMessage(`✅ La backup "${files[index]}" a été supprimée.`);
        } catch (err) {
          await sendMessage("❌ Erreur lors de la suppression.");
        }
      }

    } else {
      await sendMessage(`
**__✨ Utilisation des commandes de backup ✨__**

- \`${pprefix}backup general\` : Commandes de backup générales	
- \`${pprefix}backupemoji\` : Commandes de backup des emojis		
- \`${pprefix}backupmsg\` : Commandes de backup des messages	
- \`${pprefix}backuprole\` : Commandes de backup des rôles
- \`${pprefix}backupsalon\` : Commandes de backup des salons et catégories`
);
    }
  }
};