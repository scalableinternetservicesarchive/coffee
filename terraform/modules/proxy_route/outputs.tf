output "resource_id" {
  value       = aws_api_gateway_resource.root_node.id
  description = "the resource id of the newly created proxy resource node"
}
