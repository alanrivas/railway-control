variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "railway-control-rg"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "app_name" {
  description = "Name of the web app"
  type        = string
  default     = "railway-control-app"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_service_sku" {
  description = "SKU for the App Service Plan"
  type        = string
  default     = "B1"
  
  validation {
    condition = contains([
      "F1", "D1", "B1", "B2", "B3",
      "S1", "S2", "S3",
      "P1", "P2", "P3", "P4"
    ], var.app_service_sku)
    error_message = "The app_service_sku must be a valid Azure App Service SKU."
  }
}

variable "docker_registry" {
  description = "Docker registry (e.g., docker.io, index.docker.io)"
  type        = string
  default     = "index.docker.io"
}

variable "docker_image" {
  description = "Docker image name (e.g., username/railway-control)"
  type        = string
  default     = "tu-usuario/railway-control"
}

variable "enable_staging_slot" {
  description = "Whether to create a staging deployment slot"
  type        = bool
  default     = false
}

variable "custom_domain" {
  description = "Custom domain name (optional)"
  type        = string
  default     = ""
}