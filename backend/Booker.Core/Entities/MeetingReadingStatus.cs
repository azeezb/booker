namespace Booker.Core.Entities;

public class MeetingReadingStatus
{
    public Guid Id { get; set; }
    public Guid MeetingId { get; set; }
    public Guid UserId { get; set; }
    public bool HasBook { get; set; }
    public bool HasStarted { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Meeting Meeting { get; set; } = null!;
    public User User { get; set; } = null!;
}
