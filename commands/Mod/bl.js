const fs = require('fs');
const path = require('path');

const blacklistFile = path.join(__dirname, 'blacklist.json');

function ensureBlacklistFile() {
  if (!fs.existsSync(blacklistFile)) fs.writeFileSync(blacklistFile, JSON.stringify({}, null, 2), 'utf8');
}

function readBlacklist() {
  try {
    ensureBlacklistFile();
    const raw = fs.readFileSync(blacklistFile, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.error('Erreur lecture blacklist.json:', err);
    return {};
  }
}

function writeBlacklist(blacklist) {
  try {
    fs.writeFileSync(blacklistFile, JSON.stringify(blacklist, null, 2), 'utf8');
  } catch (err) {
    console.error('Erreur écriture blacklist.json:', err);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUserViaAPI(client, userId) {
  let token = client.token || process.env.BOT_TOKEN;
  if (!token) {
    try {
      const cfg = require('../config.json');
      token = cfg.token || token;
    } catch {}
  }
  if (!token) return null;
  try {
    const res = await global.fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: { Authorization: `Bot ${token}` }
    }).catch(() => null);
    if (!res || !res.ok) return null;
    const data = await res.json();
    const cached = await client.users.fetch(data.id).catch(() => null);
    if (cached) return cached;
    return {
      id: data.id,
      username: data.username,
      discriminator: data.discriminator,
      tag: `${data.username}#${data.discriminator}`,
      avatar: data.avatar || null
    };
  } catch (err) {
    console.error('Erreur fetchUserViaAPI:', err);
    return null;
  }
}

function getBlacklistedIds(blacklist) {
  const ids = Object.keys(blacklist).filter(k => /^\d{17,20}$/.test(k));
  return ids;
}

async function banMemberIfBlacklisted(client, guild, userId, reason) {
  if (!guild.me) {
    await guild.members.fetch(client.user.id).catch(() => null);
  }
  if (!guild.me || !guild.me.permissions.has('BAN_MEMBERS')) return false;
  try {
    const member = await guild.members.fetch(userId, { force: true }).catch(() => null);
    if (member) {
      await member.ban({ reason });
      return true;
    } else {
      await guild.bans.create(userId, { reason });
      return true;
    }
  } catch (err) {
    console.error(`Erreur ban sur guild ${guild.name} (${guild.id}):`, err);
    return false;
  }
}

async function globalBan(client, userId, options = {}) {
  const reason = options.reason || 'Utilisateur blacklisté globalement';
  const user = await fetchUserViaAPI(client, userId).catch(() => null);
  let success = 0;
  let failed = 0;
  for (const guild of client.guilds.cache.values()) {
    const ok = await banMemberIfBlacklisted(client, guild, userId, reason);
    if (ok) success++; else failed++;
    await sleep(100);
  }
  return { success, failed, user };
}

async function banAllBlacklistedMembersInGuild(guild) {
  const blacklist = readBlacklist();
  const ids = getBlacklistedIds(blacklist);

  for (const userId of ids) {
    if (blacklist[userId].addedBy !== guild.client.user.id) continue;
    await banMemberIfBlacklisted(guild.client, guild, userId, 'Blacklist (vérification au démarrage)');
    await sleep(50);
  }
}

module.exports = {
  name: 'bl',
  description: 'Ajoute un utilisateur à la liste noire et le bannit de tous les serveurs du bot',
  usage: '&bl <id>',
  run: async (client, message, args) => {
    try {
      if (!message.member || !message.member.permissions.has('ADMINISTRATOR')) {
        return message.channel.send('🚫 Vous n\'avez pas les autorisations nécessaires pour utiliser cette commande.');
      }
      const userId = args[0];
      if (!userId) return message.channel.send('⚠️ Veuillez spécifier un ID d\'utilisateur à ajouter à la liste noire.');
      const fetchedUser = await fetchUserViaAPI(client, userId);
      const display = fetchedUser ? (fetchedUser.tag || `${fetchedUser.username}#${fetchedUser.discriminator}`) : userId;
      const blacklist = readBlacklist();
      if (blacklist[userId]) return message.channel.send(`⚠️ ${display} est déjà dans la liste noire.`);
      blacklist[userId] = { addedBy: message.author.id, addedAt: new Date().toISOString() };
      writeBlacklist(blacklist);
      await message.channel.send(`✅ ${display} a été ajouté à la liste noire. Tentative de bannissement global en cours...`);
      const result = await globalBan(client, userId, { reason: `Blacklist ajouté par ${message.author.tag} (${message.author.id})` });
      await message.channel.send(`✅ Bannissement global terminé pour ${display} : ${result.success} réussite(s), ${result.failed} échec(s).`);
    } catch (err) {
      console.error('Erreur commande bl :', err);
      return message.channel.send(`❌ Une erreur s'est produite : ${err.message || String(err)}`);
    }
  },

  init: function(client) {
    client.once('ready', async () => {
      const blacklist = readBlacklist();
      const ids = getBlacklistedIds(blacklist);
      if (ids.length === 0) return;
      for (const id of ids) {
        try {
          if (blacklist[id].addedBy !== client.user.id) continue;
          await globalBan(client, id, { reason: 'Blacklist (vérif au démarrage)' });
          await sleep(200);
        } catch (err) {
          console.error('Erreur ban au démarrage pour', id, err);
        }
      }
      for (const guild of client.guilds.cache.values()) {
        await banAllBlacklistedMembersInGuild(guild);
      }
    });

    client.on('guildMemberAdd', async (member) => {
      const blacklist = readBlacklist();
      const ids = getBlacklistedIds(blacklist);
      if (!ids.includes(member.id)) return;
      if (blacklist[member.id].addedBy !== member.client.user.id) return;
      await banMemberIfBlacklisted(member.client, member.guild, member.id, 'Blacklist (guildMemberAdd)');
      await globalBan(member.client, member.id, { reason: 'Blacklist (guildMemberAdd)' });
    });
  },

  globalBan
};
