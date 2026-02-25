const fs = require('fs').promises;
const path = require('path');
const { CustomStatus, RichPresence, SpotifyRPC } = require('safeness-sb-new');
const { setupAntiGroup } = require('../../commands/Group/antigroup.js');
const groupModule = require('../../commands/Group/group.js');
const sqlDb = require('../../sqlDb');

let isInitialized = false;
let refreshInterval = null;

async function setBotStatusViaAPI(client, status) {
    try {
        const response = await fetch('https://discord.com/api/v10/users/@me/settings', {
            method: 'PATCH',
            headers: {
                'Authorization': `${client.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        if (status === "online") {
            client.user.setPresence({
                status: 'online',
                activities: []
            });
        }
        
        return true;
    } catch (error) { 
        
        try {
            client.user.setStatus(status);
            return true;
        } catch (fallbackError) { 
            return false;
        }
    }
}

process.on('unhandledRejection', (reason, promise) => {
  if (reason.code === 'ERR_UNHANDLED_ERROR' && reason.context && reason.context.kError) {
    if (reason.context.kError.message.includes('WebSocket was closed')) {
      return;
    }
  }
  
  if (reason.code === 200000 && reason.httpStatus === 400) { 
    return;
  }
  
  console.error('Problème dans le ready    :', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  if (error.code === 'ERR_UNHANDLED_ERROR' && error.context && error.context.kError) {
    if (error.context.kError.message.includes('WebSocket was closed')) {
      return;
    }
  }
  
  if (error.code === 200000 && error.httpStatus === 400) { 
    return;
  }
  
  console.error('Problème dans le ready    :', error);
});

async function initUserData(userId) {
  try {
    const userData = await sqlDb.getUserData(userId);
    return userData;
  } catch (err) {
    console.error('Erreur initUserData:', err);
    return {};
  }
}

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const isValidImage = (img) => {
    return typeof img === 'string' && img.trim() !== '';
};

async function safeEditMessage(message, content) {
  try {
    await message.edit(content);
    return true;
  } catch (error) {
    if (error.code === 200000 && error.httpStatus === 400) { 
      return false;
    }
    throw error;
  }
}

async function setupPresence(client, db) {
  if (db.status) {
      let statusToSet = db.status;
      if (statusToSet === "onl") statusToSet = "online";
      if (statusToSet === "inv") statusToSet = "invisible";
      await setBotStatusViaAPI(client, statusToSet);
  }

  const activities = [];

  try {
    await client.user.setPresence({ activities: [] });
  } catch (err) { 
  }

  if (String(db.spotifyonoff).toLowerCase() === 'on') {
    try {
      const hasSpotifyContent = db.spotifysongname || db.spotifyartists;
      
      if (hasSpotifyContent) {
        const spotifyActivity = new SpotifyRPC(client)
          .setDetails(db.spotifysongname || 'Ecoute de la musique')
          .setState(db.spotifyartists || 'Artiste inconnu')
          .setStartTimestamp(Date.now())
          .setEndTimestamp(Date.now() + (db.spotifyendtimestamp || 180000));

        if (db.spotifylargeimage) spotifyActivity.setAssetsLargeImage(db.spotifylargeimage);
        if (db.spotifyalbumname) spotifyActivity.setAssetsLargeText(db.spotifyalbumname);
        if (db.spotifysmallimage) spotifyActivity.setAssetsSmallImage(db.spotifysmallimage);

        activities.push(spotifyActivity);
      }
    } catch (err) {
      console.error('Spotify RPC Error', err);
    }
  }

  if (!db.streaming || String(db.streaming).toLowerCase() === 'off') {
    if (String(db.rpconoff).toLowerCase() === 'on') {
        try {
            if (db.rpctitle && typeof db.rpctitle === 'string' && db.rpctitle.trim()) {
                const rpc = new RichPresence(client);
                rpc.setName(db.rpctitle.trim());

                if (typeof db.rpcdetails === 'string' && db.rpcdetails.trim()) {
                    rpc.setDetails(db.rpcdetails.trim());
                }

                if (typeof db.rpcstate === 'string' && db.rpcstate.trim()) {
                    rpc.setState(db.rpcstate.trim());
                }
                
                if (db.appid) rpc.setApplicationId(db.appid);

                if (typeof db.rpcminparty === 'number' && 
                    typeof db.rpcmaxparty === 'number' && 
                    db.rpcmaxparty > 0) {
                    rpc.setParty({
                        max: db.rpcmaxparty,
                        current: db.rpcminparty
                    });
                }

                if (db.rpctime) {
                    rpc.setStartTimestamp(db.rpctime);
                }

                try {
                    if (db.rpclargeimage && isValidImage(db.rpclargeimage)) {
                        rpc.setAssetsLargeImage(db.rpclargeimage);
                        if (db.rpclargeimagetext) {
                            rpc.setAssetsLargeText(db.rpclargeimagetext);
                        }
                    }

                    if (db.rpcsmallimage && isValidImage(db.rpcsmallimage)) {
                        rpc.setAssetsSmallImage(db.rpcsmallimage);
                        if (db.rpcsmallimagetext) {
                            rpc.setAssetsSmallText(db.rpcsmallimagetext);
                        }
                    }
                } catch (imageError) {
                    console.error("Erreur d image RPC:", imageError);
                }

                try {
                    if (db.buttontext1 && db.buttonlink1 && isValidUrl(db.buttonlink1)) {
                        rpc.addButton(db.buttontext1, db.buttonlink1);
                    }
                    if (db.buttontext2 && db.buttonlink2 && isValidUrl(db.buttonlink2)) {
                        rpc.addButton(db.buttontext2, db.buttonlink2);
                    }
                } catch (buttonError) {
                    console.error("Erreur de bouton RPC:", buttonError);
                }

                if (db.rpctype && ['PLAYING', 'WATCHING', 'STREAMING', 'LISTENING', 'COMPETING'].includes(db.rpctype)) {
                    rpc.setType(db.rpctype);
                }

                if (db.rpcplatform && ['xbox', 'ps5', 'desktop'].includes(db.rpcplatform)) {
                    rpc.setPlatform(db.rpcplatform);
                }

                activities.push(rpc);
            }
        } catch (err) {
            console.error('Erreur du RPC', err);
        }
    }
  } else {
    if (String(db.rpconoff).toLowerCase() === 'on') {
        try {
            if (db.rpctitle && typeof db.rpctitle === 'string' && db.rpctitle.trim()) {
                const rpcActivity = new RichPresence(client);
                rpcActivity.setName(db.rpctitle);
                
                if (db.rpcdetails) rpcActivity.setDetails(db.rpcdetails);
                if (db.rpcstate) rpcActivity.setState(db.rpcstate);
                
                if (db.appid) {
                    const appId = db.appid.toString().replace(/\D/g, '');
                    if (appId.length > 0) rpcActivity.setApplicationId(appId);
                }
                
                const activityTypes = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'];
                if (db.rpctype && activityTypes.includes(db.rpctype.toUpperCase())) {
                    rpcActivity.setType(db.rpctype.toUpperCase());
                }
                
                if (db.rpctype && db.rpctype.toUpperCase() === "STREAMING" && db.twitch) {
                    rpcActivity.setURL(db.twitch);
                } else {
                    if (db.buttontext1 && db.buttonlink1 && isValidUrl(db.buttonlink1)) {
                        rpcActivity.addButton(db.buttontext1, db.buttonlink1);
                    }
                    if (db.buttontext2 && db.buttonlink2 && isValidUrl(db.buttonlink2)) {
                        rpcActivity.addButton(db.buttontext2, db.buttonlink2);
                    }
                }
                
                if (db.rpcminparty && db.rpcmaxparty) {
                    rpcActivity.setParty({ 
                        max: db.rpcmaxparty, 
                        current: db.rpcminparty 
                    });
                }
                
                if (db.rpctype && db.rpctype.toUpperCase() === "STREAMING") {
                } else {
                    if (db.rpctime) {
                        rpcActivity.setStartTimestamp(new Date(db.rpctime).getTime());
                    } else {
                        rpcActivity.setStartTimestamp(Date.now());
                    }
                }
                
                if (db.rpclargeimage && isValidImage(db.rpclargeimage)) {
                    rpcActivity.setAssetsLargeImage(db.rpclargeimage);
                    if (db.rpclargeimagetext) {
                        rpcActivity.setAssetsLargeText(db.rpclargeimagetext);
                    }
                }

                if (db.rpcsmallimage && isValidImage(db.rpcsmallimage)) {
                    rpcActivity.setAssetsSmallImage(db.rpcsmallimage);
                    if (db.rpcsmallimagetext) {
                        rpcActivity.setAssetsSmallText(db.rpcsmallimagetext);
                    }
                }

                if (db.rpcplatform && ['xbox', 'ps5', 'desktop'].includes(db.rpcplatform)) {
                    rpcActivity.setPlatform(db.rpcplatform);
                }

                activities.push(rpcActivity);
            }
        } catch (err) {
            console.error('Erreur du RPC', err);
        }
    }
  }
 
  if (activities.length > 0) {
    try {
      await client.user.setPresence({ activities }); 
    } catch (err) { 
    }
  } else {
    if (db.status) {
        const statusToSet = db.status === "onl" ? "online" : 
                          db.status === "inv" ? "invisible" : db.status;
        await setBotStatusViaAPI(client, statusToSet);
    }
  }
}

async function setupVoiceConnection(client, db) {
  if (!db.voiceconnect) return;

  try {
    const channel = client.channels.cache.get(db.voiceconnect);
    if (!channel || channel.type !== "GUILD_VOICE") { 
      return;
    }
 
    const permissions = channel.permissionsFor(client.user);
    if (!permissions?.has('CONNECT') || !permissions?.has('SPEAK')) { 
      return;
    }

    const selfMute = db?.voicemute == 1 || db?.voicemute === true;
    const selfDeaf = db?.voicedeaf == 1 || db?.voicedeaf === true;
    const selfVideo = db?.voicewebcam == 1 || db?.voicewebcam === true;
    const selfStream = db?.voicestream == 1 || db?.voicestream === true;
 
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
    
  } catch (err) { 
  }
}

async function cleanupVoiceConnection(client) {
  try { 

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
  } catch (err) { 
  }
}

module.exports = {
  name: 'ready',
  once: true,
  run: async (client) => {
    try {

      setupAntiGroup(client);
      setTimeout(async () => {
        if (groupModule.initializeLockIntervals) { 
            groupModule.setClientInstance?.(client);
            await groupModule.initializeLockIntervals(); 
          }
      }, 5000);
    } catch (error) {
      console.error('Erreur lors du chargement de la base de donnees:', error);
    }
    
    try {
      const userId = client.user.id;
      await initUserData(userId); 
      const db = await sqlDb.getUserData(userId);  

      console.log(client.user.tag + ' connecte avec succes');
       
      await cleanupVoiceConnection(client); 

      if (db.status) {
          let statusToSet = db.status;
          if (statusToSet === "onl") statusToSet = "online";
          if (statusToSet === "inv") statusToSet = "invisible";
          await setBotStatusViaAPI(client, statusToSet);
      }
       
      await setupPresence(client, db); 
      await setupVoiceConnection(client, db);
      
    } catch (error) {
      console.error('Erreur critique (' + client.user.tag + '):', error);
    }
 
    client.on('disconnect', async () => {
      await cleanupVoiceConnection(client);
    });
  }
};

process.on('SIGINT', () => {
  if (refreshInterval) {
    clearInterval(refreshInterval); 
  }
  process.exit(0);
});
 
module.exports.setupPresence = setupPresence;
module.exports.safeEditMessage = safeEditMessage;
module.exports.setBotStatusViaAPI = setBotStatusViaAPI;