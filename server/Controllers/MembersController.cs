using System.Security.Claims;
using AutoMapper;
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
    public class MembersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<MembersController> _logger;

        public MembersController(
            AppDbContext context,
            IMapper mapper,
            ILogger<MembersController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDTO_GET>>> GetAllAsync(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            try
            {
                var query = _context.Members
                    .AsNoTracking()
                    .Include(m => m.User)
                    .Include(m => m.Team)
                    .Where(m => m.Team.Members.Any(x => x.UserId == userId));

                var totalCount = await query.CountAsync();
                var members = await query
                    .OrderBy(m => m.User.Username)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(_mapper.Map<List<MemberDTO_GET>>(members));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving members");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpGet("team/{teamId}")]
        public async Task<ActionResult<IEnumerable<MemberDTO_GET>>> GetByTeamAsync(
            string teamId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            try
            {
                if (!await HasTeamAccessAsync(teamId, userId))
                    return StatusCode(403, ErrorResponse.Forbidden());

                var query = _context.Members
                    .AsNoTracking()
                    .Include(m => m.User)
                    .Where(m => m.TeamId == teamId);

                var totalCount = await query.CountAsync();
                var members = await query
                    .OrderBy(m => m.User.Username)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                Response.Headers.Add("X-Total-Count", totalCount.ToString());
                Response.Headers.Add("X-Page", page.ToString());
                Response.Headers.Add("X-Page-Size", pageSize.ToString());

                return Ok(_mapper.Map<List<MemberDTO_GET>>(members));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving members for team {teamId}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpPost]
        public async Task<ActionResult<MemberDTO_GET>> AddMemberAsync([FromBody] MemberDTO_POST dto)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            try
            {
                if (!await IsTeamAdminAsync(dto.TeamId, userId))
                    return StatusCode(403, ErrorResponse.Forbidden());

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == dto.UserEmail || u.Username == dto.Username);

                if (user == null)
                    return NotFound(ErrorResponse.NotFound("User"));

                if (await _context.Members.AnyAsync(m => m.TeamId == dto.TeamId && m.UserId == user.Id))
                    return Conflict(ErrorResponse.Conflict("User already in team"));

                var member = new Member
                {
                    Id = Guid.NewGuid().ToString(),
                    TeamId = dto.TeamId,
                    UserId = user.Id,
                    Role = dto.Role
                };

                _context.Members.Add(member);
                await _context.SaveChangesAsync();

                await _context.Entry(member)
                    .Reference(m => m.User)
                    .LoadAsync();

                return CreatedAtAction(nameof(GetByTeamAsync),
                    new { teamId = dto.TeamId },
                    _mapper.Map<MemberDTO_GET>(member));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error adding member");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding member");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpPut("{teamId}/{userId}")]
        public async Task<IActionResult> UpdateRoleAsync(
            string teamId,
            string userId,
            [FromBody] MemberDTO_PUT dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            try
            {
                var callerId = User.GetUserId();
                if (!await IsTeamAdminAsync(teamId, callerId))
                    return StatusCode(403, ErrorResponse.Forbidden());

                var member = await _context.Members
                    .FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == userId);

                if (member == null)
                    return NotFound(ErrorResponse.NotFound("Member"));

                if (member.UserId == callerId)
                    return BadRequest(ErrorResponse.BadRequest("Cannot modify your own role"));

                member.Role = dto.Role;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, $"Concurrency error updating member {userId} in team {teamId}");
                return Conflict(ErrorResponse.Conflict("Member modified concurrently"));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error updating member {userId} in team {teamId}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating member {userId} in team {teamId}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpDelete("{teamId}/{userId}")]
        public async Task<IActionResult> RemoveAsync(string teamId, string userId)
        {
            try
            {
                var callerId = User.GetUserId();
                if (!await IsTeamAdminAsync(teamId, callerId))
                    return StatusCode(403, ErrorResponse.Forbidden());

                var member = await _context.Members
                    .FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == userId);

                if (member == null)
                    return NoContent();

                if (member.UserId == callerId)
                    return BadRequest(ErrorResponse.BadRequest("Cannot remove yourself from team"));

                // Prevent removal of last admin
                var adminCount = await _context.Members
                    .CountAsync(m => m.TeamId == teamId && m.Role == Role.Admin);

                if (adminCount <= 1 && member.Role == Role.Admin)
                    return BadRequest(ErrorResponse.BadRequest("Cannot remove last admin"));

                _context.Members.Remove(member);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error removing member {userId} from team {teamId}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing member {userId} from team {teamId}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        private async Task<bool> HasTeamAccessAsync(string teamId, string userId)
        {
            return await _context.Members
                .AnyAsync(m => m.TeamId == teamId && m.UserId == userId);
        }

        private async Task<bool> IsTeamAdminAsync(string teamId, string userId)
        {
            return await _context.Members
                .AnyAsync(m =>
                    m.TeamId == teamId &&
                    m.UserId == userId &&
                    m.Role == Role.Admin);
        }
    }
}