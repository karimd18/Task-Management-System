using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class PasswordChangeDTO
    {
        [Required(ErrorMessage = "Current password is required")]
        public string CurrentPassword { get; set; } = default!;

        [Required(ErrorMessage = "New password is required")]
        [StringLength(100, MinimumLength = 8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$")]
        public string NewPassword { get; set; } = default!;

        [Compare("NewPassword", ErrorMessage = "Passwords must match")]
        public string ConfirmNewPassword { get; set; } = default!;
    }
}