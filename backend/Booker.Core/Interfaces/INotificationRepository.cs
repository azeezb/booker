namespace Booker.Core.Interfaces;

public interface INotificationRepository
{
    Task<bool> ExistsAsync(Guid meetingId, Guid userId, NotificationType type);
    Task LogAsync(Guid meetingId, Guid userId, NotificationType type);
}
