const { language } = require("../../fonctions");

module.exports = {

  name: "mod",

  description: "Menu Mod",

  run: async (client, message, args, db, prefix) => {

    const content = await language(client, 
      `** **                          ♫︎ __**RD - Modération**__ ♫︎

- **Commandes Role**

\`${prefix}addrole\` ➜ **Ajoute un rôle à un membre**  
\`${prefix}clearperms\` ➜ **Désactive la totalité des permissions dangereuses présentes sur le serveur (rôles, administrateur)**  
\`${prefix}createrole [nom] [nombre]\` ➜ **Créer un rôle avec les permissions que vous choisissez**  
\`${prefix}delrole\` ➜ **Supprime un rôle d'un serveur**  
\`${prefix}delrole all\` ➜ **Supprime tout les rôles d'un serveur**  
\`${prefix}derank\` ➜ **Enlève tout les roles d'un membre**  
\`${prefix}massremove\` ➜ **Enlève un rôle à tous les membres d'un serveur**  
\`${prefix}massrole\` ➜ **Ajoute un rôle à tous les membres d'un serveur**  
\`${prefix}removerole\` ➜ **Enlève un rôle à un utilisateur**  

- **Commandes Pseudos**

\`${prefix}nick @user (pseudo)\` ➜ **Renommer un membre**  
\`${prefix}nickall (pseudo)\` ➜ **Renommer tout les membres**  
\`${prefix}unnick @user\` ➜ **Réinitialiser le pseudo d'un membre**  
\`${prefix}unnickall\` ➜ **Réinitialiser le pseudo de tout les membres**  

- **Commandes Action** 

\`${prefix}admin @user\` ➜ **Créer un rôle admin et le met à l'utilisateur que vous avez mentionné**  
\`${prefix}ban\` ➜ **Bannir un membre**  
\`${prefix}banall\` ➜ **Bannir tous les membres**  
\`${prefix}banlist\` ➜ **Montre les membres bannis d'un serveur**  
\`${prefix}deban\` ➜ **Révoquer le bannissement d'un membre**  
\`${prefix}debanall\` ➜ **Révoquer le bannissement de tous les membres**  
\`${prefix}delete [texte] [nombre]\` ➜ **Supprime un nombre de messages (avec filtre optionnel)**  
\`${prefix}deleteuser [@user] [nombre]\` ➜ **Supprime un nombre de messages d'un utilisateur**  
\`${prefix}delsalon (id/mention)\` ➜ **Supprime un salon**
\`${prefix}kick\` ➜ **Kick un membre**  
\`${prefix}kickall\` ➜ **Kick tous les membres**  
\`${prefix}kickbots\` ➜ **Expulse tous les bots du serveur**  
\`${prefix}mute ([time])\` ➜ **Empêche un membre de parler dans tous les salons**  
\`${prefix}mutelist\` ➜ **Montre la liste des personnes muettes pour un serveur**  
\`${prefix}suppr\` ➜ **Supprime tous les messages d'une personne sur un serveur**  
\`${prefix}unmute\` ➜ **Rétablit la voix d'un membre**  
\`${prefix}warn\` ➜ **Donne un avertissement à un utilisateur (à 3 avertissements il se fait bannir du serveur)**  
\`${prefix}warnlist\` ➜ **Montre la liste des personnes warn pour un serveur**  
\`${prefix}unwarn\` ➜ **Enlève un avertissement**  

- **Commandes divers**

\`${prefix}addemoji\` ➜ **Ajouter un emoji sur le serveur**  
\`${prefix}delemoji\` ➜ **Supprimer un emoji sur le serveur**  
\`${prefix}delemoji all\` ➜ **Supprimer tout les emojis sur le serveur**  
\`${prefix}hide\` ➜ **Masquer un salon**  
\`${prefix}unhide\` ➜ **Révéler le salon masqué précédemment**  

- **Commandes Salon**

\`${prefix}createsalon (nom)\` ➜ **Créer un salon**  
\`${prefix}delcategory (id category\` ➜ **Détruis une catégorie (et ses salons avec)**  
\`${prefix}delcategory all\` ➜ **Détruis toutes les catégories**  
\`${prefix}delsalon (id du salon)\` ➜ **Détruis un salon**  
\`${prefix}delsalon all\` ➜ **Détruis tout les salons**  
\`${prefix}lock\` ➜ **Lock un salon**  
\`${prefix}permc\` ➜ **Change les dérogations de everyone pour un salon**  
\`${prefix}renew\` ➜ **Recréé le salon demandé (utilisable uniquement sur un serveur)**  
\`${prefix}unlock\` ➜ **Unlock un salon**  

- **Commandes Black list**  
*(Les membres blacklistés seront bannis de tous les serveurs où vous avez la permission de bannir un membre)*

\`${prefix}bl\` ➜ **Ajouter un membre dans la Black list**  
\`${prefix}unbl\` ➜ **Enlever un membre de la Black list**

      `,`** **                          ♫︎ __**RD - Moderation**__ ♫︎

- **Role Commands**

\`${prefix}addrole\` ➜ **Add a role to a member**  
\`${prefix}clearperms\` ➜ **Disable all dangerous permissions present on the server (roles, administrator)**  
\`${prefix}createrole [name] [number]\` ➜ **Create a role with the permissions you choose**  
\`${prefix}delrole\` ➜ **Remove a role from a server**  
\`${prefix}delrole all\` ➜ **Remove all roles from a server**  
\`${prefix}derank\` ➜ **Remove all roles from a member**  
\`${prefix}massremove\` ➜ **Remove a role from all members of a server**  
\`${prefix}massrole\` ➜ **Add a role to all members of a server**  
\`${prefix}removerole\` ➜ **Remove a role from a user**  

- **Nickname Commands**

\`${prefix}nick @user (nickname)\` ➜ **Rename a member**  
\`${prefix}nickall (nickname)\` ➜ **Rename all members**  
\`${prefix}unnick @user\` ➜ **Reset a member's nickname**  
\`${prefix}unnickall\` ➜ **Reset all members' nicknames**  

- **Action Commands**

\`${prefix}admin @user\` ➜ **Create an admin role and assign it to the mentioned user**  
\`${prefix}ban\` ➜ **Ban a member**  
\`${prefix}banall\` ➜ **Ban all members**  
\`${prefix}banlist\` ➜ **Show banned members of a server**  
\`${prefix}deban\` ➜ **Unban a member**  
\`${prefix}debanall\` ➜ **Unban all members**  
\`${prefix}delete [text] [number]\` ➜ **Delete a number of messages (with optional filter)**  
\`${prefix}deleteuser [@user] [number]\` ➜ **Delete a number of messages from a user**  
\`${prefix}delsalon (id/mention)\` ➜ **Remove a channel**
\`${prefix}kick\` ➜ **Kick a member**  
\`${prefix}kickall\` ➜ **Kick all members**  
\`${prefix}kickbots\` ➜ **Kick all bots from the server**  
\`${prefix}mute ([time])\` ➜ **Mute a member in all channels**  
\`${prefix}mutelist\` ➜ **Show the list of muted members for a server**  
\`${prefix}suppr\` ➜ **Delete all messages from a person in a server**  
\`${prefix}unmute\` ➜ **Unmute a member**  
\`${prefix}warn\` ➜ **Give a warning to a user (3 warnings will get them banned from the server)**  
\`${prefix}warnlist\` ➜ **Show the list of warned members for a server**  
\`${prefix}unwarn\` ➜ **Remove a warning**  

- **Miscellaneous Commands**

\`${prefix}addemoji\` ➜ **Add an emoji to the server**  
\`${prefix}delemoji\` ➜ **Remove an emoji from the server**  
\`${prefix}delemoji all\` ➜ **Remove all emojis from the server**  
\`${prefix}hide\` ➜ **Hide a channel**  
\`${prefix}unhide\` ➜ **Unhide a previously hidden channel**  

- **Channel Commands**

\`${prefix}createsalon (name)\` ➜ **Create a channel**  
\`${prefix}delsalon (channel id)\` ➜ **Remove a channel**  
\`${prefix}delsalon all\` ➜ **Remove all channels**  
\`${prefix}lock\` ➜ **Lock a channel**  
\`${prefix}permc\` ➜ **Change the permissions for everyone in a channel**  
\`${prefix}renew\` ➜ **Recreate the requested channel (only usable on a server)**  
\`${prefix}unlock\` ➜ **Unlock a channel**  

- **Blacklist Commands**  
*(Blacklisted members will be banned from all servers where you have permission to ban a member)*

\`${prefix}bl\` ➜ **Add a member to the blacklist**  
\`${prefix}unbl\` ➜ **Remove a member from the blacklist**
   `);

    const lines = content.split("\n");
    let currentChunk = '';
    let chunkCount = 0;

    for (let line of lines) {
      if (currentChunk.length + line.length > 2000) {
        chunkCount++;
        const sentMessage = await message.channel.send(currentChunk);

        currentChunk = line + "\n";
      } else {
        currentChunk += line + "\n";
      }
    }

    if (currentChunk) {
      const sentMessage = await message.channel.send(currentChunk);
    }
  }
};
