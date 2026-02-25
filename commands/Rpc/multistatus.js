const fs = require('fs');
const emojiRegex = require('emoji-regex');
const path = require('path');
const fetch = require('node-fetch');

const multistatusDB = path.resolve(__dirname, './multistatus_db.json');
const MAX_STATUSES = 10;
const MIN_ROTATION_TIME = 30;
const MAX_ROTATION_TIME = 300;

class DatabaseManager {
  constructor() {
    this.db = {};
    this.saving = false;
    this.pendingSave = false;
    this.lastSave = 0;
    this.SAVE_COOLDOWN = 5000;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(multistatusDB)) {
        const content = fs.readFileSync(multistatusDB, 'utf8');
        this.db = JSON.parse(content);
      } else {
        this.db = {};
      }
    } catch (error) {
      console.error('Erreur chargement DB multistatus:', error);
      this.db = {};
    }
  }

  async save() {
    const now = Date.now();
    if (now - this.lastSave < this.SAVE_COOLDOWN) {
      return;
    }

    if (this.saving) {
      this.pendingSave = true;
      return;
    }

    this.saving = true;
    this.lastSave = now;

    try {
      const dir = path.dirname(multistatusDB);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const tempFile = multistatusDB + '.tmp';
      fs.writeFileSync(tempFile, JSON.stringify(this.db, null, 2), 'utf8');
      fs.renameSync(tempFile, multistatusDB);
    } catch (error) {
      console.error('Erreur sauvegarde DB multistatus:', error);
    } finally {
      this.saving = false;
      if (this.pendingSave) {
        this.pendingSave = false;
        setTimeout(() => this.save(), 1000);
      }
    }
  }

  getUserData(userId) {
    if (!this.db[userId]) {
      this.db[userId] = {
        customStatuses: [],
        isActive: false,
        rotationTime: 60,
        currentStatusIndex: 0,
        lastRotation: 0
      };
    }
    return this.db[userId];
  }

  async updateUserData(userId, updates) {
    const userData = this.getUserData(userId);
    Object.assign(userData, updates);
    await this.save();
    return userData;
  }
}

const dbManager = new DatabaseManager();
let rotationIntervals = new Map();

class RotationManager {
  static start(client, userId) {
    this.stop(userId);

    const userData = dbManager.getUserData(userId);

    if (!userData.isActive || userData.customStatuses.length === 0) {
      return;
    }

    const rotationTime = Math.max(MIN_ROTATION_TIME, userData.rotationTime) * 1000;

    const interval = setInterval(() => {
      this.updateStatus(client, userId);
    }, rotationTime);

    rotationIntervals.set(userId, interval);

    this.updateStatus(client, userId);
  }

  static stop(userId) {
    if (rotationIntervals.has(userId)) {
      clearInterval(rotationIntervals.get(userId));
      rotationIntervals.delete(userId);
    }
  }

  static async updateStatus(client, userId) {
    const userData = dbManager.getUserData(userId);

    if (!userData.isActive || userData.customStatuses.length === 0) {
      this.stop(userId);
      return;
    }

    const now = Date.now();
    if (now - userData.lastRotation < 10000) {
      return;
    }

    if (userData.currentStatusIndex >= userData.customStatuses.length) {
      userData.currentStatusIndex = 0;
    }

    const currentStatus = userData.customStatuses[userData.currentStatusIndex];

    try {
      let payload = {};

      const hasText = currentStatus.text?.trim();
      const hasEmoji = currentStatus.emoji;

      if (hasText || hasEmoji) {
        payload.custom_status = {};

        if (hasText) {
          payload.custom_status.text = hasText;
        }

        if (hasEmoji) {
          const customEmojiMatch = hasEmoji.match(/^<a?:(\w+):(\d+)>$/);
          
          if (customEmojiMatch) {
            payload.custom_status.emoji_name = customEmojiMatch[1];
            payload.custom_status.emoji_id = customEmojiMatch[2];
          } else {
            payload.custom_status.emoji_name = hasEmoji;
          }
        }
      } else {
        payload.custom_status = null;
      }

      const response = await fetch('https://discord.com/api/v10/users/@me/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': client.token
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      userData.lastRotation = now;

    } catch (err) {
      console.error("Erreur mise à jour statut:", err); 
      this.stop(userId);
      return;
    }

    const nextIndex = (userData.currentStatusIndex + 1) % userData.customStatuses.length;
    userData.currentStatusIndex = nextIndex;
  }
}

async function startMultiStatus(client) {
  const userId = client.user.id;
  const userData = dbManager.getUserData(userId);

  if (userData.customStatuses && userData.customStatuses.length > 0 && userData.isActive) {
    RotationManager.start(client, userId);
  }
}

module.exports = {
  name: "multistatus",
  description: "Configurer plusieurs statuts personnalisés",
  run: async (client, message, args, prefix) => {
    try {
      const userId = client.user.id;
      const userData = dbManager.getUserData(userId);

      if (!args[0]) {
        return message.edit(`⛧__**RD - MULTISTATUS**__⛧
\`${prefix.prefix}multistatus start\` ➜ **Démarre la rotation**
\`${prefix.prefix}multistatus stop\` ➜ **Arrête la rotation**
\`${prefix.prefix}multistatus add [emoji] [texte]\` ➜ **Ajoute un statut**
\`${prefix.prefix}multistatus remove [index]\` ➜ **Supprime un statut**
\`${prefix.prefix}multistatus remove all\` ➜ **Supprime tous**
\`${prefix.prefix}multistatus list\` ➜ **Liste les statuts**
\`${prefix.prefix}multistatus time [30-300]\` ➜ **Temps rotation (secondes)**`);
      }

      switch (args[0]) {
        case "start": {
          if (userData.customStatuses.length === 0) {
            return message.edit("Aucun statut. Ajoutez-en avec `&multistatus add`.");
          }

          await dbManager.updateUserData(userId, {
            isActive: true,
            currentStatusIndex: 0
          });

          RotationManager.start(client, userId);
          message.edit("Rotation démarrée !");
          break;
        }

        case "stop": {
          await dbManager.updateUserData(userId, { isActive: false });
          RotationManager.stop(userId);

          try {
            await fetch('https://discord.com/api/v10/users/@me/settings', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': client.token
              },
              body: JSON.stringify({
                custom_status: null
              })
            });
          } catch (err) {
            console.error("Erreur suppression statut:", err);
          }

          message.edit("Rotation arrêtée !");
          break;
        }

        case "add": {
          if (userData.customStatuses.length >= MAX_STATUSES) {
            return message.edit(`Limite de ${MAX_STATUSES} statuts atteinte.`);
          }

          const firstArg = args[1];
          let text = args.slice(2).join(' ');

          const isEmoji = firstArg && (
            emojiRegex().test(firstArg) ||
            /^<a?:.+?:\d+>$/g.test(firstArg)
          );

          let finalEmoji = isEmoji ? firstArg : null;

          if (!isEmoji) {
            text = args.slice(1).join(' ');
            finalEmoji = null;
          }

          if (!text && !finalEmoji) {
            return message.edit("Fournissez au moins un emoji ou un texte.");
          }

          userData.customStatuses.push({ emoji: finalEmoji, text });
          await dbManager.save();
          message.edit("Statut ajouté !");
          break;
        }

        case "remove": {
          if (args[1] === "all") {
            if (userData.customStatuses.length === 0) {
              return message.edit("Aucun statut à supprimer.");
            }

            await dbManager.updateUserData(userId, {
              customStatuses: [],
              isActive: false,
              currentStatusIndex: 0
            });

            RotationManager.stop(userId);

            try {
              await fetch('https://discord.com/api/v10/users/@me/settings', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': client.token
                },
                body: JSON.stringify({
                  custom_status: null
                })
              });
            } catch (err) {
              console.error("Erreur suppression statut:", err);
            }

            return message.edit("Tous les statuts supprimés !");
          }

          const index = parseInt(args[1]) - 1;

          if (isNaN(index) || index < 0 || index >= userData.customStatuses.length) {
            return message.edit(`Index invalide (1-${userData.customStatuses.length}).`);
          }

          userData.customStatuses.splice(index, 1);

          let newIndex = userData.currentStatusIndex;
          if (userData.currentStatusIndex >= userData.customStatuses.length) {
            newIndex = 0;
          }
          if (userData.currentStatusIndex > index) {
            newIndex = userData.currentStatusIndex - 1;
          }

          await dbManager.updateUserData(userId, {
            customStatuses: userData.customStatuses,
            currentStatusIndex: newIndex
          });

          if (userData.customStatuses.length === 0) {
            await dbManager.updateUserData(userId, { isActive: false });
            RotationManager.stop(userId);
          }

          message.edit("Statut supprimé !");
          break;
        }

        case "list": {
          if (userData.customStatuses.length === 0) {
            return message.edit("Aucun statut.");
          }

          let statusList = userData.customStatuses
            .map((status, index) => `**${index + 1}** ➜ ${status.emoji || ''} ${status.text || '(vide)'}`)
            .join('\n');

          message.edit(`📋 Statuts (${userData.customStatuses.length}/${MAX_STATUSES}):\n${statusList}`);
          break;
        }

        case "time": {
          const time = parseInt(args[1]);

          if (isNaN(time) || time < MIN_ROTATION_TIME || time > MAX_ROTATION_TIME) {
            return message.edit(`Temps: ${MIN_ROTATION_TIME}-${MAX_ROTATION_TIME} secondes.`);
          }

          await dbManager.updateUserData(userId, { rotationTime: time });

          if (userData.isActive && userData.customStatuses.length > 0) {
            RotationManager.start(client, userId);
          }

          message.edit(`Rotation: ${time} secondes`);
          break;
        }

        default:
          message.edit("Commande invalide. `&multistatus` pour l'aide.");
      }
    } catch (error) {
      console.error("Erreur multistatus:", error);
      message.edit("Erreur");
    }
  }
};

module.exports.startMultiStatus = startMultiStatus;