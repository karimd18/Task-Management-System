using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class MemberDTO_POST
    {
        [Required(ErrorMessage = "Team ID is required")]
        public string TeamId { get; set; } = default!;

        [EmailAddress(ErrorMessage = "Valid email is required when using email lookup")]
        [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string? UserEmail { get; set; }

        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be 3-50 characters")]
        public string? Username { get; set; }

        [Required(ErrorMessage = "Role is required")]
        public Role Role { get; set; } = Role.Member;

        public IEnumerable<ValidationResult> Validate(ValidationContext context)
        {
            if (string.IsNullOrWhiteSpace(UserEmail) && string.IsNullOrWhiteSpace(Username))
            {
                yield return new ValidationResult(
                    "Either Email or Username must be provided",
                    [nameof(UserEmail), nameof(Username)]
                );
            }
        }
    }
}