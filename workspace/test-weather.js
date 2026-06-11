const fetchWeather = async () => {
  const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,weather_code&daily=precipitation_probability_max&timezone=auto");
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
};
fetchWeather();
