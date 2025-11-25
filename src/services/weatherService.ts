import axios from 'axios';
import { WeatherData } from '../types';

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  // Translation map for weather conditions to Spanish
  private conditionTranslations: { [key: string]: string } = {
    'Clear': 'Despejado',
    'Clouds': 'Nublado',
    'Rain': 'Lluvia',
    'Drizzle': 'Llovizna',
    'Thunderstorm': 'Tormenta',
    'Snow': 'Nieve',
    'Mist': 'Neblina',
    'Smoke': 'Humo',
    'Haze': 'Bruma',
    'Dust': 'Polvo',
    'Fog': 'Niebla',
    'Sand': 'Arena',
    'Ash': 'Ceniza',
    'Squall': 'Turbonada',
    'Tornado': 'Tornado',
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private translateCondition(condition: string): string {
    return this.conditionTranslations[condition] || condition;
  }

  async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
          lang: 'es',
        },
        timeout: 10000,
      });

      const data = response.data;

      return {
        temperature: Math.round(data.main.temp),
        condition: this.translateCondition(data.weather[0].main),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        location: data.name,
      };
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error}`);
    }
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'es',
        },
        timeout: 10000,
      });

      const data = response.data;

      return {
        temperature: Math.round(data.main.temp),
        condition: this.translateCondition(data.weather[0].main),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        location: data.name,
      };
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error}`);
    }
  }
}
