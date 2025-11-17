using Microsoft.EntityFrameworkCore;
using SnakeGame.Data;
using SnakeGame.Models;

namespace SnakeGame.Services;

public class ScoreService : IScoreService
{
    private readonly SnakeGameDbContext _context;
    private readonly IUserService _userService;

    public ScoreService(SnakeGameDbContext context, IUserService userService)
    {
        _context = context;
        _userService = userService;
    }

    public async Task<object> SubmitScoreAsync(Guid userId, int points, int foodCount, int gameTime)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        var score = new Score
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Points = points,
            FoodCount = foodCount,
            GameTime = gameTime,
            Timestamp = DateTime.UtcNow
        };

        _context.Scores.Add(score);
        await _context.SaveChangesAsync();

        return new
        {
            scoreId = score.Id,
            userId = score.UserId,
            score = score.Points,
            foodCount = score.FoodCount,
            gameTime = score.GameTime,
            timestamp = score.Timestamp,
            message = "Score recorded successfully"
        };
    }

    public async Task<object> GetTopScoresAsync(int limit = 10)
    {
        var scores = await _context.Scores
            .Include(s => s.User)
            .OrderByDescending(s => s.Points)
            .Take(limit)
            .ToListAsync();

        var topScores = scores.Select((s, index) => new
        {
            rank = index + 1,
            scoreId = s.Id,
            userId = s.UserId,
            username = s.User!.Username,
            score = s.Points,
            foodCount = s.FoodCount,
            gameTime = s.GameTime,
            timestamp = s.Timestamp
        }).ToList();

        return new
        {
            scores = topScores,
            total = topScores.Count
        };
    }

    public async Task<object> GetUserScoresAsync(Guid userId, int limit = 20)
    {
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        var scores = await _context.Scores
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.Timestamp)
            .Take(limit)
            .ToListAsync();

        var userScores = scores.Select((s, index) => new
        {
            rank = index + 1,
            scoreId = s.Id,
            userId = s.UserId,
            username = user.Username,
            score = s.Points,
            foodCount = s.FoodCount,
            gameTime = s.GameTime,
            timestamp = s.Timestamp
        }).ToList();

        return new
        {
            userId = userId,
            scores = userScores,
            total = userScores.Count
        };
    }
}
