namespace Booker.Core.Interfaces;

public interface IBookRepository
{
    Task<Book?> GetByGoogleBookIdAsync(string googleBookId);
    Task<Book> CreateAsync(Book book);
}
