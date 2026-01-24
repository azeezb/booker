using Microsoft.AspNetCore.Mvc;

namespace Booker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Health check endpoint
    /// </summary>
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            Status = "Healthy",
            Service = "Booker API",
            Timestamp = DateTime.UtcNow,
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
        });
    }

    /// <summary>
    /// Check database connections (placeholder for now)
    /// </summary>
    [HttpGet("database")]
    public IActionResult CheckDatabase()
    {
        return Ok(new
        {
            PostgreSQL = "Not configured yet",
            Redis = "Not configured yet"
        });
    }
}
