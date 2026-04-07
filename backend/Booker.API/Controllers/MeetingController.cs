namespace Booker.API.Controllers;

public record CreateMeetingRequest(DateTime ScheduledDate, string? Notes);
public record UpdateMeetingRequest(DateTime? ScheduledDate, Guid? BookId, string? Notes);

[ApiController]
[Route("api/club/{clubId}/meeting")]
[Authorize]
public class MeetingController(IMeetingService meetingService, IClubService clubService, IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMeetings(Guid clubId)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();

        var member = await clubService.GetMemberAsync(clubId, user.Id);
        if (member is null) return Forbid();

        var meetings = await meetingService.GetByClubIdAsync(clubId);
        return Ok(meetings.Select(m => new
        {
            m.Id,
            m.ScheduledDate,
            m.Notes,
            m.CreatedAt,
            Book = m.Book is null ? null : new
            {
                m.Book.Id,
                m.Book.Title,
                m.Book.Author,
                m.Book.CoverUrl
            },
            AddedBy = new { m.AddedBy.Id, m.AddedBy.Name }
        }));
    }

    [HttpPost]
    public async Task<IActionResult> CreateMeeting(Guid clubId, [FromBody] CreateMeetingRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();

        var member = await clubService.GetMemberAsync(clubId, user.Id);
        if (member is null || member.Role != "owner") return Forbid();

        var club = await clubService.GetByIdAsync(clubId);
        if (club is null) return NotFound();

        var meeting = await meetingService.CreateAsync(clubId, user.Id, request.ScheduledDate.ToUniversalTime(), request.Notes);
        return Ok(new
        {
            meeting.Id,
            meeting.ScheduledDate,
            meeting.Notes,
            meeting.CreatedAt,
            Book = (object?)null,
            AddedBy = new { user.Id, user.Name }
        });
    }

    [HttpPatch("{meetingId}")]
    public async Task<IActionResult> UpdateMeeting(Guid clubId, Guid meetingId, [FromBody] UpdateMeetingRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();

        var member = await clubService.GetMemberAsync(clubId, user.Id);
        if (member is null || member.Role != "owner") return Forbid();

        var meeting = await meetingService.UpdateAsync(
            meetingId,
            request.ScheduledDate?.ToUniversalTime(),
            request.BookId,
            request.Notes);

        if (meeting is null) return NotFound();

        return Ok(new
        {
            meeting.Id,
            meeting.ScheduledDate,
            meeting.Notes,
            meeting.CreatedAt,
            Book = meeting.Book is null ? null : new
            {
                meeting.Book.Id,
                meeting.Book.Title,
                meeting.Book.Author,
                meeting.Book.CoverUrl
            },
            AddedBy = new { meeting.AddedBy.Id, meeting.AddedBy.Name }
        });
    }

    private async Task<User?> GetCurrentUserAsync()
    {
        var auth0Id = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");
        if (auth0Id is null) return null;
        return await userService.GetByAuth0IdAsync(auth0Id);
    }
}
