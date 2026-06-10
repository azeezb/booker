namespace Booker.Core.Interfaces;

public record BookSearchResult(
    string GoogleBookId,
    string Title,
    string Author,
    string? CoverUrl,
    string? Isbn,
    int? Pages
);

public interface IBookSearchService
{
    Task<List<BookSearchResult>> SearchAsync(string query);
}
