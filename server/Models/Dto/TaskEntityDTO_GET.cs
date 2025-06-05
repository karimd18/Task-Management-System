namespace FinalProjectAPIs.Models.Dto
{
    public class TaskEntityDTO_GET
    {
        public TaskEntityDTO_GET(
            string id,
            string title,
            string createdBy,
            DateTime createdAt,
            StatusDTO_GET status,
            bool isPersonal,
            string? description = null,
            DateTime? dueDate = null,
            string? teamId = null,
            string? assignedToUserId = null,
            UserDTO_GET? assignedToUser = null)
        {
            Id = id;
            Title = title;
            CreatedBy = createdBy;
            CreatedAt = createdAt;
            Status = status;
            IsPersonal = isPersonal;
            Description = description;
            DueDate = dueDate;
            TeamId = teamId;
            AssignedToUserId = assignedToUserId;
            AssignedToUser = assignedToUser;
        }

        public string Id { get; }
        public string Title { get; }
        public string? Description { get; }
        public bool IsPersonal { get; }
        public string? TeamId { get; }
        public string CreatedBy { get; }
        public DateTime CreatedAt { get; }
        public DateTime? DueDate { get; }
        public string? AssignedToUserId { get; }
        public UserDTO_GET? AssignedToUser { get; }
        public StatusDTO_GET Status { get; }
    }
}