using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class TaskEntityDTO_PUT
    {
        public string? Title { get; set; } = default!;

        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }

        public string? StatusId { get; set; } = default!;

        public string? AssignedToUserId { get; set; }
    }
}