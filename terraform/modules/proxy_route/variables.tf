variable "rest_api_id" {
  type        = string
  description = "the id of the rest api to which the newly created resource will belong"
}

variable "parent_id" {
  type        = string
  description = "id of the parent resource to the one that this module will create"
}

variable "path_part" {
  type        = string
  description = "the path part"
}

variable "destination_url" {
  type        = string
  description = "HAS TO HAVE TRAILING SLASH. make sure to NOT include the {proxy} part in your url - this is the part that API gateway will yoink from the initiating request and plop into where the {proxy} substring is in your provided url"
}

variable "map_host" {
  type        = bool
  description = "Whether to pass thru the Host header"
  default     = false
}
