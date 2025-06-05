using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class PasswordResetRequestDTO
    {
        [Required, EmailAddress]
        public required string Email { get; set; }
    }
}
