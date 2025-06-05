using System.ComponentModel.DataAnnotations;

namespace FinalProjectAPIs.Models.Dto
{
    public class TeamInviteDTO_POST
    {
        [Required(ErrorMessage = "Invitee username or email is required")]
        public string Identifier { get; set; } = default!;

        [Required(ErrorMessage = "Team ID is required")]
        public string TeamId { get; set; } = default!;
    }
}