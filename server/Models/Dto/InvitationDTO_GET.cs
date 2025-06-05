namespace FinalProjectAPIs.Models.Dto
{
    public class InvitationDTO_GET
    {
        public InvitationDTO_GET(string id, string teamId, string inviterId, string inviteeId, string inviterUsername, InvitationStatus status, DateTime createdAt)
        {
            Id = id;
            TeamId = teamId;
            InviterId = inviterId;
            InviteeId = inviteeId;
            InviterUsername = inviterUsername;
            Status = status;
            CreatedAt = createdAt;
        }

        public string Id { get; set; } = default!;
        public string TeamId { get; set; } = default!;
        public string InviterId { get; set; } = default!;
        public string InviterUsername { get; set; } = default!;
        public string InviteeId { get; set; } = default!;
        public InvitationStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
