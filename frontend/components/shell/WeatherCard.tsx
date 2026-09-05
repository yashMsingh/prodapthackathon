'use client';

import { useEffect, useState } from 'react';
import { getWeather } from '@/lib/api';
import type { WeatherData } from '@/lib/types';
import styles from './WeatherCard.module.css';

const iconMap: Record<string, string> = {
  'cloud-sun': '⛅',
  'cloud-rain': '🌧',
  'sun': '☀️',
  'cloud': '☁️',
  'snow': '❄️',
  'storm': '⛈',
};

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    getWeather().then(setWeather).catch(() => null);
  }, []);

  if (!weather) return null;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.icon}>{iconMap[weather.icon] ?? '🌡'}</div>
        <div>
          <div className={styles.temp}>{weather.temperature}°C</div>
          <div className={styles.condition}>{weather.condition}</div>
        </div>
      </div>
      <div className={styles.city}>{weather.city}</div>
      <div className={styles.forecast}>
        {weather.forecast.map((day) => (
          <div key={day.day} className={styles.forecastDay}>
            <span className={styles.forecastLabel}>{day.day}</span>
            <span>{iconMap[day.icon] ?? '🌡'}</span>
            <span className={styles.forecastTemp}>{day.high}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
