# 🚀 Guía Universal de Deployment a Azure Web Apps

## 📋 Tabla de Contenidos

- [🎯 Introducción](#-introducción)
- [📋 Prerrequisitos](#-prerrequisitos)
- [�️ Infrastructure as Code (IaC)](#️-infrastructure-as-code-iac)
- [�🌐 Método 1: Portal Web de Azure (Manual)](#-método-1-portal-web-de-azure-manual)
- [⚡ Método 2: Azure CLI](#-método-2-azure-cli)
- [🔄 Método 3: Azure DevOps Pipelines](#-método-3-azure-devops-pipelines)
- [🐙 Método 4: GitHub Actions](#-método-4-github-actions)
- [🎯 Advanced Deployment Strategies](#-advanced-deployment-strategies)
- [🐳 Docker Hub Integration](#-docker-hub-integration)
- [🏷️ Git Tags y Versionado](#️-git-tags-y-versionado)
- [🔙 Rollback Procedures](#-rollback-procedures)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [�️ Quality Gates & Advanced Testing](#️-quality-gates--advanced-testing)
- [🔄 GitOps Implementation](#-gitops-implementation)
- [🏥 Disaster Recovery](#-disaster-recovery)
- [�📊 Best Practices](#-best-practices)
- [🎯 Quick Reference](#-quick-reference)
- [📚 Additional Resources](#-additional-resources)

---

## 🎯 Introducción

Esta guía cubre **todos los métodos posibles** para hacer deployment de aplicaciones web a **Azure Web Apps**, incluyendo aplicaciones containerizadas con Docker.

### 🎭 Audiencia

- 👨‍💻 **Desarrolladores** - Deployments manuales y setup inicial
- 👨‍🔧 **DevOps Engineers** - Automatización y CI/CD
- 🏢 **Equipos Enterprise** - Pipelines corporativos y governance
- 🚀 **Startups** - Deployment rápido y económico

### 🛠️ Tecnologías Cubiertas

- ⚛️ **Frontend**: React, Vue, Angular, Svelte, etc.
- 🖥️ **Backend**: Node.js, .NET, Python, Java, PHP
- 🐳 **Containerization**: Docker, Docker Compose
- 📦 **Registries**: Docker Hub, Azure Container Registry
- 🔄 **CI/CD**: GitHub Actions, Azure DevOps, GitLab CI

---

## 📋 Prerrequisitos

### 🔧 Herramientas Necesarias

```bash
# Verificar versiones instaladas
az --version           # Azure CLI 2.30.0+
docker --version       # Docker 20.0.0+
git --version         # Git 2.30.0+
node --version        # Node.js 18.0.0+ (si aplica)
```

### ☁️ Recursos de Azure

- **Azure Subscription** activa
- **Resource Group** creado
- **App Service Plan** (será creado si no existe)
- **Azure Container Registry** (opcional, para registries privados)

### 🔑 Credenciales y Permisos

```bash
# Login en Azure CLI
az login

# Verificar suscripción activa
az account show

# Configurar suscripción por defecto
az account set --subscription "your-subscription-id"
```

---

## 🏗️ Infrastructure as Code (IaC)

### 🎯 **¿Por Qué IaC?**

- ✅ **Reproducibilidad**: Environments idénticos
- ✅ **Versionado**: Infrastructure changes tracked
- ✅ **Rollback**: Revert infrastructure changes
- ✅ **Testing**: Infrastructure validation
- ✅ **Compliance**: Policy enforcement

### 🔧 **Terraform Implementation**

#### **📁 terraform/main.tf**

```hcl
# Configure the Azure Provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "tfstate${random_string.suffix.result}"
    container_name       = "tfstate"
    key                  = "myapp.terraform.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}

# Data sources
data "azurerm_client_config" "current" {}

# Random suffix for unique names
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = var.tags
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = var.app_service_plan_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  os_type  = "Linux"
  sku_name = var.app_service_plan_sku

  tags = var.tags
}

# Container Registry
resource "azurerm_container_registry" "main" {
  name                = "${var.app_name}registry${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = true

  tags = var.tags
}

# Key Vault
resource "azurerm_key_vault" "main" {
  name                       = "${var.app_name}-kv-${random_string.suffix.result}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  purge_protection_enabled   = false

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get", "List", "Update", "Create", "Import", "Delete", "Recover", "Backup", "Restore",
    ]

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Recover", "Backup", "Restore",
    ]
  }

  tags = var.tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "${var.app_name}-insights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"

  tags = var.tags
}

# Web Apps for each environment
resource "azurerm_linux_web_app" "environments" {
  for_each = var.environments

  name                = "${var.app_name}-${each.key}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = each.value.always_on

    application_stack {
      docker_image     = "${azurerm_container_registry.main.login_server}/${var.app_name}"
      docker_image_tag = each.value.image_tag
    }
  }

  app_settings = merge({
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.main.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.main.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.main.admin_password
    "APPINSIGHTS_INSTRUMENTATIONKEY"  = azurerm_application_insights.main.instrumentation_key
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "NODE_ENV" = each.value.node_env
  }, each.value.app_settings)

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags

  depends_on = [azurerm_container_registry.main]
}

# Key Vault access for Web Apps
resource "azurerm_key_vault_access_policy" "webapps" {
  for_each = var.environments

  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.environments[each.key].identity[0].principal_id

  secret_permissions = [
    "Get", "List"
  ]
}

# CDN Profile (optional)
resource "azurerm_cdn_profile" "main" {
  count               = var.enable_cdn ? 1 : 0
  name                = "${var.app_name}-cdn"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "Standard_Microsoft"

  tags = var.tags
}

# CDN Endpoints
resource "azurerm_cdn_endpoint" "environments" {
  for_each = var.enable_cdn ? var.environments : {}

  name                = "${var.app_name}-${each.key}-cdn"
  profile_name        = azurerm_cdn_profile.main[0].name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  origin {
    name      = "webapp"
    host_name = azurerm_linux_web_app.environments[each.key].default_hostname
  }

  tags = var.tags
}
```

#### **📁 terraform/variables.tf**

```hcl
variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "myapp"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "rg-myapp-infrastructure"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "app_service_plan_sku" {
  description = "SKU for the App Service Plan"
  type        = string
  default     = "P1v2"

  validation {
    condition = contains([
      "B1", "B2", "B3",           # Basic
      "S1", "S2", "S3",           # Standard
      "P1v2", "P2v2", "P3v2",    # Premium v2
      "P1v3", "P2v3", "P3v3"     # Premium v3
    ], var.app_service_plan_sku)
    error_message = "app_service_plan_sku must be a valid App Service Plan SKU."
  }
}

variable "acr_sku" {
  description = "SKU for Azure Container Registry"
  type        = string
  default     = "Standard"

  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.acr_sku)
    error_message = "acr_sku must be Basic, Standard, or Premium."
  }
}

variable "environments" {
  description = "Configuration for each environment"
  type = map(object({
    image_tag    = string
    node_env     = string
    always_on    = bool
    app_settings = map(string)
  }))

  default = {
    dev = {
      image_tag    = "develop"
      node_env     = "development"
      always_on    = false
      app_settings = {
        "DEBUG" = "true"
      }
    }
    staging = {
      image_tag    = "latest"
      node_env     = "staging"
      always_on    = true
      app_settings = {
        "DEBUG" = "false"
      }
    }
    prod = {
      image_tag    = "latest"
      node_env     = "production"
      always_on    = true
      app_settings = {
        "DEBUG" = "false"
      }
    }
  }
}

variable "enable_cdn" {
  description = "Enable CDN for the application"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "production"
    Project     = "myapp"
    ManagedBy   = "terraform"
  }
}
```

#### **📁 terraform/outputs.tf**

```hcl
output "resource_group_name" {
  description = "Name of the created resource group"
  value       = azurerm_resource_group.main.name
}

output "web_app_urls" {
  description = "URLs of the created web apps"
  value = {
    for env, webapp in azurerm_linux_web_app.environments :
    env => "https://${webapp.default_hostname}"
  }
}

output "container_registry" {
  description = "Container registry details"
  value = {
    name         = azurerm_container_registry.main.name
    login_server = azurerm_container_registry.main.login_server
    admin_username = azurerm_container_registry.main.admin_username
  }
  sensitive = false
}

output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "application_insights" {
  description = "Application Insights details"
  value = {
    name                   = azurerm_application_insights.main.name
    instrumentation_key    = azurerm_application_insights.main.instrumentation_key
    connection_string      = azurerm_application_insights.main.connection_string
  }
  sensitive = true
}

output "cdn_endpoints" {
  description = "CDN endpoint URLs"
  value = var.enable_cdn ? {
    for env, endpoint in azurerm_cdn_endpoint.environments :
    env => "https://${endpoint.fqdn}"
  } : {}
}
```

### 🚀 **Terraform Deployment**

```bash
# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan -var-file="environments/prod.tfvars"

# Apply infrastructure
terraform apply -var-file="environments/prod.tfvars"

# Destroy infrastructure (if needed)
terraform destroy -var-file="environments/prod.tfvars"
```

### 🔄 **Bicep Alternative**

#### **📁 bicep/main.bicep**

```bicep
@description('Name of the application')
param appName string = 'myapp'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('SKU for the App Service Plan')
@allowed(['B1', 'B2', 'B3', 'S1', 'S2', 'S3', 'P1v2', 'P2v2', 'P3v2'])
param appServicePlanSku string = 'P1v2'

@description('Environments to create')
param environments array = [
  {
    name: 'dev'
    imageTag: 'develop'
    nodeEnv: 'development'
    alwaysOn: false
  }
  {
    name: 'staging'
    imageTag: 'latest'
    nodeEnv: 'staging'
    alwaysOn: true
  }
  {
    name: 'prod'
    imageTag: 'latest'
    nodeEnv: 'production'
    alwaysOn: true
  }
]

var uniqueSuffix = substring(uniqueString(resourceGroup().id), 0, 6)

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: appServicePlanSku
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2022-12-01' = {
  name: '${appName}registry${uniqueSuffix}'
  location: location
  sku: {
    name: 'Standard'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: '${appName}-kv-${uniqueSuffix}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
  }
}

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${appName}-insights'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

// Web Apps
resource webApps 'Microsoft.Web/sites@2022-03-01' = [for env in environments: {
  name: '${appName}-${env.name}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${containerRegistry.properties.loginServer}/${appName}:${env.imageTag}'
      alwaysOn: env.alwaysOn
      appSettings: [
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${containerRegistry.properties.loginServer}'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: containerRegistry.name
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: applicationInsights.properties.InstrumentationKey
        }
        {
          name: 'NODE_ENV'
          value: env.nodeEnv
        }
      ]
    }
  }
}]

// Outputs
output webAppUrls object = {
  for i in range(0, length(environments)): environments[i].name => 'https://${webApps[i].properties.defaultHostName}'
}

output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output keyVaultName string = keyVault.name
```

---

## 🌐 Método 1: Portal Web de Azure (Manual)

### 🎯 Cuándo Usar

- ✅ Deployments puntuales y exploratorios
- ✅ Configuración inicial de recursos
- ✅ Equipos pequeños sin CI/CD
- ✅ Testing de configuraciones

### 📋 Paso a Paso

#### 1️⃣ **Crear App Service**

1. **Ir a Azure Portal** → https://portal.azure.com
2. **Crear recurso** → "Web App"
3. **Configuración básica**:

   ```
   Subscription: [Tu suscripción]
   Resource Group: [Crear nuevo o usar existente]
   Name: my-app-[unique-suffix]
   Publish: Docker Container
   Operating System: Linux
   Region: [Región más cercana]
   ```

4. **App Service Plan**:
   ```
   Linux Plan: [Crear nuevo]
   Sku and size: B1 Basic (para desarrollo)
                 P1V2 Premium (para producción)
   ```

#### 2️⃣ **Configurar Docker**

1. **Docker Tab**:

   ```
   Options: Single Container
   Image Source: Docker Hub (público) / Azure Container Registry (privado)
   Image and tag: username/app-name:latest
   ```

2. **Configuración avanzada**:
   ```
   Registry Server URL: https://index.docker.io/v1/ (Docker Hub)
   Registry Username: [tu-username] (si es privado)
   Registry Password: [tu-password/token]
   ```

#### 3️⃣ **Variables de Entorno**

```
Configuration → Application Settings:

NODE_ENV=production
PORT=8080
WEBSITE_PORT=8080
DOCKER_ENABLE_CI=true
```

#### 4️⃣ **Deployment**

1. **Review + Create** → **Create**
2. **Ir a la App** → **Deployment Center**
3. **Enable Continuous Deployment** (opcional)
4. **Save** → **Sync** para forzar nueva imagen

### 🔄 **Updates Manuales**

```bash
# 1. Build nueva imagen
docker build -t username/app-name:v1.1.0 .
docker push username/app-name:v1.1.0

# 2. En Azure Portal:
# App Service → Deployment Center → Settings
# Cambiar tag: v1.1.0 → Save → Sync
```

---

## ⚡ Método 2: Azure CLI

### 🎯 Cuándo Usar

- ✅ Automatización con scripts
- ✅ Deployments reproducibles
- ✅ CI/CD personalizado
- ✅ Operaciones por lotes

### 🛠️ Setup Inicial

#### 1️⃣ **Crear Resource Group**

```bash
# Variables de configuración
RESOURCE_GROUP="rg-myapp-prod"
LOCATION="eastus"
APP_NAME="myapp-$(date +%s)"  # Nombre único
PLAN_NAME="plan-myapp-prod"

# Crear resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

#### 2️⃣ **Crear App Service Plan**

```bash
# Plan básico para desarrollo
az appservice plan create \
  --name $PLAN_NAME \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Plan premium para producción
az appservice plan create \
  --name $PLAN_NAME \
  --resource-group $RESOURCE_GROUP \
  --sku P1V2 \
  --is-linux
```

#### 3️⃣ **Crear Web App**

```bash
# Web App con Docker
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $PLAN_NAME \
  --name $APP_NAME \
  --deployment-container-image-name nginx:alpine
```

### 🐳 **Deployment con Docker**

#### **Deploy desde Docker Hub**

```bash
# Configurar imagen de Docker Hub
az webapp config container set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --container-image-name username/app-name:latest \
  --container-registry-url https://index.docker.io/v1/ \
  --container-registry-user username \
  --container-registry-password password

# Variables de entorno
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    WEBSITE_PORT=8080 \
    DOCKER_ENABLE_CI=true

# Reiniciar app
az webapp restart \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP
```

#### **Deploy desde Azure Container Registry**

```bash
# Crear ACR
ACR_NAME="myappregistry$(date +%s)"
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic

# Login en ACR
az acr login --name $ACR_NAME

# Build y push
az acr build \
  --registry $ACR_NAME \
  --image myapp:v1.0.0 .

# Configure Web App
az webapp config container set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --container-image-name $ACR_NAME.azurecr.io/myapp:v1.0.0 \
  --container-registry-url https://$ACR_NAME.azurecr.io
```

### 📝 **Scripts de Deployment**

#### **deploy.sh** (Linux/Mac)

```bash
#!/bin/bash
set -e

# Variables
VERSION=${1:-latest}
RESOURCE_GROUP="rg-myapp-prod"
APP_NAME="myapp-prod"
IMAGE_NAME="username/app-name:$VERSION"

echo "🚀 Deploying $IMAGE_NAME to $APP_NAME..."

# Verificar que la imagen existe
docker pull $IMAGE_NAME

# Update Azure Web App
az webapp config container set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --container-image-name $IMAGE_NAME

# Restart app
az webapp restart \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP

echo "✅ Deployment completed!"
echo "🌐 URL: https://$APP_NAME.azurewebsites.net"
```

#### **deploy.ps1** (Windows)

```powershell
param(
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest"
)

# Variables
$RESOURCE_GROUP = "rg-myapp-prod"
$APP_NAME = "myapp-prod"
$IMAGE_NAME = "username/app-name:$Version"

Write-Host "🚀 Deploying $IMAGE_NAME to $APP_NAME..." -ForegroundColor Green

# Verificar imagen
docker pull $IMAGE_NAME

# Update Azure Web App
az webapp config container set `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --container-image-name $IMAGE_NAME

# Restart app
az webapp restart `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 URL: https://$APP_NAME.azurewebsites.net" -ForegroundColor Cyan
```

### 🔄 **Deployment Workflow**

```bash
# 1. Build y test local
npm run build
npm run test

# 2. Build y push Docker
docker build -t username/app-name:v1.1.0 .
docker push username/app-name:v1.1.0

# 3. Deploy to Azure
./deploy.sh v1.1.0

# 4. Verificar deployment
az webapp show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "state" \
  --output tsv
```

---

## 🔄 Método 3: Azure DevOps Pipelines

### 🎯 Cuándo Usar

- ✅ Empresas con Azure DevOps
- ✅ Pipelines complejos multi-stage
- ✅ Governance y compliance estricto
- ✅ Integration con Azure boards/repos

### 🛠️ Setup Inicial

#### 1️⃣ **Service Connection**

1. **Azure DevOps** → **Project Settings** → **Service connections**
2. **New service connection** → **Azure Resource Manager**
3. **Service principal (automatic)**:
   ```
   Subscription: [Tu suscripción]
   Resource group: [Tu resource group]
   Service connection name: azure-connection
   Grant access permission to all pipelines: ✅
   ```

#### 2️⃣ **Variable Groups**

**Library** → **Variable groups** → **+ Variable group**

```yaml
# Production Variables
AZURE_SUBSCRIPTION: "azure-connection"
RESOURCE_GROUP: "rg-myapp-prod"
APP_NAME: "myapp-prod"
DOCKER_REGISTRY: "username"
DOCKER_REPOSITORY: "app-name"
```

### 📄 **Pipeline YAML**

#### **azure-pipelines.yml**

```yaml
# Azure DevOps Pipeline para Docker deployment
trigger:
  branches:
    include:
      - main
      - develop
  tags:
    include:
      - v*

pool:
  vmImage: "ubuntu-latest"

variables:
  - group: "production-variables"
  - name: dockerfilePath
    value: "$(Build.SourcesDirectory)/Dockerfile"
  - name: tag
    value: "$(Build.BuildId)"

stages:
  - stage: Build
    displayName: "Build and Push Docker Image"
    jobs:
      - job: Build
        displayName: "Build Job"
        steps:
          - task: Docker@2
            displayName: "Build Docker Image"
            inputs:
              command: "build"
              dockerfile: $(dockerfilePath)
              tags: |
                $(DOCKER_REGISTRY)/$(DOCKER_REPOSITORY):$(tag)
                $(DOCKER_REGISTRY)/$(DOCKER_REPOSITORY):latest

          - task: Docker@2
            displayName: "Push to Docker Hub"
            inputs:
              command: "push"
              containerRegistry: "docker-hub-connection"
              repository: "$(DOCKER_REGISTRY)/$(DOCKER_REPOSITORY)"
              tags: |
                $(tag)
                latest

  - stage: Deploy
    displayName: "Deploy to Azure"
    dependsOn: Build
    condition: succeeded()
    jobs:
      - deployment: Deploy
        displayName: "Deploy to Azure Web App"
        environment: "production"
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebAppContainer@1
                  displayName: "Deploy Container to Azure Web App"
                  inputs:
                    azureSubscription: "$(AZURE_SUBSCRIPTION)"
                    appName: "$(APP_NAME)"
                    resourceGroupName: "$(RESOURCE_GROUP)"
                    imageName: "$(DOCKER_REGISTRY)/$(DOCKER_REPOSITORY):$(tag)"
```

#### **Multi-Environment Pipeline**

```yaml
# azure-pipelines-multi-env.yml
trigger:
  branches:
    include:
      - main
      - develop
  tags:
    include:
      - v*

pool:
  vmImage: "ubuntu-latest"

variables:
  - name: dockerfilePath
    value: "$(Build.SourcesDirectory)/Dockerfile"
  - name: tag
    value: "$(Build.BuildId)"

stages:
  - stage: Build
    displayName: "Build Stage"
    jobs:
      - job: Build
        displayName: "Build and Test"
        steps:
          - script: |
              npm ci
              npm run build
              npm run test
            displayName: "NPM Build and Test"

          - task: Docker@2
            displayName: "Build Docker Image"
            inputs:
              command: "build"
              dockerfile: $(dockerfilePath)
              tags: |
                myregistry/myapp:$(tag)
                myregistry/myapp:latest

          - task: Docker@2
            displayName: "Push Docker Image"
            inputs:
              command: "push"
              containerRegistry: "docker-hub-connection"
              repository: "myregistry/myapp"
              tags: |
                $(tag)
                latest

  - stage: DeployDev
    displayName: "Deploy to Development"
    dependsOn: Build
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
    variables:
      - group: "dev-variables"
    jobs:
      - deployment: DeployDev
        displayName: "Deploy to Dev Environment"
        environment: "development"
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebAppContainer@1
                  inputs:
                    azureSubscription: "$(AZURE_SUBSCRIPTION)"
                    appName: "$(APP_NAME_DEV)"
                    resourceGroupName: "$(RESOURCE_GROUP_DEV)"
                    imageName: "myregistry/myapp:$(tag)"

  - stage: DeployProd
    displayName: "Deploy to Production"
    dependsOn: Build
    condition: and(succeeded(), or(eq(variables['Build.SourceBranch'], 'refs/heads/main'), startsWith(variables['Build.SourceBranch'], 'refs/tags/v')))
    variables:
      - group: "prod-variables"
    jobs:
      - deployment: DeployProd
        displayName: "Deploy to Production"
        environment: "production"
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebAppContainer@1
                  inputs:
                    azureSubscription: "$(AZURE_SUBSCRIPTION)"
                    appName: "$(APP_NAME_PROD)"
                    resourceGroupName: "$(RESOURCE_GROUP_PROD)"
                    imageName: "myregistry/myapp:$(tag)"
```

---

## 🐙 Método 4: GitHub Actions

### 🎯 Cuándo Usar

- ✅ Repositorios en GitHub
- ✅ Open source projects
- ✅ Startups y equipos ágiles
- ✅ Integration nativa con GitHub

### 🔐 **Setup de Secrets**

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

```
AZURE_CREDENTIALS         # Service Principal JSON
DOCKER_HUB_USERNAME       # Docker Hub username
DOCKER_HUB_ACCESS_TOKEN   # Docker Hub access token
AZURE_WEBAPP_NAME         # Azure Web App name
AZURE_RESOURCE_GROUP      # Azure Resource Group
```

#### **Crear Service Principal**

```bash
# Crear service principal para GitHub Actions
az ad sp create-for-rbac \
  --name "github-actions-sp" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
  --sdk-auth

# Output (guardar como AZURE_CREDENTIALS):
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### 📄 **GitHub Actions Workflows**

#### **.github/workflows/deploy.yml**

```yaml
name: 🚀 Deploy to Azure Web App

on:
  push:
    branches: [main]
    tags: ["v*"]
  pull_request:
    branches: [main]

env:
  DOCKER_IMAGE: ${{ secrets.DOCKER_HUB_USERNAME }}/myapp
  AZURE_WEBAPP_NAME: ${{ secrets.AZURE_WEBAPP_NAME }}
  AZURE_RESOURCE_GROUP: ${{ secrets.AZURE_RESOURCE_GROUP }}

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🛠️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🧪 Run tests
        run: npm run test

      - name: 🏗️ Build application
        run: npm run build

      - name: 🐳 Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: 🔐 Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}

      - name: 📊 Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_IMAGE }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: 🏗️ Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')

    steps:
      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 📊 Determine image tag
        id: image_tag
        run: |
          if [[ ${{ github.ref }} == refs/tags/v* ]]; then
            echo "tag=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT
          else
            echo "tag=latest" >> $GITHUB_OUTPUT
          fi

      - name: 🚀 Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ env.AZURE_WEBAPP_NAME }}
          resource-group: ${{ env.AZURE_RESOURCE_GROUP }}
          images: ${{ env.DOCKER_IMAGE }}:${{ steps.image_tag.outputs.tag }}

      - name: 🔍 Verify deployment
        run: |
          echo "🌐 Application URL: https://${{ env.AZURE_WEBAPP_NAME }}.azurewebsites.net"

          # Wait for deployment to be ready
          sleep 30

          # Check if app is responding
          response=$(curl -s -o /dev/null -w "%{http_code}" https://${{ env.AZURE_WEBAPP_NAME }}.azurewebsites.net)
          if [ $response -eq 200 ]; then
            echo "✅ Deployment successful! App is responding."
          else
            echo "❌ Deployment verification failed. HTTP status: $response"
            exit 1
          fi
```

#### **Multi-Environment Workflow**

```yaml
# .github/workflows/deploy-multi-env.yml
name: 🌍 Multi-Environment Deployment

on:
  push:
    branches: [main, develop]
    tags: ["v*"]

env:
  DOCKER_IMAGE: ${{ secrets.DOCKER_HUB_USERNAME }}/myapp

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}

    steps:
      - uses: actions/checkout@v4

      - name: 🛠️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: 📦 Install and test
        run: |
          npm ci
          npm run test
          npm run build

      - name: 🔐 Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}

      - name: 📊 Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_IMAGE }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: 🏗️ Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}

  deploy-dev:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: development

    steps:
      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🚀 Deploy to Development
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME_DEV }}
          resource-group: ${{ secrets.AZURE_RESOURCE_GROUP_DEV }}
          images: ${{ env.DOCKER_IMAGE }}:develop

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging

    steps:
      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🚀 Deploy to Staging
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME_STAGING }}
          resource-group: ${{ secrets.AZURE_RESOURCE_GROUP_STAGING }}
          images: ${{ env.DOCKER_IMAGE }}:latest

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production

    steps:
      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 📊 Extract version
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT

      - name: 🚀 Deploy to Production
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME_PROD }}
          resource-group: ${{ secrets.AZURE_RESOURCE_GROUP_PROD }}
          images: ${{ env.DOCKER_IMAGE }}:${{ steps.version.outputs.version }}

      - name: 📢 Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ steps.version.outputs.version }}
          release_name: Release ${{ steps.version.outputs.version }}
          draft: false
          prerelease: false
```

---

## 🎯 Advanced Deployment Strategies

### 🔵 **Blue-Green Deployments**

#### **Concepto**

- **Blue**: Ambiente de producción actual
- **Green**: Nuevo ambiente con nueva versión
- **Switch**: Cambio instantáneo del tráfico
- **Rollback**: Immediate switch back si hay problemas

#### **Azure Implementation**

```bash
# Create blue-green slots
az webapp deployment slot create \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --slot green

# Deploy to green slot
az webapp config container set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --slot green \
  --container-image-name username/myapp:v2.0.0

# Test green slot
curl https://myapp-prod-green.azurewebsites.net/health

# Swap slots (green becomes production)
az webapp deployment slot swap \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --slot green \
  --target-slot production
```

#### **GitHub Actions Blue-Green**

```yaml
name: 🔵🟢 Blue-Green Deployment

on:
  push:
    tags: ["v*"]

env:
  AZURE_WEBAPP_NAME: myapp-prod
  RESOURCE_GROUP: rg-myapp-prod

jobs:
  blue-green-deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🐳 Build and push image
        run: |
          docker build -t username/myapp:${{ github.ref_name }} .
          echo ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }} | docker login -u ${{ secrets.DOCKER_HUB_USERNAME }} --password-stdin
          docker push username/myapp:${{ github.ref_name }}

      - name: 🟢 Deploy to Green Slot
        run: |
          # Ensure green slot exists
          az webapp deployment slot create \
            --name ${{ env.AZURE_WEBAPP_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --slot green || true

          # Deploy to green slot
          az webapp config container set \
            --name ${{ env.AZURE_WEBAPP_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --slot green \
            --container-image-name username/myapp:${{ github.ref_name }}

      - name: 🔍 Health Check Green Slot
        run: |
          GREEN_URL="https://${{ env.AZURE_WEBAPP_NAME }}-green.azurewebsites.net"

          # Wait for deployment
          sleep 60

          # Health check with retries
          for i in {1..10}; do
            echo "Health check attempt $i/10..."
            
            response=$(curl -s -o /dev/null -w "%{http_code}" $GREEN_URL/health || echo "000")
            if [ "$response" == "200" ]; then
              echo "✅ Green slot health check passed"
              break
            elif [ $i -eq 10 ]; then
              echo "❌ Green slot health check failed after 10 attempts"
              exit 1
            fi
            
            sleep 30
          done

      - name: 🔄 Swap to Production
        run: |
          echo "🔄 Swapping green slot to production..."
          az webapp deployment slot swap \
            --name ${{ env.AZURE_WEBAPP_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --slot green \
            --target-slot production

      - name: ✅ Verify Production
        run: |
          PROD_URL="https://${{ env.AZURE_WEBAPP_NAME }}.azurewebsites.net"

          # Final production verification
          sleep 30
          response=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/health)

          if [ "$response" == "200" ]; then
            echo "✅ Blue-Green deployment successful!"
          else
            echo "❌ Production verification failed, initiating rollback..."
            
            # Emergency rollback
            az webapp deployment slot swap \
              --name ${{ env.AZURE_WEBAPP_NAME }} \
              --resource-group ${{ env.RESOURCE_GROUP }} \
              --slot production \
              --target-slot green
            
            exit 1
          fi
```

### 🐤 **Canary Deployments**

#### **Concepto**

- **Traffic Split**: 95% old version, 5% new version
- **Gradual Rollout**: Increase percentage gradually
- **Monitoring**: Watch metrics closely
- **Auto-rollback**: If metrics degrade

#### **Azure Traffic Manager Implementation**

```bash
# Create Traffic Manager Profile
az network traffic-manager profile create \
  --name myapp-canary-tm \
  --resource-group rg-myapp-prod \
  --routing-method Weighted \
  --unique-dns-name myapp-canary-${RANDOM}

# Add current production endpoint (95% traffic)
az network traffic-manager endpoint create \
  --name production \
  --profile-name myapp-canary-tm \
  --resource-group rg-myapp-prod \
  --type azureEndpoints \
  --target-resource-id "/subscriptions/${SUB_ID}/resourceGroups/${RG}/providers/Microsoft.Web/sites/myapp-prod" \
  --weight 95

# Add canary endpoint (5% traffic)
az network traffic-manager endpoint create \
  --name canary \
  --profile-name myapp-canary-tm \
  --resource-group rg-myapp-prod \
  --type azureEndpoints \
  --target-resource-id "/subscriptions/${SUB_ID}/resourceGroups/${RG}/providers/Microsoft.Web/sites/myapp-canary" \
  --weight 5
```

### 🚩 **Feature Flags/Toggles**

#### **Implementation with Azure App Configuration**

```bash
# Create App Configuration store
az appconfig create \
  --name myapp-config \
  --resource-group rg-myapp-prod \
  --location eastus \
  --sku standard

# Create feature flag
az appconfig feature set \
  --name myapp-config \
  --feature "new-ui-enabled" \
  --description "Enable new railway UI" \
  --enabled true
```

#### **React Feature Flag Hook**

```typescript
// src/hooks/useFeatureFlag.ts
import { useEffect, useState } from "react";

export const useFeatureFlag = (
  flagName: string,
  defaultValue: boolean = false
): boolean => {
  const [isEnabled, setIsEnabled] = useState(defaultValue);

  useEffect(() => {
    // In production, this would fetch from Azure App Configuration
    // For now, using environment variables
    const envFlag = process.env[`REACT_APP_FEATURE_${flagName.toUpperCase()}`];

    if (envFlag !== undefined) {
      setIsEnabled(envFlag === "true");
    }
  }, [flagName]);

  return isEnabled;
};
```

---

## 🐳 Docker Hub Integration

### 🎯 **Setup de Docker Hub**

#### 1️⃣ **Crear Repository**

1. **Docker Hub** → https://hub.docker.com
2. **Create Repository**:
   ```
   Name: myapp
   Visibility: Public/Private
   Description: My awesome application
   ```

#### 2️⃣ **Access Tokens**

1. **Account Settings** → **Security** → **New Access Token**
2. **Token description**: `azure-deployment`
3. **Access permissions**: `Read, Write, Delete`
4. **Generate** → **Copy token** (guardar seguro)

### 🏗️ **Build and Push Strategies**

#### **Manual Build & Push**

```bash
# Build multi-platform
docker buildx create --name multiplatform --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag username/myapp:v1.0.0 \
  --tag username/myapp:latest \
  --push .

# Single platform
docker build -t username/myapp:v1.0.0 .
docker tag username/myapp:v1.0.0 username/myapp:latest
docker push username/myapp:v1.0.0
docker push username/myapp:latest
```

#### **Automated Builds**

```yaml
# docker-build.yml
name: 🐳 Docker Build & Push

on:
  push:
    branches: [main, develop]
    tags: ["v*"]

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 🐳 Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: 🔐 Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}

      - name: 📊 Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: username/myapp
          tags: |
            # Branch name
            type=ref,event=branch
            # Tag name (for releases)
            type=ref,event=tag
            # Latest for main branch
            type=raw,value=latest,enable={{is_default_branch}}
            # Short SHA for all builds
            type=sha,prefix={{branch}}-

      - name: 🏗️ Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 🔄 **Image Management**

#### **Tagging Strategy**

```bash
# Semantic versioning
docker tag myapp:latest username/myapp:v1.2.3
docker tag myapp:latest username/myapp:v1.2
docker tag myapp:latest username/myapp:v1
docker tag myapp:latest username/myapp:latest

# Environment-based
docker tag myapp:latest username/myapp:dev
docker tag myapp:latest username/myapp:staging
docker tag myapp:latest username/myapp:prod

# Feature branches
docker tag myapp:latest username/myapp:feature-auth
docker tag myapp:latest username/myapp:hotfix-1.2.1
```

#### **Cleanup Old Images**

```bash
# Manual cleanup
docker rmi username/myapp:old-tag

# Automated cleanup script
#!/bin/bash
# cleanup-docker-images.sh

REPOSITORY="username/myapp"
KEEP_LAST=10

# Get list of tags (excluding latest)
TAGS=$(curl -s "https://registry.hub.docker.com/v2/repositories/$REPOSITORY/tags/" | \
       jq -r '.results[].name' | \
       grep -v latest | \
       sort -V | \
       head -n -$KEEP_LAST)

# Delete old tags
for TAG in $TAGS; do
  echo "Deleting $REPOSITORY:$TAG"
  # Note: Requires Docker Hub API token with delete permissions
  curl -X DELETE \
    -H "Authorization: Bearer $DOCKER_HUB_TOKEN" \
    "https://hub.docker.com/v2/repositories/$REPOSITORY/tags/$TAG/"
done
```

---

## 🏷️ Git Tags y Versionado

### 📋 **Semantic Versioning**

```bash
# Formato: v{MAJOR}.{MINOR}.{PATCH}
# v1.0.0  - Initial release
# v1.0.1  - Patch (bug fixes)
# v1.1.0  - Minor (new features, backward compatible)
# v2.0.0  - Major (breaking changes)
```

### 🏷️ **Creating Tags**

#### **Manual Tags**

```bash
# Create and push tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Create tag from specific commit
git tag -a v1.0.1 9fceb02 -m "Hotfix version 1.0.1"
git push origin v1.0.1

# List all tags
git tag -l

# Delete tag (local and remote)
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

#### **Automated Tagging**

```yaml
# .github/workflows/auto-tag.yml
name: 🏷️ Auto Tag

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      version:
        description: "Version to tag (e.g., v1.0.0)"
        required: true

jobs:
  tag:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 📊 Bump version and create tag
        id: tag_version
        uses: mathieudutour/github-tag-action@v6.1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          default_bump: patch
          tag_prefix: v

      - name: 🚀 Trigger deployment
        if: steps.tag_version.outputs.new_tag
        run: |
          echo "New tag created: ${{ steps.tag_version.outputs.new_tag }}"
          echo "Changelog: ${{ steps.tag_version.outputs.changelog }}"
```

### 🚀 **Version-based Deployment**

#### **Deploy Specific Version**

```bash
# Azure CLI
az webapp config container set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --container-image-name username/myapp:v1.2.3

# PowerShell script for specific version
param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$IMAGE_NAME = "username/myapp:$Version"
$APP_NAME = "myapp-prod"
$RESOURCE_GROUP = "rg-myapp-prod"

Write-Host "🚀 Deploying version $Version..." -ForegroundColor Green

# Verify image exists
docker pull $IMAGE_NAME

# Deploy to Azure
az webapp config container set `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --container-image-name $IMAGE_NAME

az webapp restart `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP

Write-Host "✅ Deployed $Version successfully!" -ForegroundColor Green
```

#### **GitHub Actions with Version Matrix**

```yaml
name: 🚀 Deploy Multiple Versions

on:
  workflow_dispatch:
    inputs:
      versions:
        description: "Comma-separated versions to deploy (e.g., v1.0.0,v1.1.0)"
        required: true
      environment:
        description: "Target environment"
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        version: ${{ fromJson(format('["{0}"]', join(split(github.event.inputs.versions, ','), '","'))) }}

    steps:
      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🚀 Deploy version ${{ matrix.version }}
        uses: azure/webapps-deploy@v2
        with:
          app-name: myapp-${{ github.event.inputs.environment }}
          resource-group: rg-myapp-${{ github.event.inputs.environment }}
          images: username/myapp:${{ matrix.version }}
```

---

## 🔙 Rollback Procedures

### 🎯 **Cuándo Hacer Rollback**

- ❌ **Aplicación no responde** (HTTP 5xx errors)
- ❌ **Funcionalidades críticas fallan**
- ❌ **Performance degradation significativo**
- ❌ **Security vulnerabilities detectadas**
- ❌ **Data corruption o pérdida**

### ⚡ **Rollback Methods**

#### **1️⃣ Azure Portal (Manual)**

1. **App Service** → **Deployment Center** → **Logs**
2. **Encontrar deployment exitoso anterior**
3. **Redeploy** → **Confirm**
4. **Monitor** hasta que esté estable

#### **2️⃣ Azure CLI (Rápido)**

```bash
# Lista deployments recientes
az webapp deployment list \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --query "[].{id:id, status:status, timestamp:end_time}" \
  --output table

# Rollback a deployment específico
DEPLOYMENT_ID="previous-deployment-id"
az webapp deployment source config \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --deployment-id $DEPLOYMENT_ID

# O cambiar a versión anterior conocida
az webapp config container set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --container-image-name username/myapp:v1.1.0

az webapp restart \
  --name myapp-prod \
  --resource-group rg-myapp-prod
```

#### **3️⃣ GitHub Actions Rollback**

```yaml
# .github/workflows/rollback.yml
name: 🔙 Emergency Rollback

on:
  workflow_dispatch:
    inputs:
      target_version:
        description: "Version to rollback to (e.g., v1.1.0)"
        required: true
      environment:
        description: "Environment to rollback"
        required: true
        type: choice
        options:
          - staging
          - production
      reason:
        description: "Reason for rollback"
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: ⚠️ Rollback Warning
        run: |
          echo "🚨 EMERGENCY ROLLBACK IN PROGRESS"
          echo "Environment: ${{ github.event.inputs.environment }}"
          echo "Target Version: ${{ github.event.inputs.target_version }}"
          echo "Reason: ${{ github.event.inputs.reason }}"
          echo "Initiated by: ${{ github.actor }}"

      - name: 🔍 Verify target image exists
        run: |
          docker pull username/myapp:${{ github.event.inputs.target_version }}

      - name: 🔙 Execute rollback
        uses: azure/webapps-deploy@v2
        with:
          app-name: myapp-${{ github.event.inputs.environment }}
          resource-group: rg-myapp-${{ github.event.inputs.environment }}
          images: username/myapp:${{ github.event.inputs.target_version }}

      - name: 🔍 Verify rollback
        run: |
          sleep 30
          APP_URL="https://myapp-${{ github.event.inputs.environment }}.azurewebsites.net"

          for i in {1..5}; do
            response=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)
            if [ $response -eq 200 ]; then
              echo "✅ Rollback verified! App is responding."
              break
            else
              echo "⏳ Attempt $i/5: App not ready yet (HTTP $response)"
              sleep 30
            fi
          done

      - name: 📝 Create incident issue
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `🚨 Emergency Rollback - ${{ github.event.inputs.environment }}`,
              body: `
              ## Emergency Rollback Executed
              
              **Environment:** ${{ github.event.inputs.environment }}
              **Rolled back to:** ${{ github.event.inputs.target_version }}
              **Reason:** ${{ github.event.inputs.reason }}
              **Executed by:** ${{ github.actor }}
              **Timestamp:** ${new Date().toISOString()}
              
              ## Next Steps
              - [ ] Investigate root cause
              - [ ] Create fix
              - [ ] Test fix in staging
              - [ ] Plan new deployment
              `,
              labels: ['incident', 'rollback', 'urgent']
            })
```

#### **4️⃣ Automated Rollback (Health Checks)**

```yaml
# .github/workflows/deploy-with-rollback.yml
name: 🚀 Deploy with Auto-Rollback

on:
  push:
    tags: ["v*"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 📊 Get current version (for rollback)
        id: current
        run: |
          CURRENT_IMAGE=$(az webapp config container show \
            --name myapp-prod \
            --resource-group rg-myapp-prod \
            --query "linux_fx_version" \
            --output tsv | cut -d'|' -f2)
          echo "image=$CURRENT_IMAGE" >> $GITHUB_OUTPUT

      - name: 🚀 Deploy new version
        uses: azure/webapps-deploy@v2
        with:
          app-name: myapp-prod
          resource-group: rg-myapp-prod
          images: username/myapp:${{ github.ref_name }}

      - name: 🔍 Health check
        id: health
        run: |
          APP_URL="https://myapp-prod.azurewebsites.net"

          # Wait for deployment
          sleep 60

          # Health check loop
          for i in {1..10}; do
            echo "Health check attempt $i/10..."
            
            # Basic availability
            response=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)
            if [ $response -ne 200 ]; then
              echo "❌ HTTP $response - Health check failed"
              echo "healthy=false" >> $GITHUB_OUTPUT
              exit 0
            fi
            
            # Performance check
            response_time=$(curl -s -o /dev/null -w "%{time_total}" $APP_URL)
            if (( $(echo "$response_time > 5.0" | bc -l) )); then
              echo "❌ Response time too slow: ${response_time}s"
              echo "healthy=false" >> $GITHUB_OUTPUT
              exit 0
            fi
            
            sleep 30
          done

          echo "✅ Health checks passed"
          echo "healthy=true" >> $GITHUB_OUTPUT

      - name: 🔙 Auto-rollback on failure
        if: steps.health.outputs.healthy == 'false'
        run: |
          echo "🚨 Auto-rollback triggered due to health check failure"

          az webapp config container set \
            --name myapp-prod \
            --resource-group rg-myapp-prod \
            --container-image-name ${{ steps.current.outputs.image }}

          az webapp restart \
            --name myapp-prod \
            --resource-group rg-myapp-prod

          echo "🔙 Rollback completed"
          exit 1
```

### 📋 **Rollback Checklist**

```markdown
## Emergency Rollback Checklist

### Pre-Rollback

- [ ] Identify last known good version
- [ ] Verify target image exists in registry
- [ ] Notify team of rollback decision
- [ ] Document incident details

### During Rollback

- [ ] Execute rollback procedure
- [ ] Monitor application health
- [ ] Verify functionality
- [ ] Check performance metrics

### Post-Rollback

- [ ] Confirm application stability
- [ ] Notify stakeholders
- [ ] Create incident report
- [ ] Plan investigation and fix
- [ ] Schedule post-mortem meeting
```

---

## 🛠️ Troubleshooting

### 🚨 **Common Issues**

#### **1️⃣ Container Won't Start**

**Síntomas:**

- App Service shows "Starting" indefinitely
- HTTP 503 Service Unavailable
- Container logs show exit code 1

**Diagnóstico:**

```bash
# Check container logs
az webapp log tail \
  --name myapp-prod \
  --resource-group rg-myapp-prod

# Check app settings
az webapp config appsettings list \
  --name myapp-prod \
  --resource-group rg-myapp-prod

# Check container configuration
az webapp config container show \
  --name myapp-prod \
  --resource-group rg-myapp-prod
```

**Soluciones:**

```bash
# Fix common port issues
az webapp config appsettings set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --settings WEBSITES_PORT=8080

# Enable container logging
az webapp log config \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --docker-container-logging filesystem

# Restart app
az webapp restart \
  --name myapp-prod \
  --resource-group rg-myapp-prod
```

#### **2️⃣ Docker Image Pull Failures**

**Síntomas:**

- "Unable to pull image" in logs
- Authentication errors
- Registry timeout errors

**Soluciones:**

```bash
# For private Docker Hub repos
az webapp config container set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --container-image-name username/myapp:latest \
  --container-registry-url https://index.docker.io/v1/ \
  --container-registry-user username \
  --container-registry-password "your-access-token"

# For Azure Container Registry
az webapp config container set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --container-image-name myregistry.azurecr.io/myapp:latest

# Enable admin user for ACR
az acr update \
  --name myregistry \
  --admin-enabled true
```

#### **3️⃣ Performance Issues**

**Síntomas:**

- Slow response times
- Timeouts
- High CPU/Memory usage

**Diagnóstico:**

```bash
# Check metrics
az monitor metrics list \
  --resource /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Web/sites/myapp-prod \
  --metric "CpuPercentage" \
  --aggregation Average

# Check scaling settings
az appservice plan show \
  --name plan-myapp-prod \
  --resource-group rg-myapp-prod
```

**Soluciones:**

```bash
# Scale up (increase instance size)
az appservice plan update \
  --name plan-myapp-prod \
  --resource-group rg-myapp-prod \
  --sku P1V2

# Scale out (increase instance count)
az webapp update \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --set siteCOnfig.numberOfWorkers=3

# Enable auto-scaling
az monitor autoscale create \
  --resource-group rg-myapp-prod \
  --resource /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Web/serverFarms/plan-myapp-prod \
  --name autoscale-rules \
  --min-count 1 \
  --max-count 5 \
  --count 1
```

#### **4️⃣ SSL/TLS Issues**

**Síntomas:**

- HTTPS not working
- Certificate errors
- Mixed content warnings

**Soluciones:**

```bash
# Enable HTTPS only
az webapp update \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --https-only true

# Add custom domain with SSL
az webapp config hostname add \
  --webapp-name myapp-prod \
  --resource-group rg-myapp-prod \
  --hostname mydomain.com

# Create SSL binding
az webapp config ssl bind \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --certificate-thumbprint {thumbprint} \
  --ssl-type SNI
```

### 🔍 **Diagnostic Tools**

#### **Log Analysis**

```bash
# Stream live logs
az webapp log tail \
  --name myapp-prod \
  --resource-group rg-myapp-prod

# Download log files
az webapp log download \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --log-file logs.zip

# Enable detailed logging
az webapp log config \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --application-logging true \
  --detailed-error-messages true \
  --failed-request-tracing true \
  --web-server-logging filesystem
```

#### **Health Monitoring**

```bash
# Add health check endpoint
az webapp config set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --generic-configurations '{"healthCheckPath": "/health"}'

# Configure Application Insights
az webapp config appsettings set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="{key}"
```

### 📞 **Emergency Contacts**

```markdown
## Emergency Response Contacts

### Technical Team

- **DevOps Lead**: devops@company.com
- **Backend Team**: backend@company.com
- **Frontend Team**: frontend@company.com

### Business Contacts

- **Product Manager**: pm@company.com
- **Customer Support**: support@company.com

### External Vendors

- **Azure Support**: [Azure Support Case URL]
- **CDN Provider**: [Support contact]
```

---

## �️ Quality Gates & Advanced Testing

### 🔒 **Security Scanning**

#### **SAST (Static Application Security Testing)**

```yaml
# .github/workflows/security-scan.yml
name: 🔒 Security Scanning

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  sast-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 🔍 CodeQL Analysis
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript

      - name: 🔍 Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 🔍 Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: 📊 Upload Snyk report
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: snyk.sarif

  docker-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 🐳 Build Docker image
        run: docker build -t security-test .

      - name: 🔍 Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: security-test
          format: "sarif"
          output: "trivy-results.sarif"

      - name: 📊 Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: "trivy-results.sarif"
```

#### **DAST (Dynamic Application Security Testing)**

```yaml
name: 🌐 DAST Security Testing

on:
  deployment_status:

jobs:
  dast-scan:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - name: 🔍 OWASP ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: ${{ github.event.deployment_status.target_url }}
          rules_file_name: ".zap/rules.tsv"
          cmd_options: "-a"
```

### 📊 **Code Quality Gates**

#### **SonarQube Integration**

```yaml
name: 📊 Code Quality Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 🛠️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🧪 Run tests with coverage
        run: npm run test:coverage

      - name: 📊 SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        with:
          projectBaseDir: .
          args: >
            -Dsonar.projectKey=myapp
            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
            -Dsonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx
            -Dsonar.qualitygate.wait=true
```

#### **Quality Gate Rules**

```typescript
// quality-gates.config.ts
export const qualityGateRules = {
  coverage: {
    minimum: 80,
    failing: 70,
  },
  duplicatedLines: {
    maximum: 3.0,
  },
  maintainabilityRating: "A",
  reliabilityRating: "A",
  securityRating: "A",
  techDebt: {
    maximum: "30min",
  },
  complexityPerFunction: 15,
  linesPerFunction: 50,
};
```

### ⚡ **Performance Testing**

#### **Lighthouse CI**

```yaml
name: ⚡ Performance Testing

on:
  deployment_status:

jobs:
  lighthouse:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: ⚡ Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            ${{ github.event.deployment_status.target_url }}
          configPath: ".lighthouserc.json"
          uploadArtifacts: true
          temporaryPublicStorage: true
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

#### **Load Testing with Artillery**

```yaml
name: 🎯 Load Testing

on:
  workflow_dispatch:
    inputs:
      target_url:
        description: "Target URL to test"
        required: true
      duration:
        description: "Test duration in seconds"
        required: true
        default: "60"

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 📦 Install Artillery
        run: npm install -g artillery

      - name: 🎯 Run Load Test
        run: |
          cat > artillery-config.yml << EOF
          config:
            target: '${{ github.event.inputs.target_url }}'
            phases:
              - duration: ${{ github.event.inputs.duration }}
                arrivalRate: 10
                rampTo: 50
          scenarios:
            - name: "Load test main flow"
              flow:
                - get:
                    url: "/"
                - think: 2
                - get:
                    url: "/health"
          EOF

          artillery run artillery-config.yml --output report.json
          artillery report report.json --output report.html

      - name: 📊 Upload Load Test Results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-report
          path: report.html
```

### 🧪 **Contract Testing**

#### **Pact.js Implementation**

```typescript
// tests/contract/railway.contract.test.ts
import { Pact } from "@pact-foundation/pact";
import { RailwayAPI } from "../../src/api/railway";

describe("Railway API Contract Tests", () => {
  const provider = new Pact({
    consumer: "railway-frontend",
    provider: "railway-backend",
    port: 1234,
    log: path.resolve(process.cwd(), "logs", "pact.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    logLevel: "INFO",
  });

  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  test("should get train status", async () => {
    await provider.addInteraction({
      state: "train exists",
      uponReceiving: "a request for train status",
      withRequest: {
        method: "GET",
        path: "/api/trains/train-1/status",
      },
      willRespondWith: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          id: "train-1",
          position: { x: 100, y: 200 },
          speed: 1.0,
          status: "running",
        },
      },
    });

    const api = new RailwayAPI("http://localhost:1234");
    const result = await api.getTrainStatus("train-1");

    expect(result).toMatchObject({
      id: "train-1",
      position: { x: 100, y: 200 },
      speed: 1.0,
      status: "running",
    });
  });
});
```

### 🌪️ **Chaos Engineering**

#### **Chaos Monkey Implementation**

```yaml
name: 🌪️ Chaos Engineering

on:
  schedule:
    - cron: "0 10 * * 1-5" # Weekdays at 10 AM
  workflow_dispatch:

jobs:
  chaos-test:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🌪️ Random Service Disruption
        run: |
          CHAOS_ACTIONS=(
            "restart_app"
            "scale_down"
            "network_delay" 
            "cpu_stress"
            "memory_stress"
          )

          ACTION=${CHAOS_ACTIONS[$RANDOM % ${#CHAOS_ACTIONS[@]}]}
          echo "🌪️ Executing chaos action: $ACTION"

          case $ACTION in
            "restart_app")
              az webapp restart \
                --name myapp-staging \
                --resource-group rg-myapp-staging
              ;;
            "scale_down")
              az webapp config set \
                --name myapp-staging \
                --resource-group rg-myapp-staging \
                --generic-configurations '{"numberOfWorkers": 1}'
              sleep 300
              az webapp config set \
                --name myapp-staging \
                --resource-group rg-myapp-staging \
                --generic-configurations '{"numberOfWorkers": 2}'
              ;;
            "network_delay")
              # Simulate network issues (would need custom implementation)
              echo "Simulating network delay..."
              ;;
          esac

      - name: 📊 Monitor Recovery
        run: |
          echo "📊 Monitoring application recovery..."
          for i in {1..10}; do
            response=$(curl -s -o /dev/null -w "%{http_code}" https://myapp-staging.azurewebsites.net/health)
            echo "Health check $i: HTTP $response"
            
            if [ "$response" == "200" ]; then
              echo "✅ Application recovered successfully"
              break
            fi
            
            sleep 30
          done
```

### 📋 **Compliance & Governance**

#### **Policy as Code with Azure Policy**

```json
{
  "mode": "All",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.Web/sites"
        },
        {
          "field": "Microsoft.Web/sites/httpsOnly",
          "equals": "false"
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  },
  "parameters": {},
  "metadata": {
    "displayName": "Web Apps should require HTTPS",
    "description": "Ensure all web apps require HTTPS connections"
  }
}
```

#### **Compliance Checking Workflow**

```yaml
name: 🛡️ Compliance Check

on:
  push:
    branches: [main]
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM

jobs:
  compliance-check:
    runs-on: ubuntu-latest
    steps:
      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🛡️ Check Security Compliance
        run: |
          echo "🔍 Checking security compliance..."

          # Check HTTPS enforcement
          HTTPS_STATUS=$(az webapp config show \
            --name myapp-prod \
            --resource-group rg-myapp-prod \
            --query "httpsOnly" -o tsv)

          if [ "$HTTPS_STATUS" != "true" ]; then
            echo "❌ HTTPS not enforced"
            exit 1
          fi

          # Check TLS version
          TLS_VERSION=$(az webapp config show \
            --name myapp-prod \
            --resource-group rg-myapp-prod \
            --query "minTlsVersion" -o tsv)

          if [ "$TLS_VERSION" != "1.2" ]; then
            echo "❌ TLS version must be 1.2 or higher"
            exit 1
          fi

          echo "✅ Security compliance checks passed"

      - name: 📊 Generate Compliance Report
        run: |
          cat > compliance-report.json << EOF
          {
            "timestamp": "$(date -Iseconds)",
            "checks": {
              "https_enforced": true,
              "tls_version": "1.2",
              "managed_identity": true,
              "key_vault_integration": true
            },
            "status": "compliant"
          }
          EOF

      - name: 📋 Upload Compliance Report
        uses: actions/upload-artifact@v3
        with:
          name: compliance-report
          path: compliance-report.json
```

---

## �📊 Best Practices

### 🏗️ **Infrastructure**

#### **Resource Organization**

```bash
# Consistent naming convention
ENVIRONMENT="prod"
APP_NAME="myapp"
REGION="eastus"

RESOURCE_GROUP="rg-${APP_NAME}-${ENVIRONMENT}"
APP_SERVICE_PLAN="plan-${APP_NAME}-${ENVIRONMENT}"
WEB_APP="${APP_NAME}-${ENVIRONMENT}"
STORAGE_ACCOUNT="${APP_NAME}${ENVIRONMENT}storage"
```

#### **Environment Separation**

```bash
# Development
RESOURCE_GROUP="rg-myapp-dev"
APP_SERVICE_PLAN="plan-myapp-dev"  # B1 Basic
WEB_APP="myapp-dev"

# Staging
RESOURCE_GROUP="rg-myapp-staging"
APP_SERVICE_PLAN="plan-myapp-staging"  # S1 Standard
WEB_APP="myapp-staging"

# Production
RESOURCE_GROUP="rg-myapp-prod"
APP_SERVICE_PLAN="plan-myapp-prod"  # P1V2 Premium
WEB_APP="myapp-prod"
```

### 🔒 **Security**

#### **Access Control**

```bash
# Create service principals with minimal permissions
az ad sp create-for-rbac \
  --name "sp-myapp-github-actions" \
  --role "Website Contributor" \
  --scopes /subscriptions/{sub}/resourceGroups/rg-myapp-prod

# Use managed identities when possible
az webapp identity assign \
  --name myapp-prod \
  --resource-group rg-myapp-prod

# Restrict access to specific IPs
az webapp config access-restriction add \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --rule-name "Office IP" \
  --action Allow \
  --ip-address 203.0.113.0/24 \
  --priority 100
```

#### **Secrets Management**

```bash
# Use Azure Key Vault
az keyvault create \
  --name kv-myapp-prod \
  --resource-group rg-myapp-prod \
  --location eastus

# Store secrets
az keyvault secret set \
  --vault-name kv-myapp-prod \
  --name "database-connection-string" \
  --value "Server=..."

# Reference in App Service
az webapp config appsettings set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --settings DATABASE_URL="@Microsoft.KeyVault(VaultName=kv-myapp-prod;SecretName=database-connection-string)"
```

### 📊 **Monitoring & Observability**

#### **Application Insights**

```bash
# Create Application Insights
az monitor app-insights component create \
  --app myapp-prod-insights \
  --location eastus \
  --resource-group rg-myapp-prod \
  --application-type web

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app myapp-prod-insights \
  --resource-group rg-myapp-prod \
  --query instrumentationKey \
  --output tsv)

# Configure app
az webapp config appsettings set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="$INSTRUMENTATION_KEY"
```

#### **Alerts**

```bash
# CPU alert
az monitor metrics alert create \
  --name "High CPU Usage" \
  --resource-group rg-myapp-prod \
  --scopes /subscriptions/{sub}/resourceGroups/rg-myapp-prod/providers/Microsoft.Web/sites/myapp-prod \
  --condition "avg Percentage CPU > 80" \
  --description "Alert when CPU usage is high"

# HTTP 5xx errors alert
az monitor metrics alert create \
  --name "HTTP 5xx Errors" \
  --resource-group rg-myapp-prod \
  --scopes /subscriptions/{sub}/resourceGroups/rg-myapp-prod/providers/Microsoft.Web/sites/myapp-prod \
  --condition "total Http5xx > 10" \
  --description "Alert on server errors"
```

### 🚀 **Performance**

#### **Optimization Settings**

```bash
# Enable compression
az webapp config set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --generic-configurations '{"gzipCompression": "true"}'

# Configure caching
az webapp config appsettings set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --settings \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
    DOCKER_ENABLE_CI=true

# Always On (for production)
az webapp config set \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --always-on true
```

#### **CDN Integration**

```bash
# Create CDN profile
az cdn profile create \
  --name myapp-cdn \
  --resource-group rg-myapp-prod \
  --sku Standard_Microsoft

# Create CDN endpoint
az cdn endpoint create \
  --name myapp-prod-cdn \
  --profile-name myapp-cdn \
  --resource-group rg-myapp-prod \
  --origin myapp-prod.azurewebsites.net
```

### 📋 **Deployment Checklist**

#### **Pre-Deployment**

```markdown
- [ ] Code reviewed and approved
- [ ] Tests passing (unit, integration, e2e)
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Database migrations prepared
- [ ] Feature flags configured
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
```

#### **Deployment**

```markdown
- [ ] Backup current version
- [ ] Deploy to staging first
- [ ] Smoke tests on staging
- [ ] Deploy to production
- [ ] Health checks passing
- [ ] Performance monitoring
- [ ] User acceptance testing
- [ ] Documentation updated
```

#### **Post-Deployment**

```markdown
- [ ] Application responding correctly
- [ ] All features working as expected
- [ ] Performance within acceptable range
- [ ] No error rate increase
- [ ] Monitoring dashboard green
- [ ] User feedback positive
- [ ] Rollback plan validated
- [ ] Team notified of success
```

---

## 🔄 GitOps Implementation

### 🎯 **GitOps Principles**

- ✅ **Declarative Configuration**: Everything in Git
- ✅ **Version Controlled**: All changes tracked
- ✅ **Automated Sync**: Git as single source of truth
- ✅ **Continuous Reconciliation**: Drift detection and correction

### 🛠️ **ArgoCD Implementation**

#### **Setup ArgoCD (if using Kubernetes)**

```yaml
# argocd/application.yml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: railway-control
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/username/railway-control
    targetRevision: HEAD
    path: k8s/manifests
  destination:
    server: https://kubernetes.default.svc
    namespace: railway-control
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### 🔍 **Configuration Drift Detection**

#### **Azure Resource Graph Queries**

```bash
# Script to detect configuration drift
#!/bin/bash
# check-drift.sh

echo "🔍 Checking for configuration drift..."

# Check if web apps match desired configuration
DRIFT_DETECTED=false

# Check HTTPS enforcement
HTTPS_CHECK=$(az graph query -q "
  Resources
  | where type == 'microsoft.web/sites'
  | where name contains 'myapp'
  | project name, httpsOnly=properties.httpsOnly
  | where httpsOnly != true
" --query "data" -o tsv)

if [ ! -z "$HTTPS_CHECK" ]; then
  echo "❌ Drift detected: HTTPS not enforced on:"
  echo "$HTTPS_CHECK"
  DRIFT_DETECTED=true
fi

# Check TLS version
TLS_CHECK=$(az graph query -q "
  Resources
  | where type == 'microsoft.web/sites'
  | where name contains 'myapp'
  | project name, minTlsVersion=properties.minTlsVersion
  | where minTlsVersion != '1.2'
" --query "data" -o tsv)

if [ ! -z "$TLS_CHECK" ]; then
  echo "❌ Drift detected: Incorrect TLS version on:"
  echo "$TLS_CHECK"
  DRIFT_DETECTED=true
fi

if [ "$DRIFT_DETECTED" = true ]; then
  echo "🚨 Configuration drift detected! Triggering remediation..."
  exit 1
else
  echo "✅ No configuration drift detected"
fi
```

#### **Automated Drift Correction**

```yaml
name: 🔄 GitOps Drift Detection

on:
  schedule:
    - cron: "0 */6 * * *" # Every 6 hours
  workflow_dispatch:

jobs:
  drift-detection:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🔍 Detect Configuration Drift
        id: drift
        run: |
          chmod +x .github/scripts/check-drift.sh
          if ./.github/scripts/check-drift.sh; then
            echo "drift=false" >> $GITHUB_OUTPUT
          else
            echo "drift=true" >> $GITHUB_OUTPUT
          fi

      - name: 🔧 Auto-Remediate Drift
        if: steps.drift.outputs.drift == 'true'
        run: |
          echo "🔧 Applying infrastructure corrections..."

          # Re-apply Terraform configuration
          cd terraform
          terraform init
          terraform plan -out=remediation.tfplan
          terraform apply remediation.tfplan

          echo "✅ Drift remediation completed"

      - name: 📢 Notify Team
        if: steps.drift.outputs.drift == 'true'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Configuration Drift Detected and Remediated',
              body: `
              ## Configuration Drift Alert
              
              **Timestamp:** ${new Date().toISOString()}
              **Status:** Automatically remediated
              
              Configuration drift was detected and automatically corrected using GitOps principles.
              
              Please review the changes and ensure they align with intended configurations.
              `,
              labels: ['infrastructure', 'drift', 'auto-remediated']
            })
```

---

## 🏥 Disaster Recovery

### 🎯 **DR Strategy Overview**

- **RTO (Recovery Time Objective)**: < 4 hours
- **RPO (Recovery Point Objective)**: < 1 hour
- **Multi-Region**: Primary + DR regions
- **Automated Failover**: Health-based switching
- **Data Backup**: Automated and tested

### 🌍 **Multi-Region Setup**

#### **Terraform Multi-Region Configuration**

```hcl
# terraform/multi-region/main.tf
variable "regions" {
  description = "Primary and DR regions"
  type = object({
    primary = string
    dr      = string
  })
  default = {
    primary = "East US"
    dr      = "West US 2"
  }
}

# Primary region resources
module "primary_region" {
  source = "../modules/app-service"

  region              = var.regions.primary
  environment         = "prod"
  app_name           = "myapp"
  is_primary_region  = true

  providers = {
    azurerm = azurerm.primary
  }
}

# DR region resources
module "dr_region" {
  source = "../modules/app-service"

  region              = var.regions.dr
  environment         = "prod-dr"
  app_name           = "myapp"
  is_primary_region  = false

  providers = {
    azurerm = azurerm.dr
  }
}

# Traffic Manager for failover
resource "azurerm_traffic_manager_profile" "dr" {
  name                = "myapp-dr-tm"
  resource_group_name = module.primary_region.resource_group_name

  traffic_routing_method = "Priority"

  dns_config {
    relative_name = "myapp-dr"
    ttl          = 30
  }

  monitor_config {
    protocol                     = "HTTPS"
    port                        = 443
    path                        = "/health"
    interval_in_seconds         = 30
    timeout_in_seconds          = 10
    tolerated_number_of_failures = 3
  }
}

# Primary endpoint (priority 1)
resource "azurerm_traffic_manager_azure_endpoint" "primary" {
  name               = "primary"
  profile_id         = azurerm_traffic_manager_profile.dr.id
  priority           = 1
  target_resource_id = module.primary_region.web_app_id
}

# DR endpoint (priority 2)
resource "azurerm_traffic_manager_azure_endpoint" "dr" {
  name               = "dr"
  profile_id         = azurerm_traffic_manager_profile.dr.id
  priority           = 2
  target_resource_id = module.dr_region.web_app_id
}
```

### 💾 **Backup Strategies**

#### **Application Data Backup**

```bash
#!/bin/bash
# backup-script.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
STORAGE_ACCOUNT="myappbackupstorage"
CONTAINER_NAME="backups"

echo "🗄️ Starting backup process..."

# Backup application settings
az webapp config appsettings list \
  --name myapp-prod \
  --resource-group rg-myapp-prod \
  --output json > "app-settings-${BACKUP_DATE}.json"

# Backup SSL certificates
az webapp config ssl list \
  --resource-group rg-myapp-prod \
  --output json > "ssl-certs-${BACKUP_DATE}.json"

# Backup custom domain configurations
az webapp config hostname list \
  --webapp-name myapp-prod \
  --resource-group rg-myapp-prod \
  --output json > "domains-${BACKUP_DATE}.json"

# Upload to Azure Storage
az storage blob upload \
  --file "app-settings-${BACKUP_DATE}.json" \
  --container-name $CONTAINER_NAME \
  --name "app-settings/${BACKUP_DATE}/app-settings.json" \
  --account-name $STORAGE_ACCOUNT

echo "✅ Backup completed: ${BACKUP_DATE}"
```

#### **Automated Backup Workflow**

```yaml
name: 💾 Automated Backup

on:
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 💾 Create Application Backup
        run: |
          BACKUP_DATE=$(date +%Y%m%d_%H%M%S)

          # Create backup directory
          mkdir -p backups/${BACKUP_DATE}

          # Backup configurations
          az webapp config appsettings list \
            --name myapp-prod \
            --resource-group rg-myapp-prod \
            --output json > backups/${BACKUP_DATE}/app-settings.json

          # Backup deployment slots
          az webapp deployment slot list \
            --name myapp-prod \
            --resource-group rg-myapp-prod \
            --output json > backups/${BACKUP_DATE}/slots.json

          # Backup current container image
          CURRENT_IMAGE=$(az webapp config container show \
            --name myapp-prod \
            --resource-group rg-myapp-prod \
            --query "linux_fx_version" \
            --output tsv)

          echo "$CURRENT_IMAGE" > backups/${BACKUP_DATE}/current-image.txt

      - name: 📤 Upload to Storage
        run: |
          # Upload backup to Azure Storage
          az storage blob upload-batch \
            --destination backup-container \
            --source backups \
            --account-name myappbackupstorage

      - name: 🧹 Cleanup Old Backups
        run: |
          # Keep only last 30 days of backups
          CUTOFF_DATE=$(date -d '30 days ago' +%Y%m%d)

          az storage blob list \
            --container-name backup-container \
            --account-name myappbackupstorage \
            --output table | \
          awk -v cutoff="$CUTOFF_DATE" '$1 < cutoff {print $1}' | \
          xargs -I {} az storage blob delete \
            --container-name backup-container \
            --name {} \
            --account-name myappbackupstorage
```

### 🚨 **Disaster Recovery Testing**

#### **DR Drill Automation**

```yaml
name: 🚨 DR Drill

on:
  schedule:
    - cron: "0 10 1 * *" # Monthly on 1st day at 10 AM
  workflow_dispatch:
    inputs:
      drill_type:
        description: "Type of DR drill"
        required: true
        type: choice
        options:
          - primary_region_failure
          - database_failure
          - complete_disaster

jobs:
  dr-drill:
    runs-on: ubuntu-latest
    environment: dr-testing
    steps:
      - uses: actions/checkout@v4

      - name: 🔐 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🚨 Simulate Disaster
        run: |
          echo "🚨 Starting DR drill: ${{ github.event.inputs.drill_type || 'primary_region_failure' }}"

          case "${{ github.event.inputs.drill_type || 'primary_region_failure' }}" in
            "primary_region_failure")
              # Simulate primary region failure by stopping the app
              az webapp stop \
                --name myapp-prod \
                --resource-group rg-myapp-prod
              ;;
            "database_failure")
              # Simulate database issues (would implement based on your DB setup)
              echo "Simulating database failure..."
              ;;
            "complete_disaster")
              # Simulate complete primary region disaster
              az webapp stop \
                --name myapp-prod \
                --resource-group rg-myapp-prod
              ;;
          esac

      - name: ⏱️ Measure Recovery Time
        run: |
          START_TIME=$(date +%s)
          echo "start_time=$START_TIME" >> $GITHUB_ENV

          echo "⏱️ DR drill started at $(date)"

          # Wait for Traffic Manager to detect failure and switch
          echo "⏳ Waiting for automatic failover..."
          sleep 180  # 3 minutes for Traffic Manager to detect and switch

      - name: 🔍 Verify DR Environment
        run: |
          DR_URL="https://myapp-dr-tm.trafficmanager.net"

          for i in {1..10}; do
            echo "🔍 DR verification attempt $i/10..."
            
            response=$(curl -s -o /dev/null -w "%{http_code}" $DR_URL/health)
            if [ "$response" == "200" ]; then
              RECOVERY_TIME=$(($(date +%s) - $start_time))
              echo "✅ DR environment responding! Recovery time: ${RECOVERY_TIME}s"
              echo "recovery_time=$RECOVERY_TIME" >> $GITHUB_ENV
              break
            fi
            
            sleep 30
          done

      - name: 📊 Generate DR Report
        run: |
          cat > dr-drill-report.json << EOF
          {
            "drill_date": "$(date -Iseconds)",
            "drill_type": "${{ github.event.inputs.drill_type || 'primary_region_failure' }}",
            "recovery_time_seconds": ${{ env.recovery_time || 'null' }},
            "rto_target_seconds": 14400,
            "rto_met": $([ "${{ env.recovery_time || '99999' }}" -lt "14400" ] && echo "true" || echo "false"),
            "status": "completed"
          }
          EOF

          echo "📊 DR Drill Report:"
          cat dr-drill-report.json

      - name: 🔄 Restore Primary Environment
        run: |
          echo "🔄 Restoring primary environment..."

          # Restart primary application
          az webapp start \
            --name myapp-prod \
            --resource-group rg-myapp-prod

          # Wait for primary to be healthy again
          sleep 120

          echo "✅ Primary environment restored"

      - name: 📧 Send DR Report
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('dr-drill-report.json', 'utf8'));

            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `🚨 DR Drill Report - ${report.drill_date}`,
              body: `
              ## Disaster Recovery Drill Report
              
              **Date:** ${report.drill_date}
              **Type:** ${report.drill_type}
              **Recovery Time:** ${report.recovery_time_seconds}s (${Math.round(report.recovery_time_seconds/60)}m)
              **RTO Target:** ${report.rto_target_seconds}s (${Math.round(report.rto_target_seconds/60)}m)
              **RTO Met:** ${report.rto_met ? '✅ Yes' : '❌ No'}
              
              ${report.rto_met ? 
                '✅ DR drill successful - RTO target met!' : 
                '⚠️ DR drill completed but RTO target exceeded. Review and optimize recovery procedures.'}
              `,
              labels: ['disaster-recovery', 'drill', report.rto_met ? 'success' : 'needs-attention']
            })
```

---

## 🎯 Quick Reference

### 🔧 **Essential Commands**

```bash
# Login and setup
az login
az account set --subscription "your-subscription"

# Create resources
az group create --name rg-myapp-prod --location eastus
az appservice plan create --name plan-myapp-prod --resource-group rg-myapp-prod --sku P1V2 --is-linux
az webapp create --name myapp-prod --plan plan-myapp-prod --resource-group rg-myapp-prod --deployment-container-image-name nginx:alpine

# Deploy container
az webapp config container set --name myapp-prod --resource-group rg-myapp-prod --container-image-name username/myapp:latest

# Monitor and troubleshoot
az webapp log tail --name myapp-prod --resource-group rg-myapp-prod
az webapp restart --name myapp-prod --resource-group rg-myapp-prod

# Rollback
az webapp config container set --name myapp-prod --resource-group rg-myapp-prod --container-image-name username/myapp:v1.0.0
```

### 🐳 **Docker Commands**

```bash
# Build and push
docker build -t username/myapp:v1.0.0 .
docker push username/myapp:v1.0.0

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 --tag username/myapp:v1.0.0 --push .

# Cleanup
docker system prune -a
docker image prune -a
```

### 🏷️ **Git Commands**

```bash
# Create and push tags
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# List and delete tags
git tag -l
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

---

## 📚 Additional Resources

### 📖 **Documentation Links**

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure DevOps Documentation](https://docs.microsoft.com/en-us/azure/devops/)

### 🛠️ **Tools**

- [Azure Portal](https://portal.azure.com)
- [Azure Cloud Shell](https://shell.azure.com)
- [Docker Hub](https://hub.docker.com)
- [GitHub Actions](https://github.com/features/actions)
- [Azure DevOps](https://dev.azure.com)

### 🎓 **Learning Resources**

- [Azure Learn - App Service](https://docs.microsoft.com/en-us/learn/paths/deploy-a-website-with-azure-app-service/)
- [Docker Getting Started](https://docs.docker.com/get-started/)
- [GitHub Actions Learning Lab](https://lab.github.com/githubtraining/github-actions:-hello-world)

---

<div align="center">

## 🎉 ¡Happy Deploying! 🚀

Esta guía cubre todos los métodos y escenarios para deployment en Azure Web Apps.  
Para preguntas específicas o casos de uso particulares, consulta la documentación oficial de Azure.

**Creado con ❤️ para la comunidad de desarrolladores**

</div>
