const { loadGlobalDb } = require("../../fonctions");

async function getUserEmoji(userId) {
    const globalDb = await loadGlobalDb();
    
    if (!userId) {
        const firstUserId = Object.keys(globalDb)[0];
        return globalDb[firstUserId]?.emoji || '🚩';
    }
    
    const emoji = globalDb[userId]?.emoji || '🚩';
    return emoji;
}

module.exports = {
  emojipc: async (prefix, commands, userId = null, lang = 'fr') => {
    const emoji = await getUserEmoji(userId);
    const commandEntries = Object.entries(commands);
    const totalWidth = 45;
    const commandWidth = 15;
    const descriptionWidth = totalWidth - commandWidth - 8;
    
    return `\`\`\`

          [ ${emoji} Reddom $€Ł₣₿∅Ŧ ${emoji} ]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
${commandEntries.map(([cmd, desc]) => {
  const fullCmd = `${prefix}${cmd}`;
  const paddedCmd = fullCmd.padEnd(commandWidth);
  const paddedDesc = desc.padEnd(descriptionWidth);
  return `┃  ${paddedCmd} ${paddedDesc}`;
}).join('\n')}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\`\`\``;
  },

  simplepc: async (prefix, commands, userId = null, lang = 'fr') => {
    const emoji = await getUserEmoji(userId);
    const commandEntries = Object.entries(commands);
    const totalWidth = 45;
    const commandWidth = 15;
    const descriptionWidth = totalWidth - commandWidth - 10;
    
    return `\`\`\`

          [ ${emoji} Reddom $€Ł₣₿∅Ŧ ${emoji} ]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
${commandEntries.map(([cmd, desc]) => {
  const fullCmd = `${prefix}${cmd}`;
  const paddedCmd = fullCmd.padEnd(commandWidth);
  const cleanDesc = desc.split(' ').slice(1).join(' ');
  const truncatedDesc = cleanDesc.length > descriptionWidth ? cleanDesc.substring(0, descriptionWidth - 3) + '...' : cleanDesc;
  const paddedDesc = truncatedDesc.padEnd(descriptionWidth);
  return `┃  ${paddedCmd} ☆ ${paddedDesc} ┃`;
}).join('\n')}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\`\`\``;
  },

  sortpc: async (prefix, commands, userId = null, lang = 'fr') => {
    const emoji = await getUserEmoji(userId);
    const commandEntries = Object.entries(commands);
    const totalWidth = 45;
    const commandWidth = 12;
    const descriptionWidth = totalWidth - commandWidth - 8;
    
    let message = `\`\`\`\n\n          [ ${emoji} Reddom $€Ł₣₿∅Ŧ ${emoji} ]\n\n`;
    message += `┌───────────────────────────────────────────┐\n`;
    
    commandEntries.forEach(([cmd, desc]) => {
      const fullCmd = `${prefix}${cmd}`;
      const paddedCmd = fullCmd.padEnd(commandWidth);
      const cleanDesc = desc.split(' ').slice(1).join(' ');
      const truncatedDesc = cleanDesc.length > descriptionWidth ? cleanDesc.substring(0, descriptionWidth - 3) + '...' : cleanDesc;
      const paddedDesc = truncatedDesc.padEnd(descriptionWidth);
      message += `│ ${paddedCmd} │ › ${paddedDesc}│\n`;
    });
    
    message += '└───────────────────────────────────────────┘```';
    return message;
  },

  halfpc: async (prefix, commands, userId = null, lang = 'fr') => {
    const emoji = await getUserEmoji(userId);
    const commandEntries = Object.entries(commands);
    const totalWidth = 25;
    const commandWidth = 12;
    const descriptionWidth = totalWidth - commandWidth - 5;
    
    return `\`\`\`

          [ ${emoji} Reddom $€Ł₣₿∅Ŧ ${emoji} ]

┏━━━━━━━━━━━━━━━┓
${commandEntries.map(([cmd, desc]) => {
  const fullCmd = `${prefix}${cmd}`;
  const paddedCmd = fullCmd.padEnd(commandWidth);
  const cleanDesc = desc.split(' ').slice(1).join(' ');
  const paddedDesc = cleanDesc.padEnd(descriptionWidth);
  return `┃  ${paddedCmd} ☆ ${paddedDesc}`;
}).join('\n')}
┗━━━━━━━━━━━━━━━┛\`\`\``;
  },

  center: async (prefix, commands, userId = null, lang = 'fr') => {
    const emoji = await getUserEmoji(userId);
    const commandEntries = Object.entries(commands);
    
    return `** **                  ** [ ${emoji} Reddom $€Ł₣₿∅Ŧ ${emoji} ] **\n\n` +
           commandEntries.map(([cmd, desc]) => {
             const cmdEmoji = desc.split(' ')[0];
             const cleanDesc = desc.split(' ').slice(1).join(' ');
             return `** **              ${cmdEmoji} ☆ \`${prefix}${cmd}\` ☆ ${cmdEmoji}`;
           }).join('\n');
  },

  simple: async (prefix, commands, userId = null, lang = 'fr') => {
    const emoji = await getUserEmoji(userId);
    const commandEntries = Object.entries(commands);
    
    let message = `[ ${emoji} Reddom $€Ł₣₿∅Ŧ ${emoji} ]\n\n`;
    message += `╭─────────╮\n`;
    
    commandEntries.forEach(([cmd]) => {
      message += `│ ${prefix}${cmd}\n`;
    });
    
    message += `╰─────────╯`;
    return message;
  },

  default: async (prefix, commands, userId = null, lang = 'fr') => {
    const emoji = await getUserEmoji(userId);
    return `# __RD $B On Top__

➜ \`${prefix}support\`

** **                          ♫︎ [ ${emoji} Reddom $€Ł₣₿∅Ŧ ${emoji} ] ♫︎

*Les règles sont faites pour ceux qui les suivent.*

${Object.entries(commands).map(([cmd, desc]) => {
  const cleanDesc = desc.split(' ').slice(1).join(' ');
  return `\`${prefix}${cmd}\` ☆ **${cleanDesc}**`;
}).join('\n')}`;
  },

  simpletel: async (prefix, commands, userId = null, lang = 'fr') => {
    const commandEntries = Object.entries(commands);
    const totalWidth = 45;
    const commandWidth = 15;
    const descriptionWidth = totalWidth - commandWidth - 8;
    
    return `

          [ 🚩 Reddom $€Ł₣₿∅Ŧ 🚩 ]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
${commandEntries.map(([cmd, desc]) => {
  const fullCmd = `${prefix}${cmd}`;
  const paddedCmd = fullCmd.padEnd(commandWidth);
  const cmdEmoji = desc.split(' ')[0];
  const cleanDesc = desc.split(' ').slice(1).join(' ');
  const paddedDesc = cleanDesc.padEnd(descriptionWidth);
  return `┃  ${paddedCmd} ⇢ ${paddedDesc}`;
}).join('\n')}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
  },

  emojitel: async (prefix, commands, userId = null, lang = 'fr') => {
    const emoji = await getUserEmoji(userId);
    const commandEntries = Object.entries(commands);
    const totalWidth = 45;
    const commandWidth = 15;
    const descriptionWidth = totalWidth - commandWidth - 8;
    
    return `

          [ 🚩 Reddom $€Ł₣₿∅Ŧ 🚩 ]

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
${commandEntries.map(([cmd, desc]) => {
  const fullCmd = `${prefix}${cmd}`;
  const paddedCmd = fullCmd.padEnd(commandWidth);
  const cmdEmoji = desc.split(' ')[0]; 
  const cleanDesc = desc.split(' ').slice(1).join(' '); 
  const paddedDesc = cleanDesc.padEnd(descriptionWidth);
  return `┃  ${paddedCmd} ${cmdEmoji} ${paddedDesc}`;
}).join('\n')}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
  }
};