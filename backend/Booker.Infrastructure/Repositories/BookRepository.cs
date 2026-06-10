namespace Booker.Infrastructure.Repositories;

public class BookRepository(BookerDbContext db) : IBookRepository
{
    public async Task<Book?> GetByGoogleBookIdAsync(string googleBookId)
        => await db.Books.FirstOrDefaultAsync(b => b.GoogleBookId == googleBookId);

    public async Task<Book> CreateAsync(Book book)
    {
        db.Books.Add(book);
        await db.SaveChangesAsync();
        return book;
    }
}
