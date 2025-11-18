namespace SnakeGame.Models;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Guest session tracking for device-based persistence
    public string? DeviceId { get; set; }
    public string? SessionId { get; set; }
    public bool IsGuest { get; set; }

    public ICollection<Score> Scores { get; set; } = new List<Score>();
}
