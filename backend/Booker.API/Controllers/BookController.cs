namespace Booker.API.Controllers;

public record UpsertBookRequest(
    string GoogleBookId,
    string? Isbn,
    string Title,
    string Author,
    int? Pages,
    string? CoverUrl
);

[ApiController]
[Route("api/book")]
public class BookController(IBookSearchService bookSearchService, IBookService bookService) : ControllerBase
{
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q)) return BadRequest("Query is required");
        var results = await bookSearchService.SearchAsync(q);
        return Ok(results);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> UpsertBook([FromBody] UpsertBookRequest request)
    {
        var book = await bookService.UpsertAsync(
            request.GoogleBookId,
            request.Isbn,
            request.Title,
            request.Author,
            request.Pages,
            request.CoverUrl
        );
        return Ok(book);
    }
}
