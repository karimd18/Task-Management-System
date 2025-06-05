using Microsoft.EntityFrameworkCore;

namespace FinalProjectAPIs.Models
{
    [PrimaryKey(nameof(Id))]
    public class TaskEntity
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsPersonal { get; set; }
        public string? TeamId { get; set; }
        public string? StatusId { get; set; } = default!;
        public string CreatedBy { get; set; } = default!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? AssignedToUserId { get; set; }
        public User? AssignedToUser { get; set; }

        public Status? Status { get; set; } = default!;
        public Team? Team { get; set; }
    }

}
