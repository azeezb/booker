namespace Booker.Core.Entities;

public class Club
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CreatedBy { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }
    public MeetingFrequency? MeetingFrequency { get; set; }
}
