using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class PasswordResetDTO
    {
        [Required]
        public required string Token { get; set; }

        [Required, MinLength(6)]
        public required string NewPassword { get; set; }

        [Required, Compare(nameof(NewPassword))]
        public required string ConfirmPassword { get; set; }
    }
}
