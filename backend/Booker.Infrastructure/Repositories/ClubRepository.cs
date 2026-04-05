using Booker.Core.Interfaces;

namespace Booker.Infrastructure.Repositories;

public class ClubRepository(BookerDbContext db) : IClubRepository
{
    public async Task<List<Club>> GetPublicClubsAsync()
        => await db.Clubs.Where(c => c.IsPublic).ToListAsync();

    public async Task<List<Club>> GetUserClubsAsync(Guid userId)
        => await db.ClubMembers
            .Where(cm => cm.UserId == userId)
            .Select(cm => cm.Club)
            .ToListAsync();

    public async Task<Club?> GetByIdAsync(Guid id)
        => await db.Clubs.FirstOrDefaultAsync(c => c.Id == id);

    public async Task<Club> CreateAsync(Club club)
    {
        db.Clubs.Add(club);
        await db.SaveChangesAsync();
        return club;
    }

    public async Task<bool> IsMemberAsync(Guid clubId, Guid userId)
        => await db.ClubMembers.AnyAsync(cm => cm.ClubId == clubId && cm.UserId == userId);

    public async Task AddMemberAsync(ClubMember member)
    {
        db.ClubMembers.Add(member);
        await db.SaveChangesAsync();
    }
}
