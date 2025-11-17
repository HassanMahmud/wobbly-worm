using Microsoft.AspNetCore.Mvc;

namespace SnakeGame.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "ok",
            timestamp = DateTime.UtcNow
        });
    }
}
