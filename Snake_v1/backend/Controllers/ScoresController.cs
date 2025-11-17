using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnakeGame.Services;

namespace SnakeGame.Controllers;

[ApiController]
[Route("api/scores")]
public class ScoresController : ControllerBase
{
    private readonly IScoreService _scoreService;
    private readonly ILogger<ScoresController> _logger;

    public ScoresController(IScoreService scoreService, ILogger<ScoresController> logger)
    {
        _scoreService = scoreService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitScore([FromBody] SubmitScoreRequest request)
    {
        try
        {
            if (request.UserId == Guid.Empty)
                return BadRequest(new { error = "INVALID_USER_ID", message = "Invalid user ID" });

            if (request.Score < 0)
                return BadRequest(new { error = "INVALID_SCORE", message = "Score cannot be negative" });

            var result = await _scoreService.SubmitScoreAsync(request.UserId, request.Score, request.FoodCount, request.GameTime);
            return Created("", result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting score");
            return StatusCode(500, new { error = "SERVER_ERROR", message = "An error occurred" });
        }
    }

    [HttpGet("top")]
    public async Task<IActionResult> GetTopScores([FromQuery] int limit = 10)
    {
        try
        {
            if (limit < 1 || limit > 100)
                limit = 10;

            var result = await _scoreService.GetTopScoresAsync(limit);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving top scores");
            return StatusCode(500, new { error = "SERVER_ERROR", message = "An error occurred" });
        }
    }

    [Authorize]
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserScores(Guid userId, [FromQuery] int limit = 20)
    {
        try
        {
            if (limit < 1 || limit > 100)
                limit = 20;

            var result = await _scoreService.GetUserScoresAsync(userId, limit);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "USER_NOT_FOUND", message = "User not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user scores");
            return StatusCode(500, new { error = "SERVER_ERROR", message = "An error occurred" });
        }
    }
}

public class SubmitScoreRequest
{
    public Guid UserId { get; set; }
    public int Score { get; set; }
    public int FoodCount { get; set; }
    public int GameTime { get; set; }
}
