using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class StatusDTO_POST
    {
        [Required(ErrorMessage = "Status name is required")]
        [StringLength(100, MinimumLength = 2,
            ErrorMessage = "Status name must be 2-100 characters")]
        public string Name { get; set; } = default!;

        [StringLength(36, ErrorMessage = "Invalid Team ID format")]
        public string? TeamId { get; set; }
    }
}