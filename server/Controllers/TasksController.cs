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
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<TasksController> _logger;

        public TasksController(
            AppDbContext context,
            IMapper mapper,
            ILogger<TasksController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskEntityDTO_GET>>> GetAllAsync(
            [FromQuery] string? teamId,
            [FromQuery] bool? isPersonal,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            try
            {
                var query = _context.Tasks
                    .AsNoTracking()
                    .Include(t => t.AssignedToUser)
                    .Include(t => t.Status)
                    .Where(t => t.IsPersonal
                        ? t.CreatedBy == userId
                        : _context.Members.Any(m =>
                            m.TeamId == t.TeamId &&
                            m.UserId == userId));

                if (!string.IsNullOrEmpty(teamId))
                    query = query.Where(t => t.TeamId == teamId);

                if (isPersonal.HasValue)
                    query = query.Where(t => t.IsPersonal == isPersonal.Value);

                var totalCount = await query.CountAsync();
                var tasks = await query
                    .OrderByDescending(t => t.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(_mapper.Map<List<TaskEntityDTO_GET>>(tasks));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpGet("{id}", Name = "GetTaskEntityById")]
        public async Task<ActionResult<TaskEntityDTO_GET>> GetByIdAsync(string id)
        {
            try
            {
                var task = await _context.Tasks
                    .AsNoTracking()
                    .Include(t => t.AssignedToUser)
                    .Include(t => t.Status)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (task == null)
                    return NotFound(ErrorResponse.NotFound("Task"));

                var userId = User.GetUserId();
                if (!HasTaskAccess(task, userId))
                    return StatusCode(403, ErrorResponse.Forbidden());

                return Ok(_mapper.Map<TaskEntityDTO_GET>(task));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving task {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpPost]
        public async Task<ActionResult<TaskEntityDTO_GET>> CreateAsync(
    [FromBody] TaskEntityDTO_POST dto)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ErrorResponse.Unauthorized());

            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            try
            {
                var validationResult = await ValidateTaskCreation(dto, userId);

                if (validationResult != null)
                    return validationResult;

                var task = _mapper.Map<TaskEntity>(dto);
                task.Id = Guid.NewGuid().ToString();
                task.CreatedAt = DateTime.UtcNow;
                task.CreatedBy = userId;

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                return CreatedAtRoute("GetTaskEntityById", new { id = task.Id }, _mapper.Map<TaskEntityDTO_GET>(task));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error creating task");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        private async Task<ActionResult<TaskEntityDTO_GET>> ValidateTaskCreation(
            TaskEntityDTO_POST dto,
            string userId)
        {
            var statusExists = await _context.Statuses.AnyAsync(s => s.Id == dto.StatusId);
            if (!statusExists)
                return NotFound(ErrorResponse.NotFound("Status"));

            if (!string.IsNullOrEmpty(dto.AssignedToUserId))
            {
                var validAssignment = dto.IsPersonal
                    ? dto.AssignedToUserId == userId
                    : await _context.Members.AnyAsync(m =>
                        m.TeamId == dto.TeamId &&
                        m.UserId == dto.AssignedToUserId);

                if (!validAssignment)
                    return BadRequest(ErrorResponse.BadRequest("Invalid user assignment"));
            }

            return null!;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(
            string id, [FromBody] TaskEntityDTO_PUT dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            try
            {
                var task = await _context.Tasks
                    .Include(t => t.Status)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (task == null)
                    return NotFound(ErrorResponse.NotFound("Task"));

                var userId = User.GetUserId();


                var validationError = await ValidateTaskUpdate(dto, task, userId);
                if (validationError != null)
                    return validationError;

                _mapper.Map(dto, task);
                await _context.SaveChangesAsync();

                return CreatedAtRoute("GetTaskEntityById", new { id = task.Id }, _mapper.Map<TaskEntityDTO_GET>(task));
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, $"Concurrency error updating task {id}");
                return Conflict(ErrorResponse.Conflict("Task"));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error updating task {id}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating task {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(string id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                    return NoContent();

                var userId = User.GetUserId();
                if (!HasTaskAccess(task, userId))
                    return StatusCode(403, ErrorResponse.Forbidden());

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error deleting task {id}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting task {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        private bool HasTaskAccess(TaskEntity task, string userId)
        {
            if (task.IsPersonal)
                return task.CreatedBy == userId;

            return _context.Members.Any(m =>
                m.TeamId == task.TeamId &&
                m.UserId == userId &&
                (m.Role == Role.Admin || task.CreatedBy == userId));
        }

        private async Task<IActionResult?> ValidateTask(TaskEntityDTO_POST dto, string userId)
        {
            // Validate status exists
            var statusExists = await _context.Statuses.AnyAsync(s => s.Id == dto.StatusId);
            if (!statusExists)
                return NotFound(ErrorResponse.NotFound("Status"));

            // Validate assignment
            if (!string.IsNullOrEmpty(dto.AssignedToUserId))
            {
                var validAssignment = dto.IsPersonal
                    ? dto.AssignedToUserId == userId
                    : await _context.Members.AnyAsync(m =>
                        m.TeamId == dto.TeamId &&
                        m.UserId == dto.AssignedToUserId);

                if (!validAssignment)
                    return BadRequest(ErrorResponse.BadRequest("Invalid user assignment"));
            }

            return null;
        }

        private async Task<IActionResult?> ValidateTaskUpdate(
            TaskEntityDTO_PUT dto, TaskEntity task, string userId)
        {
            // Validate new status
            if (task.StatusId != dto.StatusId)
            {
                var statusExists = await _context.Statuses.AnyAsync(s => s.Id == dto.StatusId);
                if (!statusExists)
                    return NotFound(ErrorResponse.NotFound("Status"));
            }

            // Validate assignment
            if (dto.AssignedToUserId != task.AssignedToUserId)
            {
                if (!string.IsNullOrEmpty(dto.AssignedToUserId))
                {
                    var validAssignment = task.IsPersonal
                        ? dto.AssignedToUserId == userId
                        : await _context.Members.AnyAsync(m =>
                            m.TeamId == task.TeamId &&
                            m.UserId == dto.AssignedToUserId);

                    if (!validAssignment)
                        return BadRequest(ErrorResponse.BadRequest("Invalid user assignment"));
                }
            }

            return null;
        }
    }
}