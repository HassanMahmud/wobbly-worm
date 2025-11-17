namespace SnakeGame.Services;

public interface IAuthenticationService
{
    string GenerateToken(Guid userId, string username);
}
