namespace Booker.Core.Entities;

public class ClubBook
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid BookId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? MeetingDate { get; set; }

    // Navigation properties
    public Club Club { get; set; } = null!;
    public Book Book { get; set; } = null!;
}
