const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { Client, Collection, RichPresence, SpotifyRPC } = require("safeness-sb-new");
const multistatus = require("../Rpc/multistatus");
const antigroup = require("../Group/antigroup");
const { loadGlobalDb } = require("../../fonctions");

const platformSettings = {
  mobile: {
    os: 'Android',
    browser: 'Discord Android',
    release_channel: 'stable',
    client_version: '12345',
    os_version: '11',
    os_arch: 'arm64',
    system_locale: 'en-US',
    client_build_number: 200000,
    native_build_number: 30000,
    client_event_source: null,
    design_id: 0,
  },
  desktop: {
    os: 'Windows',
    browser: 'Discord Client',
    release_channel: 'stable',
    client_version: '1.0.9011',
    os_version: '10.0.22621',
    os_arch: 'x64',
    system_locale: 'en-US',
    client_build_number: 175517,
    native_build_number: 29584,
    client_event_source: null,
    design_id: 0,
  },
  web: {
    os: 'Linux',
    browser: 'Discord Web',
    release_channel: 'stable',
    client_version: '1.0.9011',
    os_version: '',
    os_arch: '',
    system_locale: 'en-US',
    client_build_number: 175517,
    native_build_number: 29584,
    client_event_source: null,
    design_id: 0,
  }
};

async function restartUser(userId, token, clientsArray) {
  try {
    const globalDb = await loadGlobalDb();
    const db = globalDb[userId] || {};
    const platform = db.platform || "desktop";
    const wsProps = platformSettings[platform];

    const client = new Client({
      checkUpdate: false,
      autoRedeemNitro: true,
      ws: {
        properties: wsProps,
      }
    });
      
    await client.login(token);
    client.token = token;

    client.userId = userId;
    client.commands = new Collection();
    client.snipes = new Map();
    client.setMaxListeners(0);

    const eventsPath = path.join(__dirname, "../../events/client");
    if (fs.existsSync(eventsPath)) {
      const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));
      
      for (const file of eventFiles) {
        try {
          const eventPath = path.join(eventsPath, file);
          delete require.cache[require.resolve(eventPath)];
          
          const event = require(eventPath);
          if (event.name) {
            if (event.once) {
              client.once(event.name, (...args) => event.run(...args, client));
            } else {
              client.on(event.name, (...args) => event.run(...args, client));
            }
          }
        } catch (error) {
          console.error(chalk.red(`Erreur lors du chargement de l'événement ${file}:`), error);
        }
      }
    }

    const commandsBasePath = path.join(__dirname, "..");
    const commandDirs = fs.readdirSync(commandsBasePath).filter(dir => 
      fs.statSync(path.join(commandsBasePath, dir)).isDirectory()
    );

    for (const dir of commandDirs) {
      const dirPath = path.join(commandsBasePath, dir);
      const commandFiles = fs.readdirSync(dirPath).filter(file => file.endsWith(".js"));
      
      for (const file of commandFiles) {
        try {
          const commandPath = path.join(dirPath, file);
          delete require.cache[require.resolve(commandPath)];
          
          const command = require(commandPath);
          if (command.name && !client.commands.has(command.name)) {
            client.commands.set(command.name, command);
          }
        } catch (error) {
          console.error(chalk.red(`Erreur lors du chargement de la commande ${file}:`), error);
        }
      }
    }

    setTimeout(async () => {
      try {
        await multistatus.startMultiStatus(client);
      } catch (error) {
        console.error(chalk.red('Erreur lors du démarrage du multistatus:'), error);
      }

      try {
        await antigroup.setupAntiGroup(client);
      } catch (error) {
        console.error(chalk.red('Erreur lors du démarrage de l\'antigroup:'), error);
      }

      try {
        const activities = [];

        if (db.rpconoff === true || db.rpconoff === 'on') {
          try {
            const hasRPC = db.rpctitle || db.rpcdetails || db.rpcstate || db.rpclargeimage || db.rpcsmallimage;
            if (hasRPC) {
              const rpc = new RichPresence(client);

              if (db.rpctitle) rpc.setName(db.rpctitle);
              if (db.rpcdetails) rpc.setDetails(db.rpcdetails);
              if (db.rpcstate) rpc.setState(db.rpcstate);
              if (db.rpctype) rpc.setType(db.rpctype.toUpperCase());
              if (db.appid) rpc.setApplicationId(db.appid);

              if (db.rpclargeimage) rpc.setAssetsLargeImage(db.rpclargeimage);
              if (db.rpclargeimagetext) rpc.setAssetsLargeText(db.rpclargeimagetext);
              if (db.rpcsmallimage) rpc.setAssetsSmallImage(db.rpcsmallimage);
              if (db.rpcsmallimagetext) rpc.setAssetsSmallText(db.rpcsmallimagetext);

              if (db.buttontext1 && db.buttonlink1) rpc.addButton(db.buttontext1, db.buttonlink1);
              if (db.buttontext2 && db.buttonlink2) rpc.addButton(db.buttontext2, db.buttonlink2);

              if (db.rpctime) rpc.setStartTimestamp(new Date(db.rpctime));
              if (db.rpcminparty || db.rpcmaxparty) {
                rpc.setParty(db.rpcminparty || 1, db.rpcmaxparty || 1);
              }

              activities.push(rpc);
            }
          } catch (rpcError) {
            console.error(chalk.red('Erreur lors du rechargement du RPC:'), rpcError);
          }
        }

        if (db.spotifyonoff === true || db.spotifyonoff === 'on') {
          try {
            const hasSpotify = db.spotifysongname || db.spotifyartists || db.spotifyalbumname || db.spotifydetails;
            if (hasSpotify) {
              const spotify = new SpotifyRPC(client);

              if (db.spotifysongname) spotify.setDetails(db.spotifysongname);
              if (db.spotifyartists) spotify.setState(db.spotifyartists);
              if (db.spotifyalbumname) spotify.setAssetsLargeText(db.spotifyalbumname);
              if (db.spotifydetails) spotify.setAssetsSmallText(db.spotifydetails);

              if (db.spotifylargeimage) spotify.setAssetsLargeImage(db.spotifylargeimage);
              if (db.spotifysmallimage) spotify.setAssetsSmallImage(db.spotifysmallimage);

              const start = Date.now();
              const end = db.spotifyendtimestamp ? start + db.spotifyendtimestamp : start + 180000;
              spotify.setStartTimestamp(start).setEndTimestamp(end);

              activities.push(spotify);
            }
          } catch (spotifyError) {
            console.error(chalk.red('Erreur lors du rechargement de Spotify:'), spotifyError);
          }
        }

        if (activities.length > 0) {
          await client.user.setPresence({ activities });
        }

      } catch (error) {
        console.error(chalk.red('Erreur lors du rechargement des activités:'), error);
      }
    }, 5000);

    if (clientsArray && Array.isArray(clientsArray)) {
      clientsArray.push(client);
    }

    return client;

  } catch (error) {
    console.error(chalk.red(`[RESTART] Échec de reconnexion ${userId}:`), error);
    throw error;
  }
}

module.exports = restartUser;