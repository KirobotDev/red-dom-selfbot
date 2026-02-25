const axios = require('axios');
const { language } = require("../../fonctions");

module.exports = {
  name: 'meteo',
  description: 'Affiche les informations météo pour une ville',
  run: async (client, message, args) => {
    try {
      if (!args.length) {
        message.edit('Veuillez fournir le nom de la ville.');
        return;
      }

      const city = args.join(' ');
      const apiKey = '6a1fc629d54b0d8ff150320a36a72bbc';  
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&lang=fr&units=metric`;

      const response = await axios.get(url);
      const data = response.data;

      const weatherDescription = data.weather[0].description;
      const temperature = data.main.temp;
      const feelsLike = data.main.feels_like;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;

      const weatherMessage = `**Météo pour ${data.name}**\n` +
        `Conditions : ${weatherDescription}\n` +
        `Température : ${temperature}°C\n` +
        `Ressentie : ${feelsLike}°C\n` +
        `Humidité : ${humidity}%\n` +
        `Vitesse du vent : ${windSpeed} m/s`;

      message.edit(`⛧ **RD** ⛧\n> ${weatherMessage}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des données météo:', error);
      message.edit(await language(client, `Erreur lors de la récupération des données météo. Assurez-vous que le nom de la ville est correct et essayez à nouveau.`, `Error retrieving weather data. Ensure the city name is correct and try again.`));
    }
  },
};
