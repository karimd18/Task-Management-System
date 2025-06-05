using Microsoft.EntityFrameworkCore;

namespace FinalProjectAPIs.Models
{
    [PrimaryKey(nameof(Id))]
    public class Team
    {
        public required string Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }

        public string? CreatedBy { get; set; }
        public User? CreatedByUser { get; set; }
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();
        public ICollection<Status> Statuses { get; set; } = new List<Status>();

        public ICollection<Member> Members { get; set; } = new List<Member>();

        public ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();
    }
}