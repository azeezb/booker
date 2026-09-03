namespace Booker.Infrastructure.Repositories;

public class NotificationRepository(BookerDbContext db) : INotificationRepository
{
    public async Task<bool> ExistsAsync(Guid meetingId, Guid userId, NotificationType type)
        => await db.NotificationLogs
            .AnyAsync(n => n.MeetingId == meetingId && n.UserId == userId && n.Type == type);

    public async Task LogAsync(Guid meetingId, Guid userId, NotificationType type)
    {
        db.NotificationLogs.Add(new NotificationLog
        {
            Id = Guid.NewGuid(),
            MeetingId = meetingId,
            UserId = userId,
            Type = type,
            SentAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
    }
}
