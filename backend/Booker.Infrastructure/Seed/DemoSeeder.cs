using Microsoft.Extensions.DependencyInjection;

namespace Booker.Infrastructure.Seed;

public static class DemoSeeder
{
    private static readonly (string Name, string Auth0Id, string Email)[] FakeMembers =
    [
        ("Priya Nair", "seed|priya-nair", "priya@demo.booker.app"),
        ("Marcus Chen", "seed|marcus-chen", "marcus@demo.booker.app"),
        ("Jordan Lee", "seed|jordan-lee", "jordan@demo.booker.app"),
    ];

    private static readonly string[] BookQueries =
    [
        "Klara and the Sun Kazuo Ishiguro",
        "Piranesi Susanna Clarke",
        "The Song of Achilles Madeline Miller",
        "Tomorrow and Tomorrow and Tomorrow Gabrielle Zevin",
    ];

    public static async Task SeedAsync(IServiceProvider services, string demoEmail)
    {
        var userRepository = services.GetRequiredService<IUserRepository>();
        var clubService = services.GetRequiredService<IClubService>();
        var meetingService = services.GetRequiredService<IMeetingService>();
        var bookService = services.GetRequiredService<IBookService>();
        var bookSearchService = services.GetRequiredService<IBookSearchService>();
        var readingStatusService = services.GetRequiredService<IMeetingReadingStatusService>();

        var demoUser = await userRepository.GetByEmailAsync(demoEmail);
        if (demoUser is null)
        {
            Console.WriteLine($"No user found with email '{demoEmail}'. Log into the app once with that account first, then re-run this command.");
            return;
        }

        if ((await clubService.GetUserClubsAsync(demoUser.Id)).Count > 0)
        {
            Console.WriteLine("Demo user already has clubs — already seeded, skipping.");
            return;
        }

        Console.WriteLine("Seeding demo data...");

        var fakeMemberIds = new List<Guid>();
        foreach (var (name, auth0Id, email) in FakeMembers)
        {
            var existing = await userRepository.GetByEmailAsync(email);
            if (existing is not null)
            {
                fakeMemberIds.Add(existing.Id);
                continue;
            }

            var created = await userRepository.CreateAsync(new User
            {
                Id = Guid.NewGuid(),
                Auth0Id = auth0Id,
                Email = email,
                Name = name,
                CreatedAt = DateTime.UtcNow
            });
            fakeMemberIds.Add(created.Id);
        }

        var club = await clubService.CreateClubAsync(
            demoUser.Id,
            "The Hearth Book Club",
            "A cozy gathering for people who love getting lost in a good story.",
            isPublic: true);

        await clubService.UpdateFrequencyAsync(club.Id, MeetingFrequency.Fortnightly);

        foreach (var fakeId in fakeMemberIds)
            await clubService.JoinClubAsync(club.Id, fakeId);

        var books = new List<Book>();
        foreach (var query in BookQueries)
        {
            try
            {
                var top = (await bookSearchService.SearchAsync(query)).FirstOrDefault();
                if (top is null)
                {
                    Console.WriteLine($"No search result for '{query}' — skipping.");
                    continue;
                }

                books.Add(await bookService.UpsertAsync(top.GoogleBookId, top.Isbn, top.Title, top.Author, top.Pages, top.CoverUrl));
            }
            catch (HttpRequestException)
            {
                Console.WriteLine($"Book search failed for '{query}' — skipping.");
            }
        }

        var demoId = demoUser.Id;
        var priyaId = fakeMemberIds[0];
        var marcusId = fakeMemberIds[1];
        var jordanId = fakeMemberIds[2];
        var now = DateTime.UtcNow.Date;

        // (days from today, book index or null, reading statuses as (userId, hasBook, hasStarted))
        var meetingPlans = new List<(int DaysOffset, int? BookIndex, (Guid UserId, bool HasBook, bool HasStarted)[] Statuses)>
        {
            (-35, 0, [(demoId, true, true), (priyaId, true, true), (marcusId, true, true), (jordanId, true, true)]),
            (-21, 1, [(demoId, true, true), (priyaId, true, true), (marcusId, false, false), (jordanId, true, true)]),
            (-7, 2, [(demoId, true, false), (priyaId, true, true), (marcusId, false, false), (jordanId, true, false)]),
            (5, 3, [(demoId, false, false), (priyaId, true, false), (marcusId, false, false), (jordanId, true, false)]),
            (30, null, []),
        };

        foreach (var (daysOffset, bookIndex, statuses) in meetingPlans)
        {
            var meeting = await meetingService.CreateAsync(club.Id, demoId, now.AddDays(daysOffset), null);

            if (bookIndex is int idx && idx < books.Count)
                await meetingService.UpdateAsync(meeting.Id, null, books[idx].Id, null);

            foreach (var (userId, hasBook, hasStarted) in statuses)
                await readingStatusService.UpsertAsync(meeting.Id, userId, hasBook, hasStarted);
        }

        Console.WriteLine("Demo data seeded.");
    }
}
