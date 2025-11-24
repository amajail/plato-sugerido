# Quick Start Guide

Get your restaurant menu suggestion API running in 5 minutes!

## Quick Local Setup

### 1. Install Azure Functions Core Tools

```bash
npm install -g azure-functions-core-tools@4
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Local Storage (Azurite)

Option A - Install Azurite globally:
```bash
npm install -g azurite
azurite --silent --location ./azurite
```

Option B - Use Docker:
```bash
docker run -p 10000:10000 -p 10001:10001 -p 10002:10002 mcr.microsoft.com/azure-storage/azurite
```

### 4. Get API Keys

1. **OpenWeatherMap API Key** (FREE):
   - Go to https://openweathermap.org/api
   - Sign up for free account
   - Get your API key from the dashboard

2. **OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Note: GPT-4 usage requires credits

### 5. Configure Environment

Edit `local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;",
    "OPENAI_API_KEY": "sk-your-actual-key",
    "WEATHER_API_KEY": "your-actual-key",
    "RESTAURANT_LOCATION": "Córdoba",
    "RESTAURANT_NAME": "default"
  }
}
```

### 6. Start the Functions

```bash
npm start
```

You should see:
```
Functions:
  getSuggestion: [GET] http://localhost:7071/api/getSuggestion
  uploadMenu: [POST] http://localhost:7071/api/uploadMenu
```

## Test It Out

### Upload Sample Menu

```bash
curl -X POST http://localhost:7071/api/uploadMenu \
  -H "Content-Type: application/json" \
  -d @sample-menu.json
```

### Get Suggestion

```bash
curl "http://localhost:7071/api/getSuggestion"
```

The API will use the location configured in `RESTAURANT_LOCATION` environment variable (default: Córdoba).

To test with different locations, update the `RESTAURANT_LOCATION` value in `local.settings.json` and restart the function.

## Troubleshooting

### "Cannot connect to storage"
- Make sure Azurite is running
- Check the connection string in `local.settings.json`

### "OpenAI API error"
- Verify your API key is correct
- Check you have credits in your OpenAI account
- The app uses `gpt-4o-mini` model

### "Weather API error"
- Verify your OpenWeatherMap API key
- Free tier allows 60 calls/minute
- Check the location name is valid

### "Function not found"
- Run `npm run build` first
- Check that `dist/` folder exists

## Next Steps

1. Customize the menu in `sample-menu.json`
2. Add more dishes with seasonal preferences
3. Modify the OpenAI prompt in `src/services/openaiService.ts`
4. Deploy to Azure (see README.md)

## Development Commands

```bash
npm run build        # Compile TypeScript
npm run watch        # Watch mode for development
npm start           # Start Azure Functions
npm run clean       # Remove compiled files
```
