using Microsoft.EntityFrameworkCore;

namespace FinalProjectAPIs.Models
{
    [PrimaryKey(nameof(Id))]
    public class Member
    {
        public Member() { }

        public Member(string id, string teamId, string userId, Role role)
        {
            Id = id;
            TeamId = teamId;
            UserId = userId;
            Role = role;
        }

        public string Id { get; set; }              
        public string TeamId { get; set; }
        public string UserId { get; set; }       
        public Role Role { get; set; }           
        public Team? Team { get; set; }

        public User? User { get; set; }
    }
}
