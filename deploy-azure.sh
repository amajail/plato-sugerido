#!/bin/bash

# Azure Deployment Script for Plato Sugerido
# This script creates Azure resources and deploys the Function App

set -e  # Exit on error

# Configuration
RESOURCE_GROUP="platosugerido-rg"
LOCATION="eastus"
STORAGE_ACCOUNT="platosugeridost$(date +%s | tail -c 6)"  # Add random suffix for uniqueness
FUNCTION_APP="platosugerido-func"
RUNTIME="node"
RUNTIME_VERSION="22"

echo "========================================="
echo "Azure Deployment for Plato Sugerido"
echo "========================================="
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "Storage Account: $STORAGE_ACCOUNT"
echo "Function App: $FUNCTION_APP"
echo "========================================="

# Check if logged in to Azure
echo "Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Error: Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Using subscription: $(az account show --query name -o tsv) ($SUBSCRIPTION_ID)"

# Create Resource Group if it doesn't exist
echo ""
echo "Step 1: Creating Resource Group..."
if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo "Resource Group '$RESOURCE_GROUP' already exists. Skipping creation."
else
    echo "Creating Resource Group '$RESOURCE_GROUP'..."
    az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
    echo "Resource Group created successfully."
fi

# Create Storage Account if it doesn't exist
echo ""
echo "Step 2: Creating Storage Account..."
# First, check if any storage account exists in the resource group
EXISTING_STORAGE=$(az storage account list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv 2>/dev/null)

if [ -n "$EXISTING_STORAGE" ]; then
    echo "Storage Account '$EXISTING_STORAGE' already exists. Using existing account."
    STORAGE_ACCOUNT="$EXISTING_STORAGE"
else
    echo "Creating Storage Account '$STORAGE_ACCOUNT'..."
    az storage account create \
        --name "$STORAGE_ACCOUNT" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku Standard_LRS \
        --kind StorageV2 \
        --allow-blob-public-access false
    echo "Storage Account created successfully."
fi

# Get storage connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --query connectionString -o tsv)

echo "Storage Account: $STORAGE_ACCOUNT"

# Create Function App if it doesn't exist
echo ""
echo "Step 3: Creating Function App..."
if az functionapp show --name "$FUNCTION_APP" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    echo "Function App '$FUNCTION_APP' already exists. Skipping creation."
else
    echo "Creating Function App '$FUNCTION_APP'..."
    az functionapp create \
        --name "$FUNCTION_APP" \
        --resource-group "$RESOURCE_GROUP" \
        --storage-account "$STORAGE_ACCOUNT" \
        --consumption-plan-location "$LOCATION" \
        --runtime "$RUNTIME" \
        --runtime-version "$RUNTIME_VERSION" \
        --functions-version 4 \
        --os-type Linux
    echo "Function App created successfully."
fi

# Configure Application Settings
echo ""
echo "Step 4: Configuring Application Settings..."

# Read from local.settings.json if it exists
if [ -f "local.settings.json" ]; then
    echo "Reading configuration from local.settings.json..."
    OPENAI_API_KEY=$(grep -o '"OPENAI_API_KEY"[[:space:]]*:[[:space:]]*"[^"]*"' local.settings.json | sed 's/.*: "\(.*\)".*/\1/')
    WEATHER_API_KEY=$(grep -o '"WEATHER_API_KEY"[[:space:]]*:[[:space:]]*"[^"]*"' local.settings.json | sed 's/.*: "\(.*\)".*/\1/')
    RESTAURANT_LOCATION=$(grep -o '"RESTAURANT_LOCATION"[[:space:]]*:[[:space:]]*"[^"]*"' local.settings.json | sed 's/.*: "\(.*\)".*/\1/')
    RESTAURANT_NAME=$(grep -o '"RESTAURANT_NAME"[[:space:]]*:[[:space:]]*"[^"]*"' local.settings.json | sed 's/.*: "\(.*\)".*/\1/')
    OUTPUT_LANGUAGE=$(grep -o '"OUTPUT_LANGUAGE"[[:space:]]*:[[:space:]]*"[^"]*"' local.settings.json | sed 's/.*: "\(.*\)".*/\1/')

    echo "Configuration loaded from local.settings.json"
    echo "  - Restaurant: $RESTAURANT_NAME"
    echo "  - Location: $RESTAURANT_LOCATION"
    echo "  - Language: $OUTPUT_LANGUAGE"
else
    echo "Error: local.settings.json not found. Please create it with your configuration."
    exit 1
fi

echo ""
echo "Setting application settings..."
az functionapp config appsettings set \
    --name "$FUNCTION_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --settings \
        "AZURE_STORAGE_CONNECTION_STRING=$STORAGE_CONNECTION_STRING" \
        "OPENAI_API_KEY=$OPENAI_API_KEY" \
        "WEATHER_API_KEY=$WEATHER_API_KEY" \
        "RESTAURANT_LOCATION=$RESTAURANT_LOCATION" \
        "RESTAURANT_NAME=$RESTAURANT_NAME" \
        "OUTPUT_LANGUAGE=$OUTPUT_LANGUAGE" \
    > /dev/null

echo "Application settings configured successfully."

# Build the application
echo ""
echo "Step 5: Building application..."
npm run build

# Deploy Function App
echo ""
echo "Step 6: Deploying Function App code..."
func azure functionapp publish "$FUNCTION_APP"

echo ""
echo "========================================="
echo "Deployment completed successfully!"
echo "========================================="
echo "Function App URL: https://$FUNCTION_APP.azurewebsites.net"
echo ""
echo "Available endpoints:"
echo "  - GET  https://$FUNCTION_APP.azurewebsites.net/api/getSuggestion"
echo "  - POST https://$FUNCTION_APP.azurewebsites.net/api/uploadMenu"
echo ""
echo "Next steps:"
echo "  1. Upload menu data using the uploadMenu endpoint"
echo "  2. Test the getSuggestion endpoint"
echo ""
echo "To upload menu data, run:"
echo "  curl -X POST https://$FUNCTION_APP.azurewebsites.net/api/uploadMenu -H \"Content-Type: application/json\" -d @augusto-menu.json"
echo "========================================="
