using Microsoft.EntityFrameworkCore;

namespace FinalProjectAPIs.Models
{
    [PrimaryKey(nameof(Id))]
    public class User
    {
        public required string Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }

        public ICollection<Team> OwnedTeams { get; set; } = new List<Team>();

        public ICollection<Member> Memberships { get; set; } = new List<Member>();

        public ICollection<Invitation> SentInvitations { get; set; } = new List<Invitation>();
        public ICollection<Invitation> ReceivedInvitations { get; set; } = new List<Invitation>();

        public ICollection<TaskEntity> CreatedTasks { get; set; } = new List<TaskEntity>();
        public ICollection<TaskEntity> AssignedTasks { get; set; } = new List<TaskEntity>();
        public string? ResetPasswordToken { get; set; }
        public DateTime? ResetPasswordExpires { get; set; }
    }
}
