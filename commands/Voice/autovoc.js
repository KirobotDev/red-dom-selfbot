const { language } = require("../../fonctions");
const sqlDb = require('../../sqlDb');

module.exports = {
  name: "autovoc",
  description: "Rejoindre un salon vocal",
  run: async (client, message, args, db) => {
    const userId = message.author.id;
    const option = args[0]?.toLowerCase();

    if (option === "off") { 
      const userData = await sqlDb.getUserData(userId);
      if (!userData) {
        return message.edit("Erreur: Données utilisateur introuvables.");
      }
       
      if (!userData.voiceconnect || userData.voiceconnect === "0" || userData.voiceconnect === 0) {
        return message.edit("La connexion automatique n'était pas activée.");
      }

      client.ws.broadcast({
        op: 4,
        d: {
          guild_id: null,
          channel_id: null,
          self_mute: false,
          self_deaf: false,
          self_video: false,
          flags: 2,
        },
      });

      await sqlDb.updateUserData(userId, {
        voiceconnect: null,
        voiceowner: null
      });

      return message.edit("Déconnexion effectuée avec succès.");
    }
     
    let targetGuildId = message.guild?.id;
    let targetChannelId = args[0];

    if (!message.guild) {
      if (!targetChannelId) {
        return message.edit(await language(client,
          "En DM, vous devez spécifier l'ID du salon vocal",
          "In DMs, you must specify the voice channel ID"
        ));
      }

      const channel = client.channels.cache.get(targetChannelId);
      if (!channel || channel.type !== "GUILD_VOICE") {
        return message.edit(await language(client,
          "Salon vocal introuvable ou invalide",
          "Voice channel not found or invalid"
        ));
      }

      targetGuildId = channel.guild.id;
    }
 
    const userData = await sqlDb.getUserData(userId);
    if (!userData) {
      return message.edit("Erreur: Données utilisateur introuvables.");
    }

    let channel;
    if (message.guild) {
      channel = message.mentions.channels.first() ||
        client.channels.cache.get(args[0]) ||
        await client.channels.fetch(args[0]).catch(() => null);
    } else {
      channel = client.channels.cache.get(targetChannelId);
    }

    if (!channel || channel.type !== "GUILD_VOICE") {
      return message.edit(await language(client,
        "Veuillez mentionner un salon vocal valide",
        "Please provide a valid voice channel"
      ));
    }

    const selfMute = userData?.voicemute == 1 || userData?.voicemute === true;
    const selfDeaf = userData?.voicedeaf == 1 || userData?.voicedeaf === true;
    const selfVideo = userData?.voicewebcam == 1 || userData?.voicewebcam === true;
    const selfStream = userData?.voicestream == 1 || userData?.voicestream === true;

    client.ws.broadcast({
      op: 4,
      d: {
        guild_id: channel.guildId ?? null,
        channel_id: channel.id,
        self_mute: selfMute,
        self_deaf: selfDeaf,
        self_video: selfVideo,
        flags: 2,
      },
    });

    if (selfStream) {
      client.ws.broadcast({
        op: 18,
        d: {
          type: channel.guild ? 'guild' : 'dm',
          guild_id: channel.guildId ?? null,
          channel_id: channel.id,
          preferred_region: "japan"
        }
      });
    } else {
      client.ws.broadcast({
        op: 19,
        d: { 
          stream_key: `${channel.guildId ? `guild:${channel.guildId}` : 'call'}:${channel.id}:${client.user.id}` 
        }
      });
    }

    await sqlDb.updateUserData(userId, {
      voiceconnect: channel.id,
      voiceowner: userId
    });

    return message.edit(await language(client,
      `Connecté dans : <#${channel.id}>`,
      `Joined channel: <#${channel.id}>`
    ));
  }
};