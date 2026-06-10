namespace Booker.Infrastructure.Services;

public class MeetingService(IMeetingRepository meetingRepository) : IMeetingService
{
    public async Task<List<Meeting>> GetByClubIdAsync(Guid clubId)
        => await meetingRepository.GetByClubIdAsync(clubId);

    public async Task<Meeting?> GetNextForUserAsync(Guid userId)
        => await meetingRepository.GetNextForUserAsync(userId);

    public async Task<Meeting> CreateAsync(Guid clubId, Guid addedByUserId, DateTime scheduledDate, string? notes)
    {
        var meeting = new Meeting
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            AddedByUserId = addedByUserId,
            ScheduledDate = scheduledDate,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };

        return await meetingRepository.CreateAsync(meeting);
    }

    public async Task<Meeting?> UpdateAsync(Guid meetingId, DateTime? scheduledDate, Guid? bookId, string? notes)
    {
        var meeting = await meetingRepository.GetByIdAsync(meetingId);
        if (meeting is null) return null;

        if (scheduledDate.HasValue) meeting.ScheduledDate = scheduledDate.Value;
        if (bookId.HasValue) meeting.BookId = bookId.Value;
        if (notes is not null) meeting.Notes = notes;

        return await meetingRepository.UpdateAsync(meeting);
    }
}
