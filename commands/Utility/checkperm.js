module.exports = {
  name: "checkperm",
  description: "Vérifier les permissions d'un utilisateur sur le serveur",
  run: async (client, message, args) => {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

    if (!member) {
      return message.edit("Veuillez mentionner un utilisateur ou fournir un ID valide.");
    }

    const permissions = member.permissions.toArray();
    const permissionNames = {
      CREATE_INSTANT_INVITE: "Créer une invitation instantanée",
      KICK_MEMBERS: "Expulser des membres",
      BAN_MEMBERS: "Bannir des membres",
      ADMINISTRATOR: "Administrateur",
      MANAGE_CHANNELS: "Gérer les canaux",
      MANAGE_GUILD: "Gérer le serveur",
      ADD_REACTIONS: "Ajouter des réactions",
      VIEW_AUDIT_LOG: "Voir le journal d'audit",
      PRIORITY_SPEAKER: "Parleur prioritaire",
      STREAM: "Diffuser",
      VIEW_CHANNEL: "Voir les canaux",
      SEND_MESSAGES: "Envoyer des messages",
      SEND_TTS_MESSAGES: "Envoyer des messages TTS",
      MANAGE_MESSAGES: "Gérer les messages",
      EMBED_LINKS: "Intégrer des liens",
      ATTACH_FILES: "Joindre des fichiers",
      READ_MESSAGE_HISTORY: "Lire l'historique des messages",
      MENTION_EVERYONE: "Mentionner tout le monde",
      USE_EXTERNAL_EMOJIS: "Utiliser des émojis externes",
      VIEW_GUILD_INSIGHTS: "Voir les statistiques du serveur",
      CONNECT: "Se connecter",
      SPEAK: "Parler",
      MUTE_MEMBERS: "Couper le son des membres",
      DEAFEN_MEMBERS: "Rendre sourd les membres",
      MOVE_MEMBERS: "Déplacer des membres",
      USE_VAD: "Utiliser la détection de voix",
      CHANGE_NICKNAME: "Changer le surnom",
      MANAGE_NICKNAMES: "Gérer les surnoms",
      MANAGE_ROLES: "Gérer les rôles",
      MANAGE_WEBHOOKS: "Gérer les webhooks",
      MANAGE_EMOJIS_AND_STICKERS: "Gérer les émojis et autocollants",
      USE_APPLICATION_COMMANDS: "Utiliser les commandes d'application",
      REQUEST_TO_SPEAK: "Demander à parler",
      MANAGE_EVENTS: "Gérer les événements",
      MANAGE_THREADS: "Gérer les fils de discussion",
      CREATE_PUBLIC_THREADS: "Créer des fils de discussion publics",
      CREATE_PRIVATE_THREADS: "Créer des fils de discussion privés",
      START_EMBEDDED_ACTIVITIES: "Démarrer des activités intégrées",
      MODERATE_MEMBERS: "Modérer les membres",
      USE_PUBLIC_THREADS: "Utiliser des fils de discussion publics",
      USE_PRIVATE_THREADS: "Utiliser des fils de discussion privés",
      USE_EXTERNAL_STICKERS: "Utiliser des autocollants externes",
      SEND_MESSAGES_IN_THREADS: "Envoyer des messages dans des fils de discussion",
      USE_SOUNDBOARD: "Utiliser la planche à son",
      SEND_VOICE_MESSAGES: "Envoyer des messages vocaux"
    };
    if (permissions.includes("ADMINISTRATOR")) {
      return message.edit(`**${member.user.username} a toutes les permissions (Administrateur)**`);
    }

    const allPermissions = Object.keys(permissionNames);
    const permissionList = allPermissions.map(perm => {
      const hasPermission = permissions.includes(perm);
      return `${hasPermission ? '✓' : '✗'} ${permissionNames[perm]}`;
    });

    message.edit(`**Permissions de ${member.user.username} sur ce serveur :**\n\`\`\`${permissionList.join('\n')}\`\`\``);
  }
};