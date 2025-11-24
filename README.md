# Plato Sugerido - Restaurant Menu Suggestion API

An Azure Functions backend that suggests restaurant dishes based on current weather conditions using OpenAI.

## Features

- Suggests complete meal: starter, main dish, and dessert based on weather
- Uses OpenAI GPT-4o-mini for intelligent menu curation
- Stores menus in Azure Table Storage
- Integrates with OpenWeatherMap API
- TypeScript-based Azure Functions
- Italian restaurant menu with 50+ dishes

## Architecture

```
src/
├── functions/          # Azure Functions endpoints
│   ├── getSuggestion.ts    # GET suggestion endpoint
│   └── uploadMenu.ts       # POST menu upload endpoint
├── services/          # Business logic
│   ├── tableStorageService.ts  # Azure Table Storage operations
│   ├── weatherService.ts       # Weather API integration
│   └── openaiService.ts        # OpenAI integration
├── models/            # Data models
│   └── MenuEntity.ts
└── types/             # TypeScript types
    └── index.ts
```

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Azure Functions Core Tools**
   ```bash
   npm install -g azure-functions-core-tools@4
   ```
3. **Azure Storage Account** (or use Azurite for local development)
4. **OpenAI API Key**
5. **OpenWeatherMap API Key** (free tier available at https://openweathermap.org/api)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update `local.settings.json` with your credentials:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_STORAGE_CONNECTION_STRING": "your-azure-storage-connection-string",
    "OPENAI_API_KEY": "your-openai-api-key",
    "WEATHER_API_KEY": "your-openweathermap-api-key",
    "RESTAURANT_LOCATION": "Córdoba",
    "RESTAURANT_NAME": "default"
  }
}
```

### 3. Local Development with Azurite

For local development, you can use Azurite (Azure Storage Emulator):

```bash
npm install -g azurite
azurite --silent --location ./azurite --debug ./azurite/debug.log
```

Then use this connection string:
```
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;
```

### 4. Build the Project

```bash
npm run build
```

### 5. Start the Functions

```bash
npm start
```

The functions will be available at:
- `http://localhost:7071/api/getSuggestion`
- `http://localhost:7071/api/uploadMenu`

## Usage

### 1. Upload a Menu

First, upload your restaurant menu to Azure Table Storage:

```bash
curl -X POST http://localhost:7071/api/uploadMenu \
  -H "Content-Type: application/json" \
  -d @sample-menu.json
```

Response:
```json
{
  "message": "Menu uploaded successfully",
  "restaurantName": "default",
  "itemCount": 53
}
```

### 2. Get Menu Suggestion

Request a menu suggestion based on current weather (uses location configured in settings):

```bash
curl "http://localhost:7071/api/getSuggestion"
```

Response:
```json
{
  "date": "2025-11-22",
  "weather": {
    "temperature": 28,
    "condition": "Clear",
    "description": "clear sky",
    "humidity": 45,
    "location": "Córdoba"
  },
  "suggestions": {
    "starter": {
      "id": "tomates-confitados-al-romero",
      "name": "Tomates Confitados al Romero",
      "category": "starter",
      "price": "5.000",
      "description": "Tomates cherry confitados con aceite de oliva y romero fresco",
      "ingredients": ["Tomates cherry", "Aceite de oliva", "Romero fresco", "Ajo", "Sal", "Azúcar"]
    },
    "mainDish": {
      "id": "sorrentinos-caprese",
      "name": "Sorrentinos Caprese",
      "category": "main",
      "price": "15.700",
      "description": "Mozzarella fresca, tomate y albahaca, sabores mediterráneos",
      "ingredients": ["Masa de pasta fresca", "Mozzarella fresca", "Tomate", "Albahaca", "Ricota", "Aceite de oliva"]
    },
    "dessert": {
      "id": "copa-helada",
      "name": "Copa Helada",
      "category": "dessert",
      "price": "9.000",
      "description": "Brownie, frutos secos, helado y ron",
      "ingredients": ["Brownie de chocolate", "Helado de crema", "Nueces", "Almendras", "Ron", "Crema batida", "Salsa de chocolate"]
    }
  },
  "reasoning": "On this hot, clear day in Córdoba, light and refreshing dishes are perfect. The tomatoes confitados provide a bright, aromatic start. The Sorrentinos Caprese with fresh mozzarella, tomato, and basil are ideal for warm weather - light yet satisfying. To finish, the Copa Helada offers a cool, indulgent dessert that's perfect for a hot day."
}
```

