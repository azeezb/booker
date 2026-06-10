using System.Text.Json;

namespace Booker.Infrastructure.Services;

public class GoogleBooksService(HttpClient httpClient, IConfiguration configuration) : IBookSearchService
{
    public async Task<List<BookSearchResult>> SearchAsync(string query)
    {
        var apiKey = configuration["GoogleBooks:ApiKey"];
        var url = $"https://www.googleapis.com/books/v1/volumes?q={Uri.EscapeDataString(query)}&maxResults=10&key={apiKey}";

        var response = await httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);

        if (!doc.RootElement.TryGetProperty("items", out var items))
            return [];

        var results = new List<BookSearchResult>();

        foreach (var item in items.EnumerateArray())
        {
            var googleBookId = item.GetProperty("id").GetString() ?? string.Empty;
            var info = item.GetProperty("volumeInfo");

            var title = info.TryGetProperty("title", out var t) ? t.GetString() ?? "Unknown" : "Unknown";

            var author = info.TryGetProperty("authors", out var authors) && authors.GetArrayLength() > 0
                ? authors[0].GetString() ?? "Unknown"
                : "Unknown";

            string? coverUrl = null;
            if (info.TryGetProperty("imageLinks", out var images) &&
                images.TryGetProperty("thumbnail", out var thumb))
                coverUrl = thumb.GetString()?.Replace("http://", "https://");

            string? isbn = null;
            if (info.TryGetProperty("industryIdentifiers", out var identifiers))
            {
                foreach (var id in identifiers.EnumerateArray())
                {
                    if (id.TryGetProperty("type", out var type) && type.GetString() == "ISBN_13")
                    {
                        isbn = id.GetProperty("identifier").GetString();
                        break;
                    }
                }
            }

            int? pages = null;
            if (info.TryGetProperty("pageCount", out var pageCount) && pageCount.ValueKind == JsonValueKind.Number)
                pages = pageCount.GetInt32();

            results.Add(new BookSearchResult(googleBookId, title, author, coverUrl, isbn, pages));
        }

        return results;
    }
}
