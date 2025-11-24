import OpenAI from 'openai';
import { Menu, WeatherData, MenuItem } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async suggestMenu(
    menu: Menu,
    weather: WeatherData
  ): Promise<{ starter: MenuItem; mainDish: MenuItem; dessert: MenuItem; reasoning: string }> {
    const starters = menu.items.filter((item) => item.category === 'starter');
    const mainDishes = menu.items.filter((item) => item.category === 'main');
    const desserts = menu.items.filter((item) => item.category === 'dessert');

    const prompt = `You are a restaurant menu curator. Based on the current weather conditions and the available menu items, suggest one starter, one main dish, and one dessert for a complete meal.

Weather Information:
- Temperature: ${weather.temperature}°C
- Condition: ${weather.condition}
- Description: ${weather.description}
- Humidity: ${weather.humidity}%
- Location: ${weather.location}

Available Menu Items:

Starters:
${starters.map((item) => `- ${item.name}: ${item.description} (Ingredients: ${item.ingredients.join(', ')})`).join('\n')}

Main Dishes:
${mainDishes.map((item) => `- ${item.name}: ${item.description} (Ingredients: ${item.ingredients.join(', ')})`).join('\n')}

Desserts:
${desserts.map((item) => `- ${item.name}: ${item.description} (Ingredients: ${item.ingredients.join(', ')})`).join('\n')}

Please respond in the following JSON format:
{
  "starter": "name of the starter",
  "mainDish": "name of the main dish",
  "dessert": "name of the dessert",
  "reasoning": "Brief explanation of why these dishes pair well with today's weather (2-3 sentences)"
}

Consider factors like:
- Hot weather → lighter, refreshing dishes and cold/frozen desserts
- Cold weather → hearty, warming dishes and warm/creamy desserts
- Rainy weather → comfort food
- Clear weather → fresh, vibrant options`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful restaurant menu curator who suggests dishes based on weather conditions. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const suggestion = JSON.parse(response.choices[0].message.content || '{}');

      const selectedStarter = starters.find((item) => item.name === suggestion.starter);
      const selectedMain = mainDishes.find((item) => item.name === suggestion.mainDish);
      const selectedDessert = desserts.find((item) => item.name === suggestion.dessert);

      if (!selectedStarter || !selectedMain || !selectedDessert) {
        throw new Error('OpenAI suggested items not found in menu');
      }

      return {
        starter: selectedStarter,
        mainDish: selectedMain,
        dessert: selectedDessert,
        reasoning: suggestion.reasoning,
      };
    } catch (error) {
      throw new Error(`Failed to generate menu suggestion: ${error}`);
    }
  }
}
