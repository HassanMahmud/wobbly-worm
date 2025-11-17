using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnakeGame.Services;

namespace SnakeGame.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IAuthenticationService _authService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, IAuthenticationService authService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Length < 3)
                return BadRequest(new { error = "INVALID_USERNAME", message = "Username must be at least 3 characters" });

            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
                return BadRequest(new { error = "INVALID_PASSWORD", message = "Password must be at least 6 characters" });

            var user = await _userService.CreateUserAsync(request.Username, request.Password);

            return Created($"/api/users/{user.Id}", new
            {
                userId = user.Id,
                username = user.Username,
                message = "User registered successfully"
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = "USER_EXISTS", message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return StatusCode(500, new { error = "SERVER_ERROR", message = "An error occurred during registration" });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var isValid = await _userService.VerifyPasswordAsync(request.Username, request.Password);
            if (!isValid)
            {
                return Unauthorized(new { error = "INVALID_CREDENTIALS", message = "Invalid username or password" });
            }

            var user = await _userService.GetUserByUsernameAsync(request.Username);
            if (user == null)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = "User not found" });
            }

            var token = _authService.GenerateToken(user.Id, user.Username);

            Response.Cookies.Append("auth_token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = !HttpContext.Request.IsHttps == false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddHours(24)
            });

            return Ok(new
            {
                userId = user.Id,
                username = user.Username,
                token = token,
                message = "Login successful"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging in user");
            return StatusCode(500, new { error = "SERVER_ERROR", message = "An error occurred during login" });
        }
    }

    [HttpPost("guest")]
    public IActionResult CreateGuest([FromBody] GuestRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.GuestName) || request.GuestName.Length < 1)
                return BadRequest(new { error = "INVALID_GUEST_NAME", message = "Guest name cannot be empty" });

            var guestId = Guid.NewGuid();
            var token = GenerateGuestToken(guestId, request.GuestName);

            Response.Cookies.Append("guest_token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = !HttpContext.Request.IsHttps == false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddHours(2)
            });

            return Ok(new
            {
                guestId = guestId,
                guestName = request.GuestName,
                token = token,
                message = "Guest session created"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating guest session");
            return StatusCode(500, new { error = "SERVER_ERROR", message = "An error occurred creating guest session" });
        }
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] LoginRequest request)
    {
        try
        {
            var isValid = await _userService.VerifyPasswordAsync(request.Username, request.Password);
            if (!isValid)
            {
                return Unauthorized(new { error = "INVALID_CREDENTIALS", message = "Invalid username or password" });
            }

            var user = await _userService.GetUserByUsernameAsync(request.Username);
            if (user == null)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = "User not found" });
            }

            return Ok(new
            {
                valid = true,
                userId = user.Id,
                username = user.Username
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying credentials");
            return StatusCode(500, new { error = "SERVER_ERROR", message = "An error occurred during verification" });
        }
    }

    [Authorize]
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetProfile(Guid userId)
    {
        try
        {
            var profile = await _userService.GetUserProfileAsync(userId);
            return Ok(profile);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "USER_NOT_FOUND", message = "User not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user profile");
            return StatusCode(500, new { error = "SERVER_ERROR", message = "An error occurred" });
        }
    }

    private string GenerateGuestToken(Guid guestId, string guestName)
    {
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{guestId}:{guestName}"));
    }
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class GuestRequest
{
    public string GuestName { get; set; } = string.Empty;
}
