using System.Security.Claims;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using FinalProjectAPIs.Extensions;
using FinalProjectAPIs.Helpers;
using FinalProjectAPIs.Models;
using FinalProjectAPIs.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinalProjectAPIs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InvitationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<InvitationsController> _logger;

        public InvitationsController(
            AppDbContext context,
            IMapper mapper,
            ILogger<InvitationsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet("mine")]
        public async Task<ActionResult<IEnumerable<InvitationResponseDTO>>> GetMine(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            try
            {
                var query = _context.Invitations
                    .Where(i => i.InviteeId == userId && i.Status == InvitationStatus.Pending)
                    .OrderByDescending(i => i.CreatedAt)
                    .ProjectTo<InvitationResponseDTO>(_mapper.ConfigurationProvider);

                var totalCount = await query.CountAsync();
                var invites = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(invites);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invitations");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpPost("{id}/accept")]
        public async Task<IActionResult> Accept(string id)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            try
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

                var invite = await _context.Invitations
                    .Include(i => i.Team)
                    .FirstOrDefaultAsync(i => i.Id == id && i.InviteeId == userId);

                if (invite == null)
                    return NotFound(ErrorResponse.NotFound("Invitation"));

                if (invite.Status != InvitationStatus.Pending)
                    return BadRequest(ErrorResponse.BadRequest("Invitation is not pending"));

                // Check if already a member
                var isMember = await _context.Members
                    .AnyAsync(m => m.TeamId == invite.TeamId && m.UserId == userId);

                if (isMember)
                    return Conflict(ErrorResponse.Conflict("Already a team member"));

                // Add member
                _context.Members.Add(new Member
                {
                    Id = Guid.NewGuid().ToString(),
                    TeamId = invite.TeamId,
                    UserId = userId,
                    Role = Role.Member
                });

                // Update invitation
                invite.Status = InvitationStatus.Accepted;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error accepting invitation {id}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error accepting invitation {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpPost("{id}/decline")]
        public async Task<IActionResult> Decline(string id)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            try
            {
                var invite = await _context.Invitations
                    .FirstOrDefaultAsync(i => i.Id == id && i.InviteeId == userId);

                if (invite == null)
                    return NotFound(ErrorResponse.NotFound("Invitation"));

                if (invite.Status != InvitationStatus.Pending)
                    return BadRequest(ErrorResponse.BadRequest("Invitation is not pending"));

                invite.Status = InvitationStatus.Declined;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error declining invitation {id}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error declining invitation {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }
    }
}