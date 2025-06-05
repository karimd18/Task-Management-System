using FinalProjectAPIs.Models.Dto;

namespace FinalProjectAPIs.Helper
{
    public class AuthResponse { 
        public string? Token { get; set; } 
        public UserPublicDTO_GET? User { get; set; } }

}
