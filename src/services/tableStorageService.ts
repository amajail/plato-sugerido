import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';
import { MenuEntity, SuggestionEntity } from '../models/MenuEntity';
import { Menu, MenuSuggestion } from '../types';

export class TableStorageService {
  private menuTableClient: TableClient;
  private suggestionTableClient: TableClient;

  constructor(connectionString: string) {
    this.menuTableClient = TableClient.fromConnectionString(
      connectionString,
      'MenuTable',
      { allowInsecureConnection: true }
    );
    this.suggestionTableClient = TableClient.fromConnectionString(
      connectionString,
      'SuggestionTable',
      { allowInsecureConnection: true }
    );
  }

  async initialize(): Promise<void> {
    await this.menuTableClient.createTable();
    await this.suggestionTableClient.createTable();
  }

  async saveMenu(menu: Menu): Promise<void> {
    const entity: MenuEntity = {
      partitionKey: 'menu',
      rowKey: menu.restaurantName,
      restaurantName: menu.restaurantName,
      menuData: JSON.stringify(menu),
      lastUpdated: new Date(),
    };

    await this.menuTableClient.upsertEntity(entity);
  }

  async getMenu(restaurantName: string): Promise<Menu | null> {
    try {
      const entity = await this.menuTableClient.getEntity<MenuEntity>(
        'menu',
        restaurantName
      );
      return JSON.parse(entity.menuData);
    } catch (error) {
      return null;
    }
  }

  async saveSuggestion(suggestion: MenuSuggestion): Promise<void> {
    const entity: SuggestionEntity = {
      partitionKey: suggestion.date,
      rowKey: new Date().getTime().toString(),
      date: suggestion.date,
      weatherData: JSON.stringify(suggestion.weather),
      suggestions: JSON.stringify(suggestion.suggestions),
      reasoning: suggestion.reasoning,
      timestamp: new Date(),
    };

    await this.suggestionTableClient.createEntity(entity);
  }

  async getSuggestionsByDate(date: string): Promise<MenuSuggestion[]> {
    const suggestions: MenuSuggestion[] = [];
    const entities = this.suggestionTableClient.listEntities<SuggestionEntity>({
      queryOptions: { filter: `PartitionKey eq '${date}'` },
    });

    for await (const entity of entities) {
      suggestions.push({
        date: entity.date,
        weather: JSON.parse(entity.weatherData),
        suggestions: JSON.parse(entity.suggestions),
        reasoning: entity.reasoning,
      });
    }

    return suggestions;
  }
}
