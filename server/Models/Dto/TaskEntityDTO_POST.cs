using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class TaskEntityDTO_POST
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, MinimumLength = 2,
            ErrorMessage = "Title must be 2-200 characters")]
        public string Title { get; set; } = default!;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Please specify if this is a personal task")]
        public bool IsPersonal { get; set; } = true;

        [StringLength(36, ErrorMessage = "Invalid Team ID format")]
        [RegularExpression(@"^[a-fA-F0-9]{8}-([a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}$",
            ErrorMessage = "Invalid GUID format")]
        public string? TeamId { get; set; }

        [StringLength(36, ErrorMessage = "Invalid User ID format")]
        [RegularExpression(@"^[a-fA-F0-9]{8}-([a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}$")]
        public string? AssignedToUserId { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [StringLength(36, ErrorMessage = "Invalid Status ID format")]
        public string StatusId { get; set; } = default!;

        [FutureDate(ErrorMessage = "Due date must be in the future")]
        public DateTime? DueDate { get; set; }
    }

    public class FutureDateAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
            => value is not DateTime date || date > DateTime.UtcNow;
    }
}