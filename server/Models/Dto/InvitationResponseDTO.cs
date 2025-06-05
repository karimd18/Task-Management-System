namespace FinalProjectAPIs.Models.Dto
{
    public class InvitationResponseDTO
    {
        public string Id { get; set; } = default!;
        public string TeamId { get; set; } = default!;
        public string TeamName { get; set; } = default!;
        public string InviterUsername { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public InvitationStatus Status { get; set; }
    }
}