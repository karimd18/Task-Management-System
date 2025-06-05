namespace FinalProjectAPIs.Models.Dto
{
    public class TeamDTO_GET
    {
        public string Id { get; }
        public string Name { get; }
        public string? Description { get; }
        public DateTime CreatedAt { get; }
        public string CreatedBy { get; }
        public UserPublicDTO_GET? CreatedByUser { get; }
        public IReadOnlyCollection<MemberDTO_GET> Members { get; }
        public IReadOnlyCollection<InvitationDTO_GET> Invitations { get; }
        public IReadOnlyCollection<StatusDTO_GET> Statuses { get; } // Added

        public TeamDTO_GET(
            string id,
            string name,
            DateTime createdAt,
            string createdBy,
            string? description = null,
            UserPublicDTO_GET? createdByUser = null,
            IReadOnlyCollection<MemberDTO_GET>? members = null,
            IReadOnlyCollection<InvitationDTO_GET>? invitations = null,
            IReadOnlyCollection<StatusDTO_GET>? statuses = null)
        {
            Id = id;
            Name = name;
            CreatedAt = createdAt;
            CreatedBy = createdBy;
            Description = description;
            CreatedByUser = createdByUser;
            Members = members ?? Array.Empty<MemberDTO_GET>();
            Invitations = invitations ?? Array.Empty<InvitationDTO_GET>();
            Statuses = statuses ?? Array.Empty<StatusDTO_GET>();
        }
    }
}