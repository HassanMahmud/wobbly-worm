namespace SnakeGame.Services;

public interface IScoreService
{
    Task<object> SubmitScoreAsync(Guid userId, int points, int foodCount, int gameTime);
    Task<object> GetTopScoresAsync(int limit = 10);
    Task<object> GetUserScoresAsync(Guid userId, int limit = 20);
}
