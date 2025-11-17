namespace SnakeGame.Models;

public class Score
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int Points { get; set; }
    public int FoodCount { get; set; }
    public int GameTime { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public User? User { get; set; }
}
