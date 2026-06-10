namespace Booker.Infrastructure.Services;

public class BookService(IBookRepository bookRepository) : IBookService
{
    public async Task<Book> UpsertAsync(string googleBookId, string? isbn, string title, string author, int? pages, string? coverUrl)
    {
        var existing = await bookRepository.GetByGoogleBookIdAsync(googleBookId);
        if (existing is not null) return existing;

        return await bookRepository.CreateAsync(new Book
        {
            Id = Guid.NewGuid(),
            GoogleBookId = googleBookId,
            Isbn = isbn,
            Title = title,
            Author = author,
            Pages = pages,
            CoverUrl = coverUrl
        });
    }
}
