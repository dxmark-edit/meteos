import { Oval } from 'react-loader-spinner';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    error: false,
  });
  const [favoriteCities, setFavoriteCities] = useState(
    JSON.parse(localStorage.getItem('favorites')) || []
  );
  const [theme, setTheme] = useState('day'); // State for theme

  const toDateFunction = () => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const WeekDays = [
      'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    ];
    const currentDate = new Date();
    const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
    return date;
  };

  const determineTheme = (timezoneOffset) => {
    const utcHour = new Date().getUTCHours();
    const localHour = (utcHour + timezoneOffset / 3600) % 24;
    return localHour >= 6 && localHour < 18 ? 'day' : 'night'; // Day: 6 AM to 6 PM
  };

  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fetchWeather(input);
    }
  };

  const fetchWeather = async (query) => {
    if (!query) return;
    setInput('');
    setWeather({ ...weather, loading: true });
    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const api_key = 'f00c38e0279b7bc85480c3fe775d518c';
    await axios
      .get(url, {
        params: {
          q: query,
          units: 'metric',
          appid: api_key,
        },
      })
      .then((res) => {
        const theme = determineTheme(res.data.timezone);
        setTheme(theme);
        setWeather({ data: res.data, loading: false, error: false });
      })
      .catch(() => {
        setWeather({ ...weather, data: {}, error: true });
        setInput('');
      });
  };

  const fetchUserLocation = async () => {
    setWeather({ ...weather, loading: true });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const url = 'https://api.openweathermap.org/data/2.5/weather';
        const api_key = 'f00c38e0279b7bc85480c3fe775d518c';
        await axios
          .get(url, {
            params: {
              lat: latitude,
              lon: longitude,
              units: 'metric',
              appid: api_key,
            },
          })
          .then((res) => {
            const theme = determineTheme(res.data.timezone);
            setTheme(theme);
            setWeather({ data: res.data, loading: false, error: false });
          })
          .catch(() => {
            setWeather({ ...weather, data: {}, error: true });
          });
      },
      () => {
        setWeather({ ...weather, loading: false, error: true });
      }
    );
  };

  const addFavorite = () => {
    if (input.trim() === '') return;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(input)) {
      favorites.push(input);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setFavoriteCities(favorites);

      // Reset the theme back to default (e.g., "day")
      setTheme('day');
    }
  };

  const handleFavoriteClick = (city) => {
    setInput(city);
    fetchWeather(city);
  };

  useEffect(() => {
    fetchUserLocation(); // Automatically fetch user location on page load
  }, []);

  return (
    <div className={`App ${theme}`}>
      <h1 className="app-name">Application Météo grp204</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          name="query"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={search}
        />
        <button onClick={addFavorite}>Ajouter aux favoris</button>
      </div>
      <div className="favorites">
        <h3>Villes favorites :</h3>
        <ul>
          {favoriteCities.map((city, index) => (
            <li key={index} onClick={() => handleFavoriteClick(city)}>
              {city}
            </li>
          ))}
        </ul>
      </div>
      {weather.loading && (
        <>
          <Oval type="Oval" color="black" height={100} width={100} />
        </>
      )}
      {weather.error && (
        <>
          <span className="error-message">
            <FontAwesomeIcon icon={faFrown} />
            <span>Ville introuvable</span>
          </span>
        </>
      )}
      {weather && weather.data && weather.data.main && (
        <div>
          <h2>{weather.data.name}, {weather.data.sys.country}</h2>
          <span>{toDateFunction()}</span>
          <img
            src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
            alt={weather.data.weather[0].description}
          />
          <p>{Math.round(weather.data.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
}

export default Grp204WeatherApp;
