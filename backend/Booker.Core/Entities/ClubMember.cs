namespace Booker.Core.Entities;

public class ClubMember
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid UserId { get; set; }
    public MemberRole Role { get; set; }
    public DateTime JoinedAt { get; set; }

    // Navigation properties
    public Club Club { get; set; } = null!;
    public User User { get; set; } = null!;
}
