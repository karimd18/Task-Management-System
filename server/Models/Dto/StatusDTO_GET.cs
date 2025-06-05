namespace FinalProjectAPIs.Models.Dto
{
    public class StatusDTO_GET
    {
        public StatusDTO_GET(string id, string name, DateTime createdAt, string? teamId)
        {
            Id = id;
            Name = name;
            CreatedAt = createdAt;
            TeamId = teamId;
        }

        public string Id { get; }
        public string Name { get; }
        public DateTime CreatedAt { get; }
        public string? TeamId { get; }
    }
}