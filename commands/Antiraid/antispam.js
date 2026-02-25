const fs = require("fs");
const { language, savedb } = require("../../fonctions");

const loadDb = (filePath) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }
  return {};
};

const saveDb = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const path = require('path');

const dbFilePath = path.resolve(__dirname, './antispamserv.json');

let antiSpamDb = loadDb(dbFilePath);
const spamUsers = new Map();

module.exports = {
  name: "antispam",
  description: "Activer / Désactiver la fonction anti-spam",
  run: async (client, message, args) => {
    const guildId = message.guild.id;

    try {
      if (!args[0] || (args[0] !== "on" && args[0] !== "off")) {
        return message.edit(await language(client, `Utilisez \`antispam on\` ou \`antispam off\`.`, `Use \`antispam on\` or \`antispam off\``));
      }

      if (args[0] === "on") {
        antiSpamDb[guildId] = { enabled: true, mutedUsers: {} };
        saveDb(dbFilePath, antiSpamDb);
        message.edit(await language(client, "L'anti-spam a été activé", "The anti-spam has been activated"));

        client.on("messageCreate", async (msg) => {
          if (!antiSpamDb[guildId]?.enabled || msg.author.bot) return;

          const userId = msg.author.id;
          const now = Date.now();

          if (antiSpamDb[guildId].mutedUsers[userId]) {
            const muteEndTime = antiSpamDb[guildId].mutedUsers[userId];
            if (now >= muteEndTime) {
              delete antiSpamDb[guildId].mutedUsers[userId];
              saveDb(dbFilePath, antiSpamDb);
              return;
            } else {
              return; 
            }
          }

          if (!spamUsers.has(userId)) {
            spamUsers.set(userId, { count: 0, firstMessageTime: now });
          }

          const userData = spamUsers.get(userId);
          userData.count += 1;

          if (userData.count >= 10 && (now - userData.firstMessageTime) <= 5000) {
            const mutedRole = message.guild.roles.cache.find(role => role.name === "Muted");

            if (!mutedRole) {
              await message.guild.roles.create({
                name: "Muted",
                permissions: [],
              }).then(role => {
                message.guild.channels.cache.forEach(channel => {
                  channel.permissionOverwrites.create(role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SPEAK: false,
                  });
                });
              });
            }

            const member = message.guild.members.cache.get(userId);
            if (member) {
              await member.roles.add(mutedRole);
              message.channel.send(`**${msg.author.username}** a été muté pour spam pendant 1 jour.`);

              const muteEndTime = now + 86400000;
              antiSpamDb[guildId].mutedUsers[userId] = muteEndTime;
              saveDb(dbFilePath, antiSpamDb);

              spamUsers.delete(userId);
            }
          }

          if (now - userData.firstMessageTime > 5000) {
            spamUsers.delete(userId);
          }
        });

      } else {
        delete antiSpamDb[guildId];
        saveDb(dbFilePath, antiSpamDb);
        message.edit(await language(client, "L'anti-spam a été désactivé", "The anti-spam has been deactivated"));

        spamUsers.clear(); 
      }

    } catch (e) {
      console.error("Error in antispam command:", e);
    }
  }
};
