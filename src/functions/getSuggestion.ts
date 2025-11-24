import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { TableStorageService } from '../services/tableStorageService';
import { WeatherService } from '../services/weatherService';
import { OpenAIService } from '../services/openaiService';

export async function getSuggestion(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Processing menu suggestion request');

  try {
    const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const weatherApiKey = process.env.WEATHER_API_KEY;
    const location = process.env.RESTAURANT_LOCATION || 'Córdoba';
    const restaurantName = process.env.RESTAURANT_NAME || 'default';

    if (!storageConnectionString || !openaiApiKey || !weatherApiKey) {
      return {
        status: 500,
        jsonBody: { error: 'Missing required environment variables' },
      };
    }

    const tableService = new TableStorageService(storageConnectionString);
    const weatherService = new WeatherService(weatherApiKey);
    const openaiService = new OpenAIService(openaiApiKey);

    context.log(`Fetching menu for restaurant: ${restaurantName}`);
    const menu = await tableService.getMenu(restaurantName);

    if (!menu) {
      return {
        status: 404,
        jsonBody: { error: `Menu not found for restaurant: ${restaurantName}` },
      };
    }

    context.log(`Fetching weather for location: ${location}`);
    const weather = await weatherService.getCurrentWeather(location);

    context.log('Generating menu suggestion with OpenAI');
    const suggestion = await openaiService.suggestMenu(menu, weather);

    const menuSuggestion = {
      date: new Date().toISOString().split('T')[0],
      weather,
      suggestions: {
        starter: suggestion.starter,
        mainDish: suggestion.mainDish,
        dessert: suggestion.dessert,
      },
      reasoning: suggestion.reasoning,
    };

    context.log('Saving suggestion to table storage');
    await tableService.saveSuggestion(menuSuggestion);

    return {
      status: 200,
      jsonBody: menuSuggestion,
    };
  } catch (error) {
    context.error('Error processing request:', error);
    return {
      status: 500,
      jsonBody: { error: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

app.http('getSuggestion', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getSuggestion,
});
