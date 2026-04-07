namespace Booker.API.Controllers;

public record CreateClubRequest(string Name, string Description, bool IsPublic);
public record UpdateFrequencyRequest(MeetingFrequency? Frequency);

[ApiController]
[Route("api/club")]
public class ClubController(IClubService clubService, IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPublicClubs()
        => Ok(await clubService.GetPublicClubsAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetClub(Guid id)
    {
        var club = await clubService.GetByIdAsync(id);
        return club is null ? NotFound() : Ok(club);
    }

    [Authorize]
    [HttpGet("/api/user/club")]
    public async Task<IActionResult> GetMyClubs()
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();
        return Ok(await clubService.GetUserClubsAsync(user.Id));
    }

    [Authorize]
    [HttpGet("{id}/member")]
    public async Task<IActionResult> GetMembers(Guid id)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();

        var member = await clubService.GetMemberAsync(id, user.Id);
        if (member is null) return Forbid();

        var members = await clubService.GetMembersAsync(id);
        return Ok(members.Select(m => new
        {
            m.Id,
            m.Role,
            m.JoinedAt,
            User = new { m.User.Id, m.User.Name }
        }));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateClub([FromBody] CreateClubRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();
        var club = await clubService.CreateClubAsync(user.Id, request.Name, request.Description, request.IsPublic);
        return Ok(club);
    }

    [Authorize]
    [HttpPost("{id}/join")]
    public async Task<IActionResult> JoinClub(Guid id)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();

        var club = await clubService.GetByIdAsync(id);
        if (club is null) return NotFound();

        var joined = await clubService.JoinClubAsync(id, user.Id);
        return joined ? Ok() : Conflict("Already a member");
    }

    [Authorize]
    [HttpPatch("{id}/frequency")]
    public async Task<IActionResult> UpdateFrequency(Guid id, [FromBody] UpdateFrequencyRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();

        var member = await clubService.GetMemberAsync(id, user.Id);
        if (member is null || member.Role != "owner") return Forbid();

        var club = await clubService.UpdateFrequencyAsync(id, request.Frequency);
        return club is null ? NotFound() : Ok(club);
    }

    private async Task<User?> GetCurrentUserAsync()
    {
        var auth0Id = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");
        if (auth0Id is null) return null;
        return await userService.GetByAuth0IdAsync(auth0Id);
    }
}
