namespace Booker.Core.Entities;

public class Book
{
    public Guid Id { get; set; }
    public string GoogleBookId { get; set; } = string.Empty;
    public string? Isbn { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public int? Pages { get; set; }
    public string? CoverUrl { get; set; }
}
