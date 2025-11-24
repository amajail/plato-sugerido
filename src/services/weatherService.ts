import axios from 'axios';
import { WeatherData } from '../types';

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
        },
      });

      const data = response.data;

      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
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
        },
      });

      const data = response.data;

      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        location: data.name,
      };
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error}`);
    }
  }
}
