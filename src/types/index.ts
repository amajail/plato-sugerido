export interface MenuItem {
  id: string;
  name: string;
  category: 'starter' | 'main' | 'dessert';
  description: string;
  ingredients: string[];
  price?: string;
  isSeasonalDish?: boolean;
  preferredWeather?: string[];
}

export interface Menu {
  restaurantName: string;
  items: MenuItem[];
}

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  location: string;
}

export interface MenuSuggestion {
  date: string;
  weather: WeatherData;
  suggestions: {
    starter: MenuItem;
    mainDish: MenuItem;
    dessert: MenuItem;
  };
  reasoning: string;
}
