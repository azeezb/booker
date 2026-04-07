namespace Booker.Core.Entities;

public class Meeting
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid? BookId { get; set; }
    public DateTime ScheduledDate { get; set; }
    public Guid AddedByUserId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Club Club { get; set; } = null!;
    public Book? Book { get; set; }
    public User AddedBy { get; set; } = null!;
}
