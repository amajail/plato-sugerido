import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { TableStorageService } from '../services/tableStorageService';
import { Menu } from '../types';

export async function uploadMenu(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Processing menu upload request');

  try {
    const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!storageConnectionString) {
      return {
        status: 500,
        jsonBody: { error: 'Missing AZURE_STORAGE_CONNECTION_STRING environment variable' },
      };
    }

    const body = await request.text();
    const menu: Menu = JSON.parse(body);

    if (!menu.restaurantName || !menu.items || menu.items.length === 0) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid menu format. Required: restaurantName and items array' },
      };
    }

    const tableService = new TableStorageService(storageConnectionString);
    await tableService.initialize();
    await tableService.saveMenu(menu);

    context.log(`Menu uploaded successfully for restaurant: ${menu.restaurantName}`);

    return {
      status: 200,
      jsonBody: {
        message: 'Menu uploaded successfully',
        restaurantName: menu.restaurantName,
        itemCount: menu.items.length,
      },
    };
  } catch (error) {
    context.error('Error processing menu upload:', error);
    return {
      status: 500,
      jsonBody: { error: error instanceof Error ? error.message : 'Unknown error occurred' },
    };
  }
}

app.http('uploadMenu', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: uploadMenu,
});
