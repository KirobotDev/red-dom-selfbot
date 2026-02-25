const fetch = global.fetch;
const { language } = require("../../fonctions");

module.exports = {
  name: "userinfo",
  description: "Display the info of a user",
  run: async (client, message, args) => {
    try {
      let user;

      if (message.mentions.users.first()) {
        user = message.mentions.users.first();
      } else if (args[0]) {
        let userId = args[0].replace(/[<@!>]/g, '');
        
        if (userId) {
          user = client.users.cache.get(userId);
          
          if (!user) {
            try {
              user = await client.users.fetch(userId);
            } catch (fetchError) {}
          }
          
          if (!user) {
            for (const guild of client.guilds.cache.values()) {
              try {
                const member = await guild.members.fetch(userId).catch(() => null);
                if (member) {
                  user = member.user;
                  break;
                }
              } catch (guildError) {}
            }
          }
          
          if (!user) {
            const searchTerm = args[0].toLowerCase();
            const foundUser = client.users.cache.find(u =>
              (u.username && u.username.toLowerCase().includes(searchTerm)) ||
              (u.tag && u.tag.toLowerCase().includes(searchTerm))
            );
            
            if (foundUser) {
              user = foundUser;
            }
          }
          
          if (!user) {
            try {
              const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
                headers: { Authorization: `Bot ${client.token}` }
              });
              
              if (response.ok) {
                const data = await response.json();
                try {
                  user = await client.users.fetch(data.id, { force: true });
                } catch {
                  user = {
                    id: data.id,
                    username: data.username,
                    discriminator: data.discriminator,
                    tag: `${data.username}#${data.discriminator}`,
                    createdTimestamp: null,
                    displayAvatarURL: () => `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar || "default"}.png`
                  };
                }
              }
            } catch (e) {}
          }
        }
      } else {
        user = message.author;
      }

      if (!user) return message.channel.send("Aucun utilisateur trouvé.");

      let bannerURL = "Pas de bannière";
      let avatarDecorationURL = "Pas de décoration d'avatar";
      let avatarDecorationName = "Aucun"; 
      let nameplateURL = "Pas de nameplate";
      let profileData = null;
      
      try { 
        const guildId = message.guild ? message.guild.id : "0";
        const profileResponse = await fetch(`https://discord.com/api/v9/users/${user.id}/profile?type=popout&with_mutual_guilds=true&with_mutual_friends=true&with_mutual_friends_count=false&guild_id=${guildId}`, {
          headers: { 
            Authorization: `${client.token}`,
            'Accept-Language': 'fr'
          } 
        }); 
        
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          
          if (profileData.user) { 
            if (profileData.user.banner) {
              const bannerFormat = profileData.user.banner.startsWith("a_") ? "gif" : "png";
              bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${profileData.user.banner}.${bannerFormat}?size=4096`;
            }
             
            if (profileData.user.avatar_decoration_data) {
              const decorationData = profileData.user.avatar_decoration_data;
              
              if (decorationData.asset) { 
                avatarDecorationURL = `https://cdn.discordapp.com/avatar-decoration-presets/${decorationData.asset}.png?size=256&passthrough=false`;
                 
                if (decorationData.sku_id) {
                  try {
                    const collectibleResponse = await fetch(`https://discord.com/api/v9/collectibles-products/${decorationData.sku_id}?locale=fr`, {
                      headers: { 
                        Authorization: `${client.token}`,
                        'Accept-Language': 'fr'
                      }
                    });
                    
                    if (collectibleResponse.ok) {
                      const collectibleData = await collectibleResponse.json();
                      
                      if (collectibleData.items && collectibleData.items.length > 0) {
                        if (collectibleData.items[0].title) {
                          avatarDecorationName = collectibleData.items[0].title;
                        }
                        if (collectibleData.items[0].thumbnailPreviewSrc) {
                          avatarDecorationURL = collectibleData.items[0].thumbnailPreviewSrc;
                        }
                      }
                    }
                  } catch (e) {}
                }
              }
            }
            
            if (profileData.user.collectibles && profileData.user.collectibles.nameplate) {
              const nameplateData = profileData.user.collectibles.nameplate; 
              
              if (nameplateData.sku_id) {
                try {
                  const nameplateCollectibleResponse = await fetch(`https://discord.com/api/v9/collectibles-products/${nameplateData.sku_id}?locale=fr`, {
                    headers: { 
                      Authorization: `${client.token}`,
                      'Accept-Language': 'fr'
                    }
                  });
                  
                  if (nameplateCollectibleResponse.ok) {
                    const nameplateCollectibleData = await nameplateCollectibleResponse.json();
                    
                    if (nameplateCollectibleData.items && nameplateCollectibleData.items.length > 0) { 
                      if (nameplateCollectibleData.items[0].thumbnailPreviewSrc) {
                        nameplateURL = nameplateCollectibleData.items[0].thumbnailPreviewSrc;
                      } else if (nameplateCollectibleData.items[0].imageSrc) {
                        nameplateURL = nameplateCollectibleData.items[0].imageSrc;
                      } else if (nameplateCollectibleData.items[0].previewVideoSrc) {
                        nameplateURL = nameplateCollectibleData.items[0].previewVideoSrc;
                      }
                    }
                  }
                } catch (e) {}
              }
              
              if (nameplateURL === "Pas de nameplate" && nameplateData.asset) {
                const assetPath = nameplateData.asset;
                
                if (assetPath.includes('nameplates/')) {
                  const cleanPath = assetPath.replace(/\/$/, '');
                  const parts = cleanPath.split('/');
                  const themeName = parts[parts.length - 1];
                  
                  nameplateURL = `https://cdn.discordapp.com/assets/collectibles/nameplates/nameplates/${themeName}/static.png`;
                }
              }
            }
          }
        }
      } catch (e) {}

      let daysSinceCreation = "Inconnu";
      if (user.createdTimestamp) {
        daysSinceCreation = Math.floor((Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24));
      }

      const mutualGuilds = client.guilds.cache.filter(g => g.members.cache.has(user.id));
      const mutualList = mutualGuilds.size > 0 ? mutualGuilds.map(g => g.name).slice(0, 100).join(", ") : "Aucun serveur en commun";

      let guildInfo = "";
      if (message.guild) {
        let member = message.guild.members.cache.get(user.id);
        if (!member) member = await message.guild.members.fetch(user.id).catch(() => null);
        if (member) {
          guildInfo = 
`> Serveur actuel: ${message.guild.name}
> Rejoint le: <t:${Math.round(member.joinedTimestamp / 1000)}> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)
> Rôles: ${member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.name).join(", ") || "Aucun rôle"}`;
        }
      }

      let additionalMessage = "";
      if (!user.createdTimestamp) {
        additionalMessage = `\nPour plus d'infos, ouvrez vos dm avec <@${user.id}> puis refaites la commande ici`;
      }

      const infoMessage = await language(
        client,
        `
☆__**RD - Userinfo**__☆
> Tag: ${user.tag || user.username}
> User ID: ${user.id}
> Date de création: ${user.createdTimestamp ? `<t:${Math.round(user.createdTimestamp / 1000)}> (<t:${Math.round(user.createdTimestamp / 1000)}:R>)` : "Inconnu"}
> Jours depuis la création: ${daysSinceCreation}
> Photo de profil: ${user.displayAvatarURL ? user.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }) : "Pas de photo de profil"} 
> Décoration d'avatar: ${avatarDecorationName !== "Aucun" ? avatarDecorationName : ""} ${avatarDecorationURL !== "Pas de décoration d'avatar" ? `${avatarDecorationURL}` : ""}
> Nameplate: ${nameplateURL !== "Pas de nameplate" ? `${nameplateURL}` : ""}
> Bannière: ${bannerURL}
> Serveurs en commun : ${mutualList}
${guildInfo}${additionalMessage}
        `
      );

      await message.channel.send(infoMessage);

    } catch (error) {
      console.error("Erreur lors de l'exécution de la commande userinfo :", error);
      await message.channel.send("Une erreur s'est produite lors de la récupération des informations.");
    }
  },
};