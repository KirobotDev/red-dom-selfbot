module.exports = {
  name: 'username',
  description: 'Recherche des profils sur différents réseaux sociaux avec le nom d\'utilisateur donné.',
  usage: '<nom_utilisateur>',
  run: async (client, message, args) => {
    if (args.length === 0) {
      return message.channel.send('Veuillez fournir un nom d\'utilisateur.');
    }

    const username = args.join(' ').trim();

    const profiles = {
      Instagram: `<https://www.instagram.com/${username}>`,
      Twitch: `<https://www.twitch.tv/${username}>`,
      Twitter: `<https://twitter.com/${username}>`,
      YouTube: `<https://www.youtube.com/user/${username}>`,
      LinkedIn: `<https://www.linkedin.com/in/${username}>`,
      Facebook: `<https://www.facebook.com/${username}>`,
      Reddit: `<https://www.reddit.com/user/${username}>`,
      TikTok: `<https://www.tiktok.com/@${username}>`,
      Pinterest: `<https://www.pinterest.com/${username}>`,
      Snapchat: `<https://www.snapchat.com/add/${username}>`,
      Tumblr: `<https://www.tumblr.com/${username}>`,
      GitHub: `<https://github.com/${username}>`,
      Discord: `<https://discord.com/users/${username}>`,
      GitLab: `<https://gitlab.com/${username}>`,
      StackOverflow: `<https://stackoverflow.com/users/${username}>`,
      VK: `<https://vk.com/${username}>`,
      Mix: `<https://mix.com/${username}>`
    };

    let response = `Recherche pour "${username}":\n\n`;

    for (const [network, url] of Object.entries(profiles)) {
      response += `${network}: ${url}\n`;
    }

    message.channel.send(response);
  }
};
