export interface MenuEntity {
  partitionKey: string;
  rowKey: string;
  restaurantName: string;
  menuData: string; // JSON stringified menu
  lastUpdated: Date;
}

export interface SuggestionEntity {
  partitionKey: string; // date (YYYY-MM-DD)
  rowKey: string; // timestamp or unique ID
  date: string;
  weatherData: string; // JSON stringified weather
  suggestions: string; // JSON stringified suggestions
  reasoning: string;
  timestamp: Date;
}
