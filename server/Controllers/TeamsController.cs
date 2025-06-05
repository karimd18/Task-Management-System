using System.Security.Claims;
using AutoMapper;
using FinalProjectAPIs.Extensions;
using FinalProjectAPIs.Helpers;
using FinalProjectAPIs.Models;
using FinalProjectAPIs.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinalProjectAPIs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    [Authorize]
    public class TeamsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<TeamsController> _logger;

        public TeamsController(
            AppDbContext context,
            IMapper mapper,
            ILogger<TeamsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/teams
        [HttpGet(Name = "ListTeams")]
        public async Task<ActionResult<IEnumerable<TeamDTO_GET>>> GetAllAsync(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            try
            {
                var query = _context.Teams
                    .Where(t => t.CreatedBy == userId || t.Members.Any(m => m.UserId == userId))
                    .AsNoTracking();

                var totalCount = await query.CountAsync();
                var teams = await query
                    .Include(t => t.Members)
                        .ThenInclude(m => m.User)
                    .OrderBy(t => t.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(_mapper.Map<List<TeamDTO_GET>>(teams));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving teams");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        // GET: api/teams/{id}
        [HttpGet("{id}",Name = "GetTeamById")]
        public async Task<ActionResult<TeamDTO_GET>> GetByIdAsync(string id)
        {
            try
            {
                var team = await _context.Teams
                    .AsNoTracking()
                    .Include(t => t.Members)
                        .ThenInclude(m => m.User)
                    .Include(t => t.Statuses)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (team == null)
                    return NotFound(ErrorResponse.NotFound("Team"));

                return Ok(_mapper.Map<TeamDTO_GET>(team));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving team {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        // POST: api/teams
        [HttpPost]
        public async Task<ActionResult<TeamDTO_GET>> CreateAsync([FromBody] TeamDTO_POST dto)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            try
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

                var team = new Team
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = dto.Name,
                    Description = dto.Description,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };

                _context.Teams.Add(team);

                // Add creator as admin
                _context.Members.Add(new Member
                {
                    Id = Guid.NewGuid().ToString(),
                    TeamId = team.Id,
                    UserId = userId,
                    Role = Role.Admin
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtRoute("GetTeamById",
                    new { id = team.Id },
                    _mapper.Map<TeamDTO_GET>(team));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error creating team");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating team");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        // PUT: api/teams/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(string id, [FromBody] TeamDTO_PUT dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            try
            {
                var userId = User.GetUserId();
                var team = await _context.Teams
                    .Include(t => t.Members)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (team == null)
                    return NotFound(ErrorResponse.NotFound("Team"));

                var isAdmin = team.Members.Any(m =>
                    m.UserId == userId && m.Role == Role.Admin);

                if (!isAdmin && team.CreatedBy != userId)
                    return Forbid();

                _mapper.Map(dto, team);
                await _context.SaveChangesAsync();

                return CreatedAtRoute("GetTeamById",
                    new { id = team.Id },
                    _mapper.Map<TeamDTO_GET>(team));
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, $"Concurrency error updating team {id}");
                return Conflict(ErrorResponse.Conflict("Team"));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error updating team {id}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error updating team {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        // DELETE: api/teams/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(string id)
        {
            try
            {
                var userId = User.GetUserId();
                var team = await _context.Teams
                    .Include(t => t.Members)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (team == null)
                    return NoContent();

                var isAdmin = team.Members.Any(m =>
                    m.UserId == userId && m.Role == Role.Admin);

                if (!isAdmin && team.CreatedBy != userId)
                    return Forbid();

                using var transaction = await _context.Database.BeginTransactionAsync();

                // Remove related entities
                _context.Members.RemoveRange(team.Members);
                _context.Invitations.RemoveRange(team.Invitations);
                _context.Statuses.RemoveRange(team.Statuses);
                _context.Tasks.RemoveRange(team.Tasks);

                _context.Teams.Remove(team);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error deleting team {id}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error deleting team {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpGet("{teamId}/members")]
        public async Task<ActionResult<IEnumerable<MemberDTO_GET>>> GetTeamMembers(string teamId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            try
            {
                // Validate team exists
                var team = await _context.Teams
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.Id == teamId);

                if (team == null)
                    return NotFound(ErrorResponse.NotFound("Team not found"));

                // Verify user has access to this team
                var isMember = await _context.Members
                    .AnyAsync(m => m.TeamId == teamId && m.UserId == userId);

                if (!isMember)
                    return Forbid();

                // Base query
                var query = _context.Members
                    .AsNoTracking()
                    .Include(m => m.User)
                    .Where(m => m.TeamId == teamId)
                    .OrderBy(m => m.User.Username);

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply pagination and projection
                var members = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(m => new MemberDTO_GET(
                        m.TeamId,
                        m.UserId,
                        m.Role,
                        new UserDTO_GET
                        (
                            m.User.Id,
                            m.User.Username,
                            m.User.Email
                        )))
                    .ToListAsync();

                // Add pagination headers
                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(members);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving team members");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        // GET: api/teams/{teamId}/members/{userId}/is-admin
        [HttpGet("{teamId}/members/{userId}/is-admin")]
        public async Task<ActionResult<bool>> IsRoleAdmin(string teamId, string userId)
        {
            // Ensure the team exists
            var team = await _context.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team == null)
                return NotFound(ErrorResponse.NotFound("Team"));

            var isAdmin = team.Members
                .Any(m => m.UserId == userId && m.Role == Role.Admin);

            return Ok(isAdmin);
        }

        // GET: api/teams/{teamId}/members/{userId}/is-admin
        [HttpGet("{teamId}/members/{userId}/is-member")]
        public async Task<ActionResult<bool>> IsRoleMember(string teamId, string userId)
        {
            // Ensure the team exists
            var team = await _context.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == teamId);

            if (team == null)
                return NotFound(ErrorResponse.NotFound("Team"));

            var isMember = team.Members
                .Any(m => m.UserId == userId && m.Role == Role.Member);

            return Ok(isMember);
        }



        // POST: api/teams/invite
        [HttpPost("invite")]
        public async Task<IActionResult> SendInvite([FromBody] TeamInviteDTO_POST dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            try
            {
                var userId = User.GetUserId();
                var team = await _context.Teams
                    .Include(t => t.Members)
                    .FirstOrDefaultAsync(t => t.Id == dto.TeamId);

                if (team == null)
                    return NotFound(ErrorResponse.NotFound("Team"));

                var isAdmin = team.Members.Any(m =>
                    m.UserId == userId && m.Role == Role.Admin);

                if (!isAdmin)
                    return Forbid();

                var invitee = await _context.Users
                    .FirstOrDefaultAsync(u =>
                        u.Email == dto.Identifier ||
                        u.Username == dto.Identifier);

                if (invitee == null)
                    return NotFound(ErrorResponse.NotFound("User"));

                if (team.Members.Any(m => m.UserId == invitee.Id))
                    return Conflict(ErrorResponse.Conflict("User already in team"));

                var existingInvite = await _context.Invitations
                    .FirstOrDefaultAsync(i =>
                        i.TeamId == dto.TeamId &&
                        i.InviteeId == invitee.Id);

                if (existingInvite != null)
                    return Conflict(ErrorResponse.Conflict("Invite already exists"));

                var invitation = new Invitation
                {
                    Id = Guid.NewGuid().ToString(),
                    TeamId = dto.TeamId,
                    InviterId = userId,
                    InviteeId = invitee.Id,
                    Status = InvitationStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Invitations.Add(invitation);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error sending invite");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error sending invite");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }
    }
}