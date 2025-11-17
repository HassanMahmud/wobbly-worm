using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace SnakeGame.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly string _jwtKey;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;

    public AuthenticationService(string jwtKey, string jwtIssuer, string jwtAudience)
    {
        _jwtKey = jwtKey;
        _jwtIssuer = jwtIssuer;
        _jwtAudience = jwtAudience;
    }

    public string GenerateToken(Guid userId, string username)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, username)
        };

        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
