# Configure the Azure Provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}
}

# Create a resource group
resource "azurerm_resource_group" "railway_control" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    Environment = var.environment
    Project     = "railway-control"
    ManagedBy   = "terraform"
  }
}

# Create an App Service Plan
resource "azurerm_service_plan" "railway_control" {
  name                = "${var.app_name}-plan"
  resource_group_name = azurerm_resource_group.railway_control.name
  location            = azurerm_resource_group.railway_control.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku

  tags = {
    Environment = var.environment
    Project     = "railway-control"
    ManagedBy   = "terraform"
  }
}

# Create the web app, pass in the App Service Plan ID
resource "azurerm_linux_web_app" "railway_control" {
  name                = var.app_name
  resource_group_name = azurerm_resource_group.railway_control.name
  location            = azurerm_service_plan.railway_control.location
  service_plan_id     = azurerm_service_plan.railway_control.id

  site_config {
    always_on = true
    
    application_stack {
      docker_image_name        = "${var.docker_registry}/${var.docker_image}:latest"
      docker_registry_url      = "https://${var.docker_registry}"
    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "DOCKER_REGISTRY_SERVER_URL"          = "https://${var.docker_registry}"
    "WEBSITES_PORT"                       = "80"
    "NODE_ENV"                            = var.environment
  }

  tags = {
    Environment = var.environment
    Project     = "railway-control"
    ManagedBy   = "terraform"
  }
}

# Application Insights for monitoring
resource "azurerm_application_insights" "railway_control" {
  name                = "${var.app_name}-insights"
  location            = azurerm_resource_group.railway_control.location
  resource_group_name = azurerm_resource_group.railway_control.name
  application_type    = "web"

  tags = {
    Environment = var.environment
    Project     = "railway-control"
    ManagedBy   = "terraform"
  }
}

# Add Application Insights to Web App
resource "azurerm_linux_web_app_slot" "staging" {
  count          = var.enable_staging_slot ? 1 : 0
  name           = "staging"
  app_service_id = azurerm_linux_web_app.railway_control.id

  site_config {
    always_on = false
    
    application_stack {
      docker_image_name        = "${var.docker_registry}/${var.docker_image}:latest"
      docker_registry_url      = "https://${var.docker_registry}"
    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "DOCKER_REGISTRY_SERVER_URL"          = "https://${var.docker_registry}"
    "WEBSITES_PORT"                       = "80"
    "NODE_ENV"                            = "staging"
    "APPINSIGHTS_INSTRUMENTATIONKEY"      = azurerm_application_insights.railway_control.instrumentation_key
  }

  tags = {
    Environment = "staging"
    Project     = "railway-control"
    ManagedBy   = "terraform"
  }
}