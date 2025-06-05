namespace FinalProjectAPIs.Models.Dto
{
    public class UserPublicDTO_GET
    {
        public UserPublicDTO_GET(string id, string username)
        {
            Id = id;
            Username = username;
        }

        public string Id { get; }
        public string Username { get; }
    }
}
