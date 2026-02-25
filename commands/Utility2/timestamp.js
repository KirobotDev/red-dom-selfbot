module.exports = {
  name: 'timestamp',
  description: 'Génère un timestamp Discord selon type et date/heure ou durée relative',
  run: async (client, message, args) => {
	await message.delete();

    try {
      if (!args.length) return message.channel.send("Usage: `&timestamp <type> <[date|time|durée]>`\n\n**Types disponibles :**\n• `R` - Relatif (ex: dans 9h)\n• `F` - Complet (ex: 10 décembre 2025 à 14:30)\n• `t` - Heure seulement (ex: 14:30)\n\n**Exemples :**\n`&timestamp R 9h/2j` - Dans 9 heures / Dans 2 jours\n`&timestamp F 10/12/2025`\n`&timestamp t 14:30`");

      const rawType = args[0];
      if (!/^[RrFfTt]$/.test(rawType)) return message.channel.send("Type invalide. Utilise `R`, `F` ou `t`.");
      const usedType = rawType.toUpperCase();

      let rest = args.slice(1);
      if (!rest.length) return message.channel.send("Fournis une date, heure ou durée.");
      const valueStr = rest.join(' ').trim();

      const isIntegerString = s => /^[0-9]+$/.test(s);
      
      const parseFrenchDateOnly = s => {
        const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (!m) return null;
        const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3]);
        return Math.floor(Date.UTC(y, mo - 1, d, 0, 0, 0) / 1000) - 3600;
      };
      
      const parseFrenchDateTime = s => {
        const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (!m) return null;
        const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3]);
        const hh = Number(m[4]), mm = Number(m[5]), ss = Number(m[6] || 0);
        return Math.floor(Date.UTC(y, mo - 1, d, hh, mm, ss) / 1000) - 3600;
      };
      
      const parseTimeOnly = s => {
        const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (!m) return null;
        const hh = Number(m[1]), mm = Number(m[2]), ss = Number(m[3] || 0);
        const now = new Date();
        const y = now.getUTCFullYear(), mo = now.getUTCMonth(), d = now.getUTCDate();
        return Math.floor(Date.UTC(y, mo, d, hh, mm, ss) / 1000) - 3600;
      };

      const parseRelativeDuration = s => {
        const now = Math.floor(Date.now() / 1000);
        const durationRegex = /^(\d+)([smhj])$/i;
        const match = s.match(durationRegex);
        
        if (!match) return null;
        
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        
        const multipliers = {
          's': 1,           
          'm': 60,          
          'h': 3600,        
          'j': 86400        
        };
        
        return now + (value * multipliers[unit]);
      };

      let timestampSec = null;

      if (isIntegerString(valueStr)) {
        const num = BigInt(valueStr);
        timestampSec = valueStr.length > 10 ? Number(num / 1000n) : Number(num);
      } else {
        timestampSec = parseRelativeDuration(valueStr) ?? 
                      parseFrenchDateTime(valueStr) ?? 
                      parseFrenchDateOnly(valueStr) ?? 
                      parseTimeOnly(valueStr);
      }

      if (timestampSec === null || Number.isNaN(timestampSec)) return message.channel.send("Format non reconnu. Utilise `JJ/MM/AAAA`, `JJ/MM/AAAA HH:MM`, `HH:MM`, `9h`, `2j`, ou un epoch en secondes/milliseconds.");

      const tag = `<t:${Math.floor(timestampSec)}:${usedType}>`;
      message.channel.send(`Voici ton timestamp:\n${tag}\n\`${tag}\``);

    } catch (err) {
      console.error("Erreur commande timestamp :", err);
      message.channel.send("Une erreur est survenue lors du parsing du timestamp.");
    }
  }
};