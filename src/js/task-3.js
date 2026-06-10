import axios from 'axios';
import { ICON_MAP } from './iconMap-t3';

function getWeather(lat, lon, timezone) {
  return axios
    .get(
      'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&hourly=temperature_2m,weather_code,precipitation,wind_speed_10m,apparent_temperature&current=temperature_2m,weather_code,precipitation,wind_speed_10m,apparent_temperature&timeformat=unixtime',
      {
        params: {
          latitude: lat,
          longitude: lon,
          timezone,
        },
      }
    )
    .then(({ data }) => {
      return {
        current: parseCurrentWeather(data[1]),
        daily: parseDailyWeather(data[1]),
        hourly: parseHourlyWeather(data[1]),
      };
    });
}

getWeather(50, 36, Intl.DateTimeFormat().resolvedOptions().timeZone)
  .then(renderWeather)
  .catch(e => {
    console.error(e);
    alert('Error getting weather.');
  });

function parseCurrentWeather({ current, daily }) {
  const {
    temperature_2m: currentTemp,
    wind_speed_10m: windSpeed,
    weather_code: iconCode,
  } = current;
  const {
    temperature_2m_max: [maxTemp],
    temperature_2m_min: [minTemp],
    apparent_temperature_max: [maxFeelsLike],
    apparent_temperature_min: [minFeelsLike],
    precipitation_sum: [precip],
  } = daily;
  let debug = {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(maxTemp),
    lowTemp: Math.round(minTemp),
    highFeelsLike: Math.round(maxFeelsLike),
    lowFeelsLike: Math.round(minFeelsLike),
    windSpeed: Math.round(windSpeed),
    precip: Math.round(precip * 100) / 100,
    iconCode,
  };
  console.log(debug);
  return {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(maxTemp),
    lowTemp: Math.round(minTemp),
    highFeelsLike: Math.round(maxFeelsLike),
    lowFeelsLike: Math.round(minFeelsLike),
    windSpeed: Math.round(windSpeed),
    precip: Math.round(precip * 100) / 100,
    iconCode,
  };
}

function parseDailyWeather({ daily }) {
  return daily.time.map((time, index) => {
    return {
      timestamp: time * 1000,
      iconCode: daily.weather_code[index],
      maxTemp: Math.round(daily.temperature_2m_max[index]),
    };
  });
}

function parseHourlyWeather({ hourly, current }) {
  return hourly.time
    .map((time, index) => {
      return {
        timestamp: time * 1000,
        iconCode: hourly.weather_code[index],
        temp: Math.round(hourly.temperature_2m[index]),
        feelsLike: Math.round(hourly.apparent_temperature[index]),
        windSpeed: Math.round(hourly.wind_speed_10m[index]),
        precip: Math.round(hourly.precipitation[index] * 100) / 100,
      };
    })
    .filter(({ timestamp }) => timestamp >= current.time * 1000);
}

function renderWeather({ current, daily, hourly }) {
  renderCurrentWeather(current);
  renderDailyWeather(daily);
  renderHourlyWeather(hourly);
  document.body.classList.remove('blurred');
}

function setValue(selector, value, { parent = document } = {}) {
  parent.querySelector(`[data-${selector}]`).textContent = value;
}

function getIconUrl(iconCode) {
  return `js-practice-se/assets/${ICON_MAP.get(iconCode)}.svg`;
}

const currentIcon = document.querySelector('[data-current-icon]');
function renderCurrentWeather(current) {
  currentIcon.src = getIconUrl(current.iconCode);
  setValue('current-temp', current.currentTemp);
  setValue('current-high', current.highTemp);
  setValue('current-low', current.lowTemp);
  setValue('current-fl-high', current.highFeelsLike);
  setValue('current-fl-low', current.lowFeelsLike);
  setValue('current-wind', current.windSpeed);
  setValue('current-precip', current.precip);
}

const DAY_FORMATTER = Intl.DateTimeFormat(undefined, { weekday: 'long' });
const dailySection = document.querySelector('[data-day-section]');
const dayCardTemplate = document.getElementById('day-card-template');
function renderDailyWeather(daily) {
  dailySection.innerHTML = '';
  daily.forEach(day => {
    const el = dayCardTemplate.content.cloneNode(true);
    setValue('temp', day.maxTemp, { parent: el });
    setValue('date', DAY_FORMATTER.format(day.timestamp), { parent: el });
    el.querySelector('[data-icon]').src = getIconUrl(day.iconCode);
    dailySection.append(el);
  });
}

const HOUR_FORMATTER = Intl.DateTimeFormat(undefined, { hour: 'numeric' });
const hourlySection = document.querySelector('[data-hour-section]');
const hourRowTemplate = document.getElementById('hour-row-template');
function renderHourlyWeather(hourly) {
  hourlySection.innerHTML = '';
  hourly.forEach(hour => {
    const el = hourRowTemplate.content.cloneNode(true);
    setValue('temp', hour.temp, { parent: el });
    setValue('fl-temp', hour.feelsLike, { parent: el });
    setValue('wind', hour.windSpeed, { parent: el });
    setValue('precip', hour.precip, { parent: el });
    setValue('day', DAY_FORMATTER.format(hour.timestamp), { parent: el });
    setValue('time', HOUR_FORMATTER.format(hour.timestamp), { parent: el });
    el.querySelector('[data-icon]').src = getIconUrl(hour.iconCode);
    hourlySection.append(el);
  });
}
