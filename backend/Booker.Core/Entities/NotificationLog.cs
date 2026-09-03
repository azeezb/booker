namespace Booker.Core.Entities;

public class NotificationLog
{
    public Guid Id { get; set; }
    public Guid MeetingId { get; set; }
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public DateTime SentAt { get; set; }

    // Navigation properties
    public Meeting Meeting { get; set; } = null!;
    public User User { get; set; } = null!;
}
