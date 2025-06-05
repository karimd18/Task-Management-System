namespace FinalProjectAPIs.Models.Dto
{
    public class MemberDTO_GET
    {
        public MemberDTO_GET() { }
        public MemberDTO_GET(string teamId, string userId, Role role, UserDTO_GET userDetails)
        {
            TeamId = teamId;
            UserId = userId;
            Role = role;
            UserDetails = userDetails;
        }

        public string TeamId { get; }
        public string UserId { get; }
        public Role Role { get; }      
        public UserDTO_GET UserDetails { get; } 
    }
}