using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinalProjectAPIs.Models
{
    [PrimaryKey(nameof(Id))]
    public class Invitation
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string TeamId { get; set; }
        public Team Team { get; set; } = default!;

        public required string InviterId { get; set; }
        [ForeignKey(nameof(InviterId))]
        public User? Inviter { get; set; }

        public required string InviteeId { get; set; }
        [ForeignKey(nameof(InviteeId))]
        public User? Invitee { get; set; }

        public InvitationStatus Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
