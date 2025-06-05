using Microsoft.EntityFrameworkCore;

namespace FinalProjectAPIs.Models
{
    [PrimaryKey(nameof(Id))]
    public class Status
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public required DateTime CreatedAt { get; set; }

        public required string CreatedBy { get; set; }
        public string? TeamId { get; set; }

        public Team? Team { get; set; }
        public ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();
    }
}