namespace Booker.Core.Entities;

public class ClubMember
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }

    // Navigation properties
    public Club Club { get; set; } = null!;
    public User User { get; set; } = null!;
}
