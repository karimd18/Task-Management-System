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
    public class StatusesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<StatusesController> _logger;

        public StatusesController(
            AppDbContext context,
            IMapper mapper,
            ILogger<StatusesController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StatusDTO_GET>>> GetAllAsync(
            [FromQuery] string? teamId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            try
            {
                var query = _context.Statuses.AsNoTracking();

                if (!string.IsNullOrEmpty(teamId))
                {
                    if (!await HasTeamAccessAsync(teamId, userId))
                        return StatusCode(403, ErrorResponse.Forbidden());

                    query = query.Where(s => s.TeamId == teamId);
                }
                else
                {
                    // Only personal statuses if no team specified
                    query = query.Where(s => s.TeamId == null);
                }

                var totalCount = await query.CountAsync();
                var statuses = await query
                    .OrderBy(s => s.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(_mapper.Map<List<StatusDTO_GET>>(statuses));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving statuses");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpGet("{id}",Name = "GetStatusById")]
        public async Task<ActionResult<StatusDTO_GET>> GetByIdAsync(string id)
        {
            try
            {
                var status = await _context.Statuses
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (status == null)
                    return NotFound(ErrorResponse.NotFound("Status"));

                var userId = User.GetUserId();
                if (!await HasStatusAccessAsync(status, userId))
                    return StatusCode(403, ErrorResponse.Forbidden());

                return Ok(_mapper.Map<StatusDTO_GET>(status));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving status {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpPost]
        public async Task<ActionResult<StatusDTO_GET>> CreateAsync([FromBody] StatusDTO_POST dto)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            try
            {
                if (!string.IsNullOrEmpty(dto.TeamId) &&
                    !await HasTeamAccessAsync(dto.TeamId, userId))
                {
                    return StatusCode(403, ErrorResponse.Forbidden());
                }

                var duplicate = await _context.Statuses.AnyAsync(s =>
                    s.Name == dto.Name &&
                    s.TeamId == dto.TeamId);

                if (duplicate)
                    return Conflict(ErrorResponse.Conflict("Status name already exists"));

                var status = _mapper.Map<Status>(dto);
                status.Id = Guid.NewGuid().ToString();
                status.CreatedAt = DateTime.UtcNow;
                status.CreatedBy = userId;

                _context.Statuses.Add(status);
                await _context.SaveChangesAsync();

                return CreatedAtRoute("GetStatusById",
                    new { id = status.Id },
                    _mapper.Map<StatusDTO_GET>(status));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error creating status");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating status");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(string id, [FromBody] StatusDTO_PUT dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            try
            {
                var status = await _context.Statuses.FindAsync(id);
                if (status == null)
                    return NotFound(ErrorResponse.NotFound("Status"));

                var userId = User.GetUserId();
                if (!await HasStatusAccessAsync(status, userId))
                    return StatusCode(403, ErrorResponse.Forbidden());

                var duplicate = await _context.Statuses.AnyAsync(s =>
                    s.Name == dto.Name &&
                    s.TeamId == status.TeamId &&
                    s.Id != id);

                if (duplicate)
                    return Conflict(ErrorResponse.Conflict("Status name already exists"));

                _mapper.Map(dto, status);
                await _context.SaveChangesAsync();

                return CreatedAtRoute("GetStatusById",
                    new { id = status.Id },
                    _mapper.Map<StatusDTO_GET>(status));
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, $"Concurrency error updating status {id}");
                return Conflict(ErrorResponse.Conflict("Status modified concurrently"));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error updating status {id}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating status {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(string id)
        {
            try
            {
                var status = await _context.Statuses
                    .Include(s => s.Tasks)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (status == null)
                    return NoContent();

                var userId = User.GetUserId();
                if (!await HasStatusAccessAsync(status, userId))
                    return StatusCode(403, ErrorResponse.Forbidden());

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    if (status.Tasks.Any())
                    {
                        var fallback = await GetFallbackStatusAsync(status.TeamId);
                        if (fallback == null)
                        {
                            throw new InvalidOperationException("Fallback status not found");
                        }

                        await _context.Tasks
                            .Where(t => t.StatusId == id)
                            .ExecuteUpdateAsync(s =>
                                s.SetProperty(t => t.StatusId, fallback.Id));
                    }

                    _context.Statuses.Remove(status);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, $"Fallback status not found for team");
                return BadRequest(ErrorResponse.BadRequest(
                    "Cannot delete status - no fallback status available"));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error deleting status {id}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting status {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        private async Task<bool> HasTeamAccessAsync(string teamId, string userId)
        {
            return await _context.Teams.AnyAsync(t =>
                t.Id == teamId &&
                (t.CreatedBy == userId || t.Members.Any(m => m.UserId == userId)));
        }

        private async Task<bool> HasStatusAccessAsync(Status status, string userId)
        {
            if (status.TeamId == null) 
                return status.CreatedBy == userId;

            return await HasTeamAccessAsync(status.TeamId, userId);
        }

        private async Task<Status?> GetFallbackStatusAsync(string? teamId)
        {
            // Try default fallback names in order
            var fallbackNames = new[] { "Todo", "Backlog", "Open" };

            foreach (var name in fallbackNames)
            {
                var status = await _context.Statuses
                    .FirstOrDefaultAsync(s =>
                        s.TeamId == teamId &&
                        s.Name == name);

                if (status != null) return status;
            }

            // If no fallback found, get first available status
            return await _context.Statuses
                .Where(s => s.TeamId == teamId)
                .OrderBy(s => s.CreatedAt)
                .FirstOrDefaultAsync();
        }
    }
}