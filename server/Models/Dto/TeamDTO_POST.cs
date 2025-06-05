using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class TeamDTO_POST
    {
        [Required(ErrorMessage = "Team name is required")]
        [StringLength(100, MinimumLength = 2,
            ErrorMessage = "Name must be 2-100 characters")]
        public string Name { get; set; } = default!;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }


    }
}