namespace Booker.API.Controllers;

public record CreateMeetingRequest(DateTime ScheduledDate, [property: MaxLength(2000)] string? Notes);
public record UpdateMeetingRequest(DateTime? ScheduledDate, Guid? BookId, [property: MaxLength(2000)] string? Notes);
public record UpdateReadingStatusRequest(bool HasBook, bool HasStarted);

[ApiController]
[Route("api/club/{clubId}/meeting")]
[Authorize]
public class MeetingController(IMeetingService meetingService, IClubService clubService, IUserService userService, IMeetingReadingStatusService readingStatusService) : ControllerBase
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
            AddedBy = m.AddedBy is null ? null : new { m.AddedBy.Id, m.AddedBy.Name }
        }));
    }

    [HttpPost]
    public async Task<IActionResult> CreateMeeting(Guid clubId, [FromBody] CreateMeetingRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();

        var member = await clubService.GetMemberAsync(clubId, user.Id);
        if (member is null || member.Role != MemberRole.Owner) return Forbid();

        var club = await clubService.GetByIdAsync(clubId);
        if (club is null) return NotFound();

        var scheduledDate = request.ScheduledDate.ToUniversalTime();
        var meeting = await meetingService.CreateAsync(clubId, user.Id, scheduledDate, request.Notes);

        if (club.MeetingFrequency.HasValue)
        {
            var nextDate = NextMeetingDate(scheduledDate, club.MeetingFrequency.Value);
            await meetingService.CreateAsync(clubId, user.Id, nextDate, null);
        }

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

    private static DateTime NextMeetingDate(DateTime from, MeetingFrequency frequency)
    {
        var next = frequency == MeetingFrequency.Fortnightly
            ? from.AddDays(14)
            : from.AddMonths(1);

        // Snap forward to the same day-of-week as the original meeting
        while (next.DayOfWeek != from.DayOfWeek)
            next = next.AddDays(1);

        return next;
    }

    [HttpPatch("{meetingId}")]
    public async Task<IActionResult> UpdateMeeting(Guid clubId, Guid meetingId, [FromBody] UpdateMeetingRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();

        var member = await clubService.GetMemberAsync(clubId, user.Id);
        if (member is null || member.Role != MemberRole.Owner) return Forbid();

        var existing = await meetingService.GetByIdAsync(meetingId);
        if (existing is null || existing.ClubId != clubId) return NotFound();

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
            AddedBy = meeting.AddedBy is null ? null : new { meeting.AddedBy.Id, meeting.AddedBy.Name }
        });
    }

    [HttpGet("{meetingId}/reading-status")]
    public async Task<IActionResult> GetReadingStatus(Guid clubId, Guid meetingId)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();

        var member = await clubService.GetMemberAsync(clubId, user.Id);
        if (member is null) return Forbid();

        var status = await readingStatusService.GetAsync(meetingId, user.Id);
        return Ok(new
        {
            HasBook = status?.HasBook ?? false,
            HasStarted = status?.HasStarted ?? false,
        });
    }

    [HttpPatch("{meetingId}/reading-status")]
    public async Task<IActionResult> UpdateReadingStatus(Guid clubId, Guid meetingId, [FromBody] UpdateReadingStatusRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return Unauthorized();

        var member = await clubService.GetMemberAsync(clubId, user.Id);
        if (member is null) return Forbid();

        var status = await readingStatusService.UpsertAsync(meetingId, user.Id, request.HasBook, request.HasStarted);
        return Ok(new { status.HasBook, status.HasStarted });
    }

    private async Task<User?> GetCurrentUserAsync()
    {
        var auth0Id = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub");
        if (auth0Id is null) return null;
        return await userService.GetByAuth0IdAsync(auth0Id);
    }
}
