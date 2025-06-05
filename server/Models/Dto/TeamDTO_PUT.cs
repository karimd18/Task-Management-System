using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class TeamDTO_PUT
    {
        public string Name { get; set; } = default!;

        public string? Description { get; set; }
    }
}