namespace Booker.API.Controllers;

public record SyncUserRequest(string Name, string Email);
public record UpdateUserRequest(string Name);

[ApiController]
[Route("api/user")]
public class UserController(IUserService userService) : ControllerBase
{
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetMe()
    {
        var auth0Id = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");

        if (auth0Id is null) return Unauthorized();

        var user = await userService.GetByAuth0IdAsync(auth0Id);
        return user is null ? NotFound() : Ok(user);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> SyncMe([FromBody] SyncUserRequest request)
    {
        var auth0Id = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");

        if (auth0Id is null)
            return Unauthorized();

        var user = await userService.GetOrCreateUserAsync(auth0Id, request.Email, request.Name);
        return Ok(user);
    }

    [Authorize]
    [HttpPatch]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateUserRequest request)
    {
        var auth0Id = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");

        if (auth0Id is null) return Unauthorized();

        var user = await userService.UpdateUserAsync(auth0Id, request.Name);
        return user is null ? NotFound() : Ok(user);
    }
}
