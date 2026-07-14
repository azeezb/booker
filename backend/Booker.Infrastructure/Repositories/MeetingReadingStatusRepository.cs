namespace Booker.Infrastructure.Repositories;

public class MeetingReadingStatusRepository(BookerDbContext db) : IMeetingReadingStatusRepository
{
    public async Task<MeetingReadingStatus?> GetAsync(Guid meetingId, Guid userId)
        => await db.MeetingReadingStatuses
            .FirstOrDefaultAsync(s => s.MeetingId == meetingId && s.UserId == userId);

    public async Task<MeetingReadingStatus> UpsertAsync(Guid meetingId, Guid userId, bool hasBook, bool hasStarted)
    {
        var existing = await GetAsync(meetingId, userId);
        if (existing is not null)
        {
            existing.HasBook = hasBook;
            existing.HasStarted = hasStarted;
            existing.UpdatedAt = DateTime.UtcNow;
            db.MeetingReadingStatuses.Update(existing);
            await db.SaveChangesAsync();
            return existing;
        }

        var status = new MeetingReadingStatus
        {
            Id = Guid.NewGuid(),
            MeetingId = meetingId,
            UserId = userId,
            HasBook = hasBook,
            HasStarted = hasStarted,
            UpdatedAt = DateTime.UtcNow
        };

        db.MeetingReadingStatuses.Add(status);
        await db.SaveChangesAsync();
        return status;
    }
}
