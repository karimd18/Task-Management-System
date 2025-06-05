using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class UserDTO_PUT
    {
        [StringLength(50, MinimumLength = 3,
            ErrorMessage = "Username must be 3-50 characters")]
        [RegularExpression(@"^[a-zA-Z0-9_\-]+$",
            ErrorMessage = "Username can only contain letters, numbers, hyphens, and underscores")]
        public string? Username { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(254, ErrorMessage = "Email cannot exceed 254 characters")]
        public string? Email { get; set; }
    }
}