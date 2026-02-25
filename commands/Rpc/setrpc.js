const { language } = require("../../fonctions");
const { RichPresence } = require('safeness-sb-new');
const sqlDb = require('../../sqlDb'); 

module.exports = {
  name: "setrpc",
  description: "Set Your Rich Presence",
  run: async (client, message, args, db, prefix) => {
    const pprefix = prefix;
    
    try {
      const userId = message.author.id;
      const userData = await sqlDb.getUserData(userId);

      async function rpx(client) {
        const r = new RichPresence(client);
        
        try {
        
          if (!userData.rpctitle || typeof userData.rpctitle !== 'string' || userData.rpctitle.trim() === '') {
            await message.edit("❌ Aucun nom (name) configuré pour le RPC. Utilisez `&setrpc` pour configurer un RPC prédéfini.");
            return;
          }

          if (typeof userData.rpctitle === 'string' && userData.rpctitle.trim() !== '') {
            r.setName(userData.rpctitle.trim());
          }

          if (typeof userData.appid === 'string' && userData.appid.trim() !== '') {
            r.setApplicationId(userData.appid.trim());
          }

          if (typeof userData.rpcdetails === 'string' && userData.rpcdetails.trim() !== '') {
            r.setDetails(userData.rpcdetails.trim());
          }

          if (typeof userData.rpcstate === 'string' && userData.rpcstate.trim() !== '') {
            r.setState(userData.rpcstate.trim());
          }

          const validTypes = ['PLAYING', 'WATCHING', 'LISTENING', 'STREAMING', 'COMPETING'];
          if (typeof userData.rpctype === 'string' && validTypes.includes(userData.rpctype.toUpperCase())) {
            r.setType(userData.rpctype.toUpperCase());
          }

          if (typeof userData.rpcminparty === 'number' && 
              typeof userData.rpcmaxparty === 'number' && 
              userData.rpcmaxparty > 0) {
            r.setParty({ 
              max: Math.max(1, userData.rpcmaxparty),
              current: Math.min(userData.rpcminparty, userData.rpcmaxparty)
            });
          }

          if (userData.rpctime instanceof Date || !isNaN(new Date(userData.rpctime))) {
            r.setStartTimestamp(new Date(userData.rpctime));
          }

          if (typeof userData.rpclargeimage === 'string' && userData.rpclargeimage.trim() !== '') {
            r.setAssetsLargeImage(userData.rpclargeimage.trim());
            if (typeof userData.rpclargeimagetext === 'string' && userData.rpclargeimagetext.trim() !== '') {
              r.setAssetsLargeText(userData.rpclargeimagetext.trim());
            }
          }

          if (typeof userData.rpcsmallimage === 'string' && userData.rpcsmallimage.trim() !== '') {
            r.setAssetsSmallImage(userData.rpcsmallimage.trim());
            if (typeof userData.rpcsmallimagetext === 'string' && userData.rpcsmallimagetext.trim() !== '') {
              r.setAssetsSmallText(userData.rpcsmallimagetext.trim());
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

          if (typeof userData.buttontext1 === 'string' && userData.buttontext1.trim() !== '' && 
              typeof userData.buttonlink1 === 'string' && isValidUrl(userData.buttonlink1)) {
            r.addButton(userData.buttontext1.trim(), userData.buttonlink1);
          }

          if (typeof userData.buttontext2 === 'string' && userData.buttontext2.trim() !== '' && 
              typeof userData.buttonlink2 === 'string' && isValidUrl(userData.buttonlink2)) {
            r.addButton(userData.buttontext2.trim(), userData.buttonlink2);
          }

          client.user.setActivity(r);

        } catch (error) {
          console.error("Une erreur est survenue lors de la configuration du RPC:", error);
          try {
            client.user.setActivity(r);
          } catch (fallbackError) {
            console.error("Erreur lors de la tentative de récupération:", fallbackError);
          }
        }
      }
        
        function loadDefaultRPC() {
  return {
    rpctitle: ".gg/reddom",
    rpctype: "PLAYING",
    rpcdetails: "Best ₷€ł₣₿∅ŧ ever",
    rpcstate: null,
    rpclargeimage: "https://media.discordapp.net/external/2rVfIn02BdSTXfkV9IdIcjz9zxPkzCKSul7i_abjueo/https/i.postimg.cc/vTQvkCLt/image.png?format=png&quality=lossless",
    rpclargeimagetext: null,
    rpcsmallimage: null,
    rpcsmallimagetext: null,
    rpctime: null,
    rpcminparty: 0,
    rpcmaxparty: 0,
    rpcbuttontext1: null,
    rpcbuttonlink1: null,
    rpcbuttontext2: null,
    rpcbuttonlink2: null,
    appid: null
  };
}

      async function setDefaultLargeImageIfEmpty() {
        if (!userData.rpclargeimage || !userData.rpclargeimagetext) { 
          const defaultUserData = await sqlDb.getUserData('default');
          
          const defaultLargeImage = defaultUserData.rpclargeimage || 'default_large_image';
          const defaultLargeImageText = defaultUserData.rpclargeimagetext || 'Default Large Image';
          
          await sqlDb.updateUserData(userId, {
            rpclargeimage: userData.rpclargeimage || defaultLargeImage,
            rpclargeimagetext: userData.rpclargeimagetext || defaultLargeImageText
          });
          
          Object.assign(userData, {
            rpclargeimage: userData.rpclargeimage || defaultLargeImage,
            rpclargeimagetext: userData.rpclargeimagetext || defaultLargeImageText
          });
          
          rpx(client);
        }
      }

      await setDefaultLargeImageIfEmpty();

      if (args[0] === "list") {
        message.edit(await language(client, `
__**Rich Presence Settings**__
\`${pprefix}setrpc apple\` ➜ **Apple Music RPC**
\`${pprefix}setrpc apex\` ➜ **Apex Legends RPC**
\`${pprefix}setrpc bs\` ➜ **Brawl Stars RPC**
\`${pprefix}setrpc capcut\` ➜ **Capcut RPC**
\`${pprefix}setrpc clear\` ➜ **Clear the RPC**
\`${pprefix}setrpc cod\` ➜ **Warzone RPC**
\`${pprefix}setrpc codm\` ➜ **Call Of Duty Mobile RPC**
\`${pprefix}setrpc coldwar\` ➜ **Cold War RPC**
\`${pprefix}setrpc destiny\` ➜ **Destiny 2 RPC**
\`${pprefix}setrpc disney+ [text]\` ➜ **Disney+ RPC**
\`${pprefix}setrpc fallguys\` ➜ **Fall Guys RPC**
\`${pprefix}setrpc fifa23 [text]\` ➜ **FIFA 23 RPC**
\`${pprefix}setrpc fivem\` ➜ **FiveM RPC**
\`${pprefix}setrpc fortnite\` ➜ **Fortnite RPC**
\`${pprefix}setrpc gmod\` ➜ **Garry's Mod RPC**
\`${pprefix}setrpc gta6\` ➜ **GTA VI RPC**
\`${pprefix}setrpc kali [text]\` ➜ **Kali Linux RPC**
\`${pprefix}setrpc league\` ➜ **League of Legends RPC**
\`${pprefix}setrpc minecraft\` ➜ **Minecraft RPC**
\`${pprefix}setrpc netflix [text]\` ➜ **Netflix RPC**
\`${pprefix}setrpc ph [text]\` ➜ **Pornhub RPC**
\`${pprefix}setrpc photoshop [text]\` ➜ **Photoshop RPC**
\`${pprefix}setrpc python\` ➜ **Python RPC**
\`${pprefix}setrpc roblox\` ➜ **Roblox RPC**
\`${pprefix}setrpc rocketleague\` ➜ **Rocket League RPC**
\`${pprefix}setrpc soundcloud\` ➜ **Soundcloud RPC**
\`${pprefix}setrpc tiktok [text]\` ➜ **TikTok RPC**
\`${pprefix}setrpc twitch\` ➜ **Twitch RPC**
\`${pprefix}setrpc ubereats [text]\` ➜ **Uber Eats RPC**
\`${pprefix}setrpc valorant\` ➜ **VALORANT RPC**
\`${pprefix}setrpc vsc\` ➜ **Visual Studio Code RPC**
\`${pprefix}setrpc wattpad [text]\` ➜ **Wattpad RPC**
\`${pprefix}setrpc youtube [text]\` ➜ **YouTube RPC**
`, `
⛧__**Rich Presence Settings**__⛧
\`${pprefix}setrpc apple\` ➜ **Apple Music RPC**
\`${pprefix}setrpc apex\` ➜ **Apex Legends RPC**
\`${pprefix}setrpc capcut\` ➜ **Capcut RPC**
\`${pprefix}setrpc clear\` ➜ **Clear the RPC**
\`${pprefix}setrpc cod\` ➜ **Warzone RPC**
\`${pprefix}setrpc coldwar\` ➜ **Cold War RPC**
\`${pprefix}setrpc destiny\` ➜ **Destiny 2 RPC**
\`${pprefix}setrpc disney+ [text]\` ➜ **Disney+ RPC**
\`${pprefix}setrpc fallguys\` ➜ **Fall Guys RPC**
\`${pprefix}setrpc fifa23 [text]\` ➜ **FIFA 23 RPC**
\`${pprefix}setrpc fivem\` ➜ **FiveM RPC**
\`${pprefix}setrpc fortnite\` ➜ **Fortnite RPC**
\`${pprefix}setrpc gmod\` ➜ **Garry's Mod RPC**
\`${pprefix}setrpc gta6\` ➜ **GTA VI RPC**
\`${pprefix}setrpc kali [text]\` ➜ **Kali Linux RPC**
\`${pprefix}setrpc league\` ➜ **League of Legends RPC**
\`${pprefix}setrpc netflix [text]\` ➜ **Netflix RPC**
\`${pprefix}setrpc ph [text]\` ➜ **Pornhub RPC**
\`${pprefix}setrpc photoshop [text]\` ➜ **Photoshop RPC**
\`${pprefix}setrpc python\` ➜ **Python RPC**
\`${pprefix}setrpc roblox\` ➜ **Roblox RPC**
\`${pprefix}setrpc rocketleague\` ➜ **Rocket League RPC**
\`${pprefix}setrpc soundcloud\` ➜ **Soundcloud RPC**
\`${pprefix}setrpc tiktok [text]\` ➜ **TikTok RPC**
\`${pprefix}setrpc twitch\` ➜ **Twitch RPC**
\`${pprefix}setrpc ubereats [text]\` ➜ **Uber Eats RPC**
\`${pprefix}setrpc valorant\` ➜ **VALORANT RPC**
\`${pprefix}setrpc vsc\` ➜ **Visual Studio Code RPC**
\`${pprefix}setrpc wattpad [text]\` ➜ **Wattpad RPC**
\`${pprefix}setrpc youtube [text]\` ➜ **YouTube RPC**
`));
      }
        
      else if (!args[0]) {
        const defaultDB = loadDefaultRPC();

        db.rpctitle = "Red Dom";
        db.rpctype = defaultDB.rpctype || "PLAYING";
        db.rpcdetails = defaultDB.rpcdetails || null;
        db.rpcstate = defaultDB.rpcstate || null;
        db.rpclargeimage = defaultDB.rpclargeimage || "https://media.discordapp.net/attachments/1233833065768550441/1274853775039008838/Picsart_24-08-19_00-13-25-425.jpg?ex=671e1259&is=671cc0d9&hm=45dbce777e2f603583601284e215df0a5b51e7880a67d055deb1d6d5940712cf&=&format=webp&width=473&height=473";
        db.rpcsmallimage = defaultDB.rpcsmallimage;
        db.rpcsmallimagetext = defaultDB.rpcsmallimagetext || null;
        db.rpclargeimagetext = defaultDB.rpclargeimagetext || null;
        db.rpctime = defaultDB.rpctime || null;
        db.rpcminparty = defaultDB.rpcminparty || 0;
        db.rpcmaxparty = defaultDB.rpcmaxparty || 0;
        db.rpcbuttontext1 = defaultDB.rpcbuttontext1;
        db.rpcbuttonlink1 = defaultDB.rpcbuttonlink1;
        db.rpcbuttontext2 = defaultDB.rpcbuttontext2;
        db.rpcbuttonlink2 = defaultDB.rpcbuttonlink2;

        sqlDb.updateUserData(userId, db);
        message.edit(await language(client, "RPC reset to default.", "Le RPC a été réinitialisé aux valeurs par défaut."));
        rpx(client);
      }

      else if (args[0] === "clear") { 
        client.user.setPresence({ activities: [] });
        db.rpctitle = "";
        db.rpctype = "";
        db.rpcdetails = "";
        db.rpcstate = "";
        db.rpcsmallimage = "";
        db.rpcsmallimagetext = "";
        db.rpclargeimagetext = "";
        db.rpcminparty = 0;
        db.rpcmaxparty = 0;
        db.rpcbuttontext1 = "";
        db.rpcbuttonlink1 = "";
        db.rpcbuttontext2 = "";
        db.rpcbuttonlink2 = "";
        db.webhooklogs = null
        setTimeout(() => {
            
        sqlDb.updateUserData(userId, db);
      }, 3000);
    
        await message.edit(await language(client, "RPC cleared and disabled.", "Le RPC a été supprimé et désactivé."));
    }
    
    
    

      else if (args[0] === "league") {
        db.rpctitle = "League of Legends";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Summoner's Rift (Ranked)";
        db.rpcminparty = 5;
        db.rpcmaxparty = 5;
        db.rpcstate = "In Lobby, Ready to Play!";
        db.rpclargeimage = "https://media.discordapp.net/external/HafkFr_XFTQ291Xm4gQl3E_1sz4ZfYD1dcOlRECQHxg/https/i.postimg.cc/6qxM7006/Sans-titre-removebg-preview3.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous jouez maintenant à League of Legends.")
      }

      else if (args[0] === "apex") {
        db.rpctitle = "Apex Legends";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Battle Royale";
        db.rpcminparty = 1;
        db.rpcmaxparty = 3;
        db.rpcstate = "Surviving the Apex Games";
        db.rpclargeimage = "https://media.discordapp.net/external/ipsZhCbDegIJoqrktREYmAnEAu8ZdGS3GY8nFBTjnXo/https/i.postimg.cc/RZQ1Y5wv/Sans-titre-removebg-preview2.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous jouez maintenant à Apex Legends.")

      }

            else if (args[0] === "roblox") {
        db.rpctitle = "Roblox";
        db.rpctype = "PLAYING";
        db.rpcdetails = "";
        db.rpcminparty = 1;
        db.rpcmaxparty = 3;
        db.rpcstate = "";
        db.rpclargeimage = "https://media.discordapp.net/attachments/1451148130006335548/1453149655088107601/7a57746a2dbee0b3e077862d7faa5f89.webp?ex=694c6693&is=694b1513&hm=98b6b51be37aa097e1eccf146425d1bc8e1f11122ad200be78728218398d27a4&";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous jouez maintenant à Roblox.");

      }

      else if (args[0] === "rocketleague") {
        db.rpctitle = "Rocket League";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Playing in Competitive";
        db.rpcminparty = 1;
        db.rpcmaxparty = 4;
        db.rpcstate = "Boosting to Victory!";
        db.rpclargeimage = "https://media.discordapp.net/external/5UBv5rtR68W2iFfTPGSHzgWjEp0KNFMWWPAgCIjKDDo/https/i.postimg.cc/h4fkRMCk/image-removebg-preview3.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
     await message.edit("Le RPC a été modifié : Vous jouez maintenant à Rocket League.")

      }


            else if (args[0] === "gta6") {
              db.rpctitle = "Grand Theft Auto VI"; 
              db.rpctype = "PLAYING"; 
              db.rpcdetails = "Exploring Vice City"; 
              db.rpcminparty = 1; 
              db.rpcmaxparty = 5; 
              db.rpcstate = "On a heist!";              
              db.rpclargeimage = "https://media.discordapp.net/external/o_-8K806WIemxvTszVc40WadX8ubE9VU-481WpsslO4/https/i.postimg.cc/vm7DpL5X/Sans-titre.jpg?format=webp";
              db.rpcsmallimage = null;
              db.rpctime = Date.now();
              db.rpcsmallimagetext = null;
              db.rpclargeimagetext = null;
              db.webhooklogs = null
              setTimeout(() => {
              sqlDb.updateUserData(userId, db);
              rpx(client);
            }, 4000);
           await message.edit("Le RPC a été modifié : Vous jouez maintenant à GTA VI.")
      
            }
        
        else if (args[0] === "minecraft") {
  db.rpctitle = "Minecraft"; 
  db.rpctype = "PLAYING"; 
  db.rpcdetails = "Mining and Crafting"; 
  db.rpcminparty = 1; 
  db.rpcmaxparty = 10; 
  db.rpcstate = "Building a castle!";              
  db.rpclargeimage = "https://media.discordapp.net/external/Y0YfvS8coJxtqJ4kupn8WSxSqXnUuxY8oISD7VC6LGw/https/i.postimg.cc/NjCM2HX9/images-removebg-preview-2.png";
  db.rpcsmallimage = null;
  db.rpctime = Date.now();
  db.rpcsmallimagetext = null;
  db.rpclargeimagetext = null;
  db.webhooklogs = null;
  
  setTimeout(() => {
    sqlDb.updateUserData(userId, db);
    rpx(client);
  }, 4000);

 await message.edit("Le RPC a été modifié : Vous jouez maintenant à Minecraft.");
}
        
                else if (args[0] === "bs") {
  db.rpctitle = "Brawl Stars"; 
  db.rpctype = "PLAYING"; 
  db.rpcdetails = "Brawl Ball in Survival"; 
  db.rpcminparty = 1; 
  db.rpcmaxparty = 10; 
  db.rpcstate = "Collecting gems";              
  db.rpclargeimage = "https://media.discordapp.net/external/n73F1WHxpS_7t4zCJ9IVoLlSzDIfzmVYUBzRQVe5fX0/https/i.postimg.cc/J76Rwn8c/bs-icon-1600.webp?width=901&height=676";
  db.rpcsmallimage = null;
  db.rpctime = Date.now();
  db.rpcsmallimagetext = null;
  db.rpclargeimagetext = null;
  db.webhooklogs = null;
  
  setTimeout(() => {
    sqlDb.updateUserData(userId, db);
    rpx(client);
  }, 4000);

 await message.edit("Le RPC a été modifié : Vous jouez maintenant à Brawl Stars.");
}
        
   else if (args[0] === "codm") {
  db.rpctitle = "Call Of Duty Mobile"; 
  db.rpctype = "PLAYING"; 
  db.rpcdetails = "Battle Royale"; 
  db.rpcminparty = 1; 
  db.rpcmaxparty = 6; 
  db.rpcstate = "Destroying the lobby";              
  db.rpclargeimage = "https://media.discordapp.net/external/Z1bodobjUz8cHxvq09Z2wWWvKuQbIjfrTzyDgseY3a4/https/i.postimg.cc/pVhPHvLw/6634c76a8912fa14aa41fc61-CODM-1920x1936-1.webp?width=670&height=676";
  db.rpcsmallimage = null;
  db.rpctime = Date.now();
  db.rpcsmallimagetext = null;
  db.rpclargeimagetext = null;
  db.webhooklogs = null;
  
  setTimeout(() => {
    sqlDb.updateUserData(userId, db);
    rpx(client);
  }, 4000);

  await message.edit("Le RPC a été modifié : Vous jouez maintenant à Call Of Duty Mobile.");
}


      else if (args[0] === "seaofthieves") {
        db.rpctitle = "Sea of Thieves";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Sailing the oceans";
        db.rpcminparty = 1;
        db.rpcmaxparty = 4;
        db.rpcstate = "In the middle of battle!";
        db.rpclargeimage = "https://media.discordapp.net/external/YvNwsouT6t38gvK_kyo4XFn7BBXnDaFz5ekPGJEzlkk/https/i.postimg.cc/cHX0kHLf/Sans-titre.jpg";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous jouez maintenant à Sea of Thieves.")

      }

      else if (args[0] === "fallguys") {
        db.rpctitle = "Fall Guys";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Trying to Win the Crown";
        db.rpcminparty = 1;
        db.rpcmaxparty = 60;
        db.rpcstate = "Running through obstacles";
        db.rpclargeimage = "https://media.discordapp.net/external/KGnL2LjVl-_u6Ou0Sx1MTgm1QfAC2PrrjPywSNPwTP8/https/i.postimg.cc/5yQ9HJfv/image-removebg-preview2.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous jouez maintenant à Fall Guys.")

      }
        
        
      else if (args[0] === "valorant") {
        db.rpctitle = "VALORANT";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Defusing the Spike";
        db.rpcminparty = 1;
        db.rpcmaxparty = 5;
        db.rpcstate = "Valorant Competitive";
        db.rpclargeimage = "https://media.discordapp.net/external/IIKGSCZV2JqJbsg5UwYtkDm_0Z2Lf5UlircYLyzbIHM/https/i.postimg.cc/NfJh3SYv/ggzX8PZ.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous jouez maintenant à VALORANT.")

      }

      else if (args[0] === "destiny") {
        db.rpctitle = "Destiny 2";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Exploring the Galaxy";
        db.rpcminparty = 1;
        db.rpcmaxparty = 6;
        db.rpcstate = "Chasing the Darkness";
        db.rpclargeimage = "https://media.discordapp.net/external/LGSWpTq25KYyGwIsQRPRp2JbQborK5K8IVFEhkQr2Ro/https/i.postimg.cc/CLHCdp59/image-remove-QDbg-preview.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous jouez maintenant à Destiny 2.")

      }

      else if (args[0] === "twitch") {
        db.rpctitle = "Twitch";
        db.rpctype = "STREAMING";
        db.rpcdetails = "Streaming live on Twitch";
        db.rpcstate = "Come and Watch!";
        db.rpclargeimage = "https://media.discordapp.net/external/fiJsqsF3TEeQxeUzP6nw5kojPxwHYA--ZpH2XclwfIE/https/i.postimg.cc/brvPbh8L/Sans-titre.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous streamez maintenant sur Twitch.")

      }

      else if (args[0] === "cod") {
        db.rpctitle = "Call of Duty: Warzone";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Battling in Verdansk";
        db.rpcminparty = 1;
        db.rpcmaxparty = 4;
        db.rpcstate = "Victory Awaits";
        db.rpclargeimage = "https://media.discordapp.net/external/FcgP_8pyoF5diKLWzbQYQnst-sX3_UJ5o9MBCIdwSoQ/https/i.postimg.cc/MG43tJyd/eee.jpg";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous jouez maintenant à Call of Duty: Warzone.")

      }

      else if (args[0] === "coldwar") {
        db.rpctitle = "Call of Duty: Cold War";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Fighting in the Cold War";
        db.rpcminparty = 1;
        db.rpcmaxparty = 6;
        db.rpcstate = "In the Heat of Battle";
        db.rpclargeimage = "https://media.discordapp.net/external/clJTZs-gga54LnyvFkDZnLVBLKzkDpluENjOftQ93FU/https/i.postimg.cc/3JvGD5R3/eeeee.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous jouez maintenant à Call of Duty: Cold War.")

      }

      else if (args[0] === "tiktok") {
        const text = args.slice(1).join(" ") || "Watching TikTok";
        db.rpctitle = "TikTok";
        db.rpctype = "WATCHING";
        db.rpcdetails = text;
        db.rpcstate = "Trending Videos";
        db.rpclargeimage = "https://media.discordapp.net/external/71ElosSGmiIV6Y_drYJHQlTc2bkMIdy3ImKHUMrqN-Y/https/i.postimg.cc/bwvsH7YG/Logo-tiktok-png-sans-fond.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      message.edit(`Le RPC a été modifié : Vous regardez maintenant TikTok.`)

      }

      else if (args[0] === "youtube") {
        const text = args.slice(1).join(" ") || "Watching YouTube";
        db.rpctitle = "YouTube";
        db.rpctype = "WATCHING";
        db.rpcdetails = text;
        db.rpcstate = "Enjoying Videos";
        db.rpclargeimage = "https://media.discordapp.net/external/1dl-v9lVSvmKC7vH-WrAHgmKnrbmkOvFHdj5KfeSKQ8/https/i.postimg.cc/5NCP9rWC/youtube-logo-youtube-logo-transparent-youtube-icon-transparent-free-free-png.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      message.edit(`Le RPC a été modifié : Vous regardez maintenant YouTube.`)

      }

      else if (args[0] === "fortnite") {
        db.rpctitle = "Fortnite";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Building and Battling";
        db.rpcminparty = 1;
        db.rpcmaxparty = 4;
        db.rpcstate = "Surviving the Island";
        db.rpclargeimage = "https://media.discordapp.net/external/wRqN0I5FlZ23YTc39lwp2jG-Q6SNqoSRc8mypGWbHoI/https/i.postimg.cc/htqqKx6K/Fortnite-F-lettermark-logo.png";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous jouez maintenant à Fortnite.")

      }

      else if (args[0] === "photoshop"){
        db.rpctitle = "Photoshop",
        db.rpctype = "PLAYING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = "Edtiting : " + args.slice(1).join(' ') || "SPEED.psd",
        db.rpcstate = "On Photoshop",
        db.rpclargeimage = "https://media.discordapp.net/external/7jO4QijsBWLxt8pD8SIO5Zrqrtx4XzlDwuYKHWG-fUM/https/i.postimg.cc/rwWxr6fS/AUDTuxS.png",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit("The state of the RPC has been edited and you are on Photoshop.")

      }

      else if (args[0] === "kali"){
        db.rpctitle = "KALI LINUX",
        db.rpctype = "PLAYING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = "Terminal : " + args.slice(1).join(' ') || "RD",
        db.rpcstate = "On Kali Linux",
        db.rpclargeimage = "https://media.discordapp.net/external/9ae5qlZdqyONDvYsqX7jwNBv2L_dcDiM0-tgQBwPkXk/https/i.postimg.cc/c4G3wxbX/zzz.png",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)  
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu es sur LINUX.", "The state of the RPC has been edited and you are on LINUX.")

      }
        
              else if (args[0] === "soundcloud"){
        db.rpctitle = "SOUNDCLOUD",
        db.rpctype = "LISTENING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = args.slice(1).join(' ') || "Écoute de la musique sur SoundCloud",
        db.rpcstate = null,
        db.rpclargeimage = "https://media.discordapp.net/external/Nr775a-yYgTGqJ1JZcXsEoWHpy2UE28vZNf_XBYnzQQ/https/i.postimg.cc/X71N9R4b/soundcloud.avif?format=webp",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)  
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu es sur Soundcloud.", "The state of the RPC has been edited and you are on Soundcloud.")

      }
        
                      else if (args[0] === "apple"){
        db.rpctitle = "APPLE MUSIC",
        db.rpctype = "LISTENING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = args.slice(1).join(' ') || "Écoute de la musique sur Apple Music",
        db.rpcstate = null,
        db.rpclargeimage = "https://media.discordapp.net/external/jT94huWjLvaRRBJbhHO-Sb-CTNdL9ROmhzksjPwxY9I/https/i.postimg.cc/WbdcchLB/unnamed.png",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)  
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu es sur Apple Music.", "The state of the RPC has been edited and you are on Apple Music.")

      }


      else if (args[0] === "netflix"){
        db.rpctitle = "Netflix",
        db.rpctype = "WATCHING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = args.slice(1).join(' ') || "",
        db.rpcstate = "S1:E1 #1774",
        db.rpclargeimage = "https://media.discordapp.net/external/6QtYMUROy6XdTxhaS7DOx4fVB4F62JLrLJYmNTQpWIo/https/i.postimg.cc/4yfgRh3W/Sans-titre-removebg-preview4.png",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit(`Le status du RPC a été modifié et tu regardes ${args[1]} sur Netflix.`, `The state of the RPC has been edited and you watching ${args[1]} on Netflix.`)

      }

      else if (args[0] === "wattpad") {
        db.rpctitle = "Wattpad",
        db.rpctype = "WATCHING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = `En train d'écrire ${args.slice(1).join(' ') || "une nouvelle histoire"}`,
        db.rpcstate = "Mode inspiration ✍️",
        db.rpclargeimage = "https://media.discordapp.net/external/dLlWilRj5PjMxcuMAyMaBu5kz1s50WH7Tw80wS8SQpQ/https/i.postimg.cc/8zf3h7h2/whatsapp-image-2022-11-23-at-19-24-58-637e294808a8b52be86f5322.jpg?format=webp",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null,
        db.webhooklogs = null;
        
        setTimeout(() => {
         sqlDb.updateUserData(userId, db);
          rpx(client);
        }, 4000);
        
        message.edit(
          `Le statut du RPC a été modifié et tu écris ${args[1]} sur Wattpad.`, 
          `The state of the RPC has been edited and you're writing ${args[1]} on Wattpad.`
        );
      }
      
      
      else if (args[0] === "vsc"){
        db.rpctitle = "Code",
        db.rpctype = "PLAYING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = `In ${client.user.username} - 0 problems found`,
        db.rpcstate = "Working on" + args.slice(1).join(' ') || "SPEED.js" + "17:74",
        db.rpclargeimage = "https://media.discordapp.net/external/xU06XJVubv8ADA-XzJI9AoYo5hmSgAQEk8F-XvX7b3A/https/i.postimg.cc/tgjvcGJ5/dafq.png",
        db.rpcsmallimage = "",
        db.rpcsmallimagetext = "Visual Studio Code",
        db.rpclargeimagetext = "Editing a JS file"
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu joues a VSC.", "The state of the RPC has been edited and you playing VSC.")

      }

      else if (args[0] === "fivem"){
        db.rpctitle = "FiveM",
        db.rpctype = "PLAYING",
        db.rpcdetails = `Playing on ${client.user.username} RP `,
        db.rpcminparty = 1774,
        db.rpcmaxparty = 2048,
        db.rpcstate = "#1774",
        db.rpctime = Date.now(),
        db.rpclargeimage = "https://media.discordapp.net/external/I7AUZRw1uZNKjeZasvlOJLc4ZZr8Qa4E6TETafRcJMo/https/i.postimg.cc/28nK7586/Five-M-Logo.png",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu joues a FiveM.", "The state of the RPC has been edited and you playing FiveM.")

      }

      else if (args[0] === "python"){
        db.rpctitle = "Code",
        db.rpctype = "PLAYING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = `In ${client.user.username} - 0 problems found`,
        db.rpcstate = "Working on" + args.slice(1).join(' ') || "SPEED.js" + "17:74",
        db.rpclargeimage = "https://media.discordapp.net/external/ouu_-PmoQO-cNJSCtKV9Q6RwdCxJg2yEQdngwnPMHEY/https/i.postimg.cc/rsZFh991/Sans-titre-removebg-preview5.png",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = "Editing a PY file"
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu dev en PY.", "The state of the RPC has been edited and you dev on PY.")

      }

      else if (args[0] === "gmod"){
        db.rpctitle = "Garry's Mod",
        db.rpctype = "PLAYING",
        db.rpcdetails = `In ${client.user.username} - Best Server 👑`,
        db.rpcstate = null,
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpclargeimage = "https://media.discordapp.net/external/HWh0eOlXVLVNt-Vu-crmebkjmDo1binh0czlrr0rHtI/https/i.postimg.cc/zXN9MhQW/s.png",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu joues a Gmod.", "The state of the RPC has been edited and you playing Gmod.")

      }
      
      else if (args[0] === "ph"){
        db.rpctitle = "PornHub",
        db.rpctype = "WATCHING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = args.slice(1).join(' ') || "K3S SUCK SPEED",
        db.rpcstate = "On Pornhub",
        db.rpclargeimage = "https://media.discordapp.net/external/OadxbKLIe3yEP82qQeMkKOMIZjiJJ8iDBf9s-Uy1NgU/https/i.postimg.cc/1RFKFYJc/Symbole-Pornhub.jpg",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu es sur PornHub.", "The state of the RPC has been edited and you are on PornHub.")

      }

      else if (args[0] === "disney+"){
        db.rpctitle = "Disney+",
        db.rpctype = "WATCHING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = args.slice(1).join(' ') || "",
        db.rpcstate = "On Disney+",
        db.rpclargeimage = "https://media.discordapp.net/external/IZxS5kGq-o7iRbCKytbiRHPQy6MwmPiIjiIa6tY90nk/https/i.postimg.cc/43t3PtMM/Parsifal-Parsifal-il-caso-Disney-Plus-1.jpg",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu es sur Disney+.", "The state of the RPC has been edited and you are on Disney+.")

      }

      else if (args[0] === "fifa23"){
        db.rpctitle = "FC 24",
        db.rpctype = "PLAYING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = args.slice(1).join(' ') || "",
        db.rpcstate = "#EA",
        db.rpclargeimage = "https://media.discordapp.net/external/3XYGbpLUlVzemZtdau3XE2wGTvAW5I6qMhAMJQF9wEc/https/i.postimg.cc/Fs8m6zjQ/5-logo-a9he-300.webp",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu es sur FIFA23.", "The state of the RPC has been edited and you are on FIFA23.")

      }

      else if (args[0] === "ubereats"){
        db.rpctitle = "UBER EATS",
        db.rpctype = "WATCHING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = args.slice(1).join(' ') || null,
        db.rpcstate = "On Uber Eats",
        db.rpclargeimage = "https://media.discordapp.net/external/flNwjEJVHZDMAMrCZMiIs6RQz3YIcA6ecMsk3tJGL4Q/https/i.postimg.cc/15GhvB5D/ddddddd.png",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = null
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu es sur Uber Eats.", "The state of the RPC has been edited and you are on Uber Eats.")

      }

      else if (args[0] === "darkweb"){
        db.rpctitle = "DARK WEB",
        db.rpctype = "PLAYING",
        db.rpcminparty = 0,
        db.rpcmaxparty = 0,
        db.rpctime = Date.now(),
        db.rpcdetails = args.slice(1).join(' ') || null,
        db.rpcstate = "Watching your house",
        db.rpclargeimage = "https://media.discordapp.net/external/TXWEP4Rv_iGTVHWa3-SpnoxyR5sXCCTLhad-gQgKlgQ/https/i.postimg.cc/YS4ds2fT/dd.png",
        db.rpcsmallimage = null,
        db.rpcsmallimagetext = null,
        db.rpclargeimagetext = "Hacker"
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client)
      }, 4000);
      message.edit("Le status du RPC a été modifié et tu es sur le Dark Web.", "The state of the RPC has been edited and you are on the Dark Web.")

      }

      else if (args[0] === "capcut") {
        db.rpctitle = "Capcut";
        db.rpctype = "PLAYING";
        db.rpcdetails = "Finalise un montage";
        db.rpcminparty = 1;
        db.rpcmaxparty = 1;
        db.rpcstate = "En collab";
        db.rpclargeimage = "https://media.discordapp.net/external/vNVMswGVYQVLoehyvIJ_aAPB4onQu0SgAQcNMyIz6lo/https/i.postimg.cc/XNBBvdXP/13948546-logo-capcut-sur-fond-blanc-transparent-gratuit-vectoriel-removebg-preview.png?format=webp&quality=lossless&width=473&height=473";
        db.rpcsmallimage = null;
        db.rpctime = Date.now();
        db.rpcsmallimagetext = null;
        db.rpclargeimagetext = null;
        db.webhooklogs = null
        setTimeout(() => {
        sqlDb.updateUserData(userId, db);
        rpx(client);
      }, 4000);
      await message.edit("Le RPC a été modifié : Vous faites un montage sur Capcut.")

      }

} catch (error) {
    console.error("Erreur dans la commande setrpc :", error);
}
  }  
}