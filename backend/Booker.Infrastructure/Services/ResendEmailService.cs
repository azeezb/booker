using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Booker.Infrastructure.Services;

public class ResendEmailService(HttpClient httpClient, IConfiguration configuration) : IEmailService
{
    public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var apiKey = configuration["Resend:ApiKey"];
        var fromEmail = configuration["Resend:FromEmail"];

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Headers = { Authorization = new AuthenticationHeaderValue("Bearer", apiKey) },
            Content = JsonContent.Create(new
            {
                from = fromEmail,
                to = new[] { $"{toName} <{toEmail}>" },
                subject,
                html = htmlBody
            })
        };

        var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }
}
