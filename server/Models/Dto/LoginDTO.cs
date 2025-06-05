using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class LoginDTO
    {
        [Required(ErrorMessage = "Username or email is required")]
        [StringLength(255, MinimumLength = 3, ErrorMessage = "Identifier must be between 3-255 characters")]
        public string Identifier { get; set; } = default!;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be 8-100 characters")]
        public string Password { get; set; } = default!;
    }
}