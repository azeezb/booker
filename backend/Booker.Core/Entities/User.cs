namespace Booker.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Auth0Id { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
