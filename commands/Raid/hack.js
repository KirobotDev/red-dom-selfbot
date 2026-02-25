module.exports = {
  name: "hack",
  description: "Simule un faux processus de piratage ultra stylé et terrifiant.",
  run: async (client, message, args) => {
    const steps = [
      "*[SYSTEM]* ░▓▒ Initialisation du piratage en cours... `$▓▒░▒▓█`",
      "*[INTERFACE]* ╔═╗ Lancement de l'interface graphique... `>>> Connecting...`",
      "*[NETWORK]* ░█▓ Connexion au réseau crypté... `$> Decrypting... █▒▓`",
      "*[IP TRACK]* ▒▒▒ Localisation de l'adresse IP de la cible... `# IP FOUND: 192.168.*.*`",
      "*[PASSWORD]* ▓█▒ Déchiffrement des mots de passe... `$░▒▓███████▒`",
      "*[FIREWALL]* ░▓█ Contournement des pare-feux... `> BYPASSING FIREWALL >>>`",
      "*[DATA]* ░▒▓ Infiltration des données sensibles... `>>> LOADING ███▒▒▒▓▓▓`",
      "*[VIRUS]* ▓█▒ Injection de virus dans le système... `$> INJECTING MALWARE...`",
      "*[ENCRYPT]* ░█▒ Cryptage des données pour extraction... `▓▒░ 100% ███ COMPLETE`",
      "*[LOCATION]* ▒▓█ Détection de la localisation de l'utilisateur... `>>> LAT: 48.8566, LONG: 2.3522`",
      "*[ACCESS]* ░▓█ Accès aux dossiers confidentiels... `$> OPENING FILES █▒▓▒`",
      "*[COPY]* ▓▒░ Copie des informations sensibles... `>>> COPYING ██████████`",
      "*[TRANSFER]* ░█▓ Transfert des données vers le serveur du pirate... `$> UPLOADING 99% ░▓█`",
      "*[ERROR]* ▒▒▒ Détection de sécurité activée... `!!! FIREWALL ALERT !!!`",
      "*[OVERRIDE]* ▓█▒ Tentative de contournement automatique... `>>> OVERRIDING SYSTEM ███`",
      "*[SUCCESS]* ░▓█ Piratage réussi. Les données ont été compromises. `$$$ HACK COMPLETE $$$`",
    ];

    const hackProcess = async () => {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        try {
          await message.edit(`\`\`\`fix\n${steps[i]}\n\`\`\``);
        } catch (error) {
          if (error.code === 10008) {
            return;
          }
        }
      }
    };

    hackProcess();
  },
};