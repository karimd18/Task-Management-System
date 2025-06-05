namespace FinalProjectAPIs.Models.Dto
{
    public class UserDTO_GET
    {
        public UserDTO_GET(string id, string username, string email)
        {
            Id = id ?? throw new ArgumentNullException(nameof(id));
            Username = username ?? throw new ArgumentNullException(nameof(username));
            Email = email ?? throw new ArgumentNullException(nameof(email));
        }

        public string Id { get; }
        public string Username { get; }
        public string Email { get; }
    }
}