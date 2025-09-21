output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.railway_control.name
}

output "app_service_name" {
  description = "Name of the App Service"
  value       = azurerm_linux_web_app.railway_control.name
}

output "app_service_default_hostname" {
  description = "Default hostname of the App Service"
  value       = azurerm_linux_web_app.railway_control.default_hostname
}

output "app_service_url" {
  description = "URL of the App Service"
  value       = "https://${azurerm_linux_web_app.railway_control.default_hostname}"
}

output "staging_slot_url" {
  description = "URL of the staging slot (if enabled)"
  value       = var.enable_staging_slot ? "https://${azurerm_linux_web_app.railway_control.default_hostname}-staging.azurewebsites.net" : "Staging slot not enabled"
}

output "application_insights_instrumentation_key" {
  description = "Application Insights Instrumentation Key"
  value       = azurerm_application_insights.railway_control.instrumentation_key
  sensitive   = true
}

output "application_insights_app_id" {
  description = "Application Insights Application ID"
  value       = azurerm_application_insights.railway_control.app_id
}

output "publish_profile_command" {
  description = "Command to get the publish profile"
  value       = "az webapp deployment list-publishing-profiles --name ${azurerm_linux_web_app.railway_control.name} --resource-group ${azurerm_resource_group.railway_control.name} --xml"
}