using SnakeGame.Models;

namespace SnakeGame.Services;

public interface IUserService
{
    Task<User?> GetUserByIdAsync(Guid id);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<User> CreateUserAsync(string username, string password);
    Task<bool> VerifyPasswordAsync(string username, string password);
    Task<User> CreateGuestSessionAsync(string username, string deviceId);
    Task<User?> GetGuestBySessionAsync(string deviceId, string sessionId);
    Task<object> GetUserProfileAsync(Guid userId);
}
