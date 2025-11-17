using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SnakeGame.Data;
using SnakeGame.Models;

namespace SnakeGame.Services;

public class UserService : IUserService
{
    private readonly SnakeGameDbContext _context;

    public UserService(SnakeGameDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User> CreateUserAsync(string username, string password)
    {
        if (await GetUserByUsernameAsync(username) != null)
        {
            throw new InvalidOperationException("Username already exists");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            PasswordHash = HashPassword(password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<bool> VerifyPasswordAsync(string username, string password)
    {
        var user = await GetUserByUsernameAsync(username);
        if (user == null)
        {
            return false;
        }

        return VerifyPassword(password, user.PasswordHash);
    }

    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    private bool VerifyPassword(string password, string hash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput == hash;
    }

    public async Task<object> GetUserProfileAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Scores)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        var scores = user.Scores.OrderByDescending(s => s.Points).ToList();

        return new
        {
            userId = user.Id,
            username = user.Username,
            createdAt = user.CreatedAt,
            totalGamesPlayed = scores.Count,
            highestScore = scores.FirstOrDefault()?.Points ?? 0,
            averageScore = scores.Count > 0 ? scores.Average(s => s.Points) : 0
        };
    }
}
