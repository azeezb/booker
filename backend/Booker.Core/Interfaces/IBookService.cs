namespace Booker.Core.Interfaces;

public interface IBookService
{
    Task<Book> UpsertAsync(string googleBookId, string? isbn, string title, string author, int? pages, string? coverUrl);
}