## API Endpoints

### GET /api/getSuggestion

Get menu suggestions based on current weather for the configured restaurant location.

**Configuration:** Uses `RESTAURANT_LOCATION` and `RESTAURANT_NAME` from environment variables.

**Response:** Menu suggestion with weather data and reasoning

### POST /api/uploadMenu

Upload or update a restaurant menu.

**Body:** JSON menu object
```json
{
  "restaurantName": "string",
  "items": [
    {
      "id": "string",
      "name": "string",
      "category": "starter" | "main" | "dessert",
      "description": "string",
      "ingredients": ["string"],
      "price": "string" (optional),
      "preferredWeather": ["string"] (optional)
    }
  ]
}
```

**Response:** Confirmation message

## Deployment to Azure

### 1. Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name plato-sugerido-rg --location eastus

# Create storage account
az storage account create \
  --name platosugeridostorage \
  --resource-group plato-sugerido-rg \
  --location eastus \
  --sku Standard_LRS

# Create function app
az functionapp create \
  --resource-group plato-sugerido-rg \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name plato-sugerido-api \
  --storage-account platosugeridostorage
```

### 2. Configure Application Settings

```bash
az functionapp config appsettings set \
  --name plato-sugerido-api \
  --resource-group plato-sugerido-rg \
  --settings \
    OPENAI_API_KEY="your-openai-key" \
    WEATHER_API_KEY="your-weather-key" \
    AZURE_STORAGE_CONNECTION_STRING="your-connection-string" \
    RESTAURANT_LOCATION="Córdoba" \
    RESTAURANT_NAME="default"
```

### 3. Deploy

```bash
func azure functionapp publish plato-sugerido-api
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Storage connection string | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `WEATHER_API_KEY` | OpenWeatherMap API key | Yes | - |
| `RESTAURANT_LOCATION` | City name for weather lookup | No | "Córdoba" |
| `RESTAURANT_NAME` | Restaurant identifier for menu storage | No | "default" |

## Sample Menu Format

See `sample-menu.json` for a complete example. The menu includes 50+ Italian restaurant items:

**Starters (16 items):**
- Fiambres: Jamón Crudo, Salame de Oncativo, Lomito Horneado Ahumado, Mortadela con Pistachos
- Quesos: Holanda, Azul, Parmesano, Camembert, Queso Marinado
- Conservas: Hongos en Escabeche, Pepinillos, Olivas Negras, Tomates Confitados, Pimientos Asados
- Combinado de Fiambres y Conservas (para compartir)

**Main Dishes (33 items):**
- Pastas simples: Spaghettis, Tagliatelles, Fetuccinis Verdes, Ñoquis
- Pastas rellenas: Ravioles, Sorrentinos (10 variedades), Malfattis
- Canelones: Carne y Verduras, Cordero y Espinaca, Crema de Choclo
- Pastas especiales: Panzottis, Creste di Gallo, Tortellinis, Lasaña
- Carne: Bife de Chorizo

**Desserts (4 items):**
- Flan Casero, Tiramisú
- Helados: Bombón Escocés, Copa Helada

Each item includes ingredients, prices, and weather preferences to help OpenAI make better suggestions.

## Technologies

- **Azure Functions v4** - Serverless compute
- **Azure Table Storage** - NoSQL data storage
- **TypeScript** - Type-safe development
- **OpenAI GPT-4** - AI-powered suggestions
- **OpenWeatherMap API** - Weather data

## License

ISC
