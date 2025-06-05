using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class InvitationDTO_POST
    {
        [Required] public string TeamId { get; set; } = default!;
        [Required] public string InviteeUsername { get; set; } = default!;
    }
}
