using System.Security.Claims;
using AutoMapper;
using BCrypt.Net;
using FinalProjectAPIs.Extensions;
using FinalProjectAPIs.Helper;
using FinalProjectAPIs.Helpers;
using FinalProjectAPIs.Models;
using FinalProjectAPIs.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;

namespace FinalProjectAPIs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<UsersController> _logger;
        private readonly IConfiguration _config;

        public UsersController(
            AppDbContext context,
            IMapper mapper,
            ILogger<UsersController> logger,
            IConfiguration config)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _config = config;
        }

        // GET api/users/me
        [HttpGet("me"), Authorize]
        public async Task<ActionResult<UserDTO_GET>> Me()
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new ErrorResponse(401, "Invalid authentication", "AUTH_INVALID_TOKEN"));

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user == null
                ? NotFound(new ErrorResponse(404, "User not found", "USER_NOT_FOUND"))
                : Ok(_mapper.Map<UserDTO_GET>(user));
        }

        // GET api/users
        [HttpGet, Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserPublicDTO_GET>>> GetAllAsync()
        {
            try
            {
                var users = await _context.Users
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<UserPublicDTO_GET>>(users));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        // GET api/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserPublicDTO_GET>> GetByIdAsync(string id)
        {
            try
            {
                var user = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == id);

                return user == null
                    ? NotFound(new ErrorResponse(404, "User not found", "USER_NOT_FOUND"))
                    : Ok(_mapper.Map<UserPublicDTO_GET>(user));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving user {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        // POST api/users/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> LoginAsync([FromBody] LoginDTO creds)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email == creds.Identifier ||
                    u.Username == creds.Identifier);

            if (user == null || !BCrypt.Net.BCrypt.Verify(creds.Password, user.Password))
                return Unauthorized(new ErrorResponse(401, "Invalid credentials", "AUTH_INVALID_CREDENTIALS"));

            var token = JwtHelper.GenerateToken(user.Id, user.Username, _config);
            return Ok(new AuthResponse
            {
                Token = token,
                User = _mapper.Map<UserPublicDTO_GET>(user)
            });
        }

        // POST api/users/register
        [HttpPost("register")]
        public async Task<ActionResult<UserPublicDTO_GET>> RegisterAsync([FromBody] UserDTO_POST request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            if (request.Password != request.ConfirmPassword)
                return BadRequest(new ErrorResponse(400, "Passwords must match", "VALIDATION_PASSWORD_MISMATCH"));

            try
            {
                var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
                if (emailExists)
                    return Conflict(new ErrorResponse(409, "Email already registered", "CONFLICT_EMAIL"));

                var usernameExists = await _context.Users.AnyAsync(u => u.Username == request.Username);
                if (usernameExists)
                    return Conflict(new ErrorResponse(409, "Username taken", "CONFLICT_USERNAME"));

                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = request.Email.Trim(),
                    Username = request.Username.Trim(),
                    Password = BCrypt.Net.BCrypt.HashPassword(request.Password)
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetByIdAsync),
                    new { id = user.Id },
                    _mapper.Map<UserPublicDTO_GET>(user));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during registration");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected registration error");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        // PUT api/users/{id}
        [HttpPut("{id}"), Authorize]
        public async Task<IActionResult> UpdateAsync(string id, [FromBody] UserDTO_PUT dto)
        {
            var currentUserId = User.GetUserId();
            if (id != currentUserId)
                return Forbid();

            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new ErrorResponse(404, "User not found", "USER_NOT_FOUND"));

                if (!string.IsNullOrEmpty(dto.Email) &&
                    dto.Email != user.Email &&
                    await _context.Users.AnyAsync(u => u.Email == dto.Email))
                {
                    return Conflict(new ErrorResponse(409, "Email already exists", "CONFLICT_EMAIL"));
                }

                if (!string.IsNullOrEmpty(dto.Username) &&
                    dto.Username != user.Username &&
                    await _context.Users.AnyAsync(u => u.Username == dto.Username))
                {
                    return Conflict(new ErrorResponse(409, "Username taken", "CONFLICT_USERNAME"));
                }

                _mapper.Map(dto, user);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Error updating user {id}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error updating user {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        // POST api/users/change-password
        [HttpPost("change-password"), Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] PasswordChangeDTO dto)
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new ErrorResponse(401, "Invalid authentication", "AUTH_INVALID_TOKEN"));

            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new ErrorResponse(404, "User not found", "USER_NOT_FOUND"));

                if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password))
                    return Unauthorized(new ErrorResponse(401, "Invalid current password", "AUTH_INVALID_PASSWORD"));

                user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Password change failed for user {userId}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error changing password for user {userId}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] PasswordResetRequestDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.Trim());
            if (user == null)
                return Ok();

            user.ResetPasswordToken = Guid.NewGuid().ToString("N");
            user.ResetPasswordExpires = DateTime.UtcNow.AddHours(1);

            await _context.SaveChangesAsync();

            var resetLink = $"{_config["FrontendBaseUrl"]}/reset-password?token={user.ResetPasswordToken}";

            await EmailHelper.SendPasswordResetEmail(
                _config,
                to: user.Email,
                subject: "Your password reset link",
                body: $"Click here to reset your password: {resetLink}"
            );

            return Ok();
        }

        // POST api/users/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] PasswordResetDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse(400, ModelState));

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.ResetPasswordToken == dto.Token &&
                    u.ResetPasswordExpires > DateTime.UtcNow);

            if (user == null)
                return BadRequest(new ErrorResponse(400, "Invalid or expired token", "INVALID_RESET_TOKEN"));

            // hash new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            // clear the token so it can’t be reused
            user.ResetPasswordToken = null;
            user.ResetPasswordExpires = null;

            await _context.SaveChangesAsync();
            return NoContent();
        }



        // DELETE api/users/{id}
        [HttpDelete("{id}"), Authorize]
        public async Task<IActionResult> DeleteAsync(string id)
        {
            var currentUserId = User.GetUserId();
            if (id != currentUserId && !User.IsInRole("Admin"))
                return Forbid();

            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NoContent();

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Error deleting user {id}");
                return StatusCode(500, ErrorResponse.DatabaseError());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error deleting user {id}");
                return StatusCode(500, ErrorResponse.InternalServerError());
            }
        }
    }
}