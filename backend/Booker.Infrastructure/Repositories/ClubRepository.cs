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

    public async Task<Club> UpdateAsync(Club club)
    {
        db.Clubs.Update(club);
        await db.SaveChangesAsync();
        return club;
    }

    public async Task<bool> IsMemberAsync(Guid clubId, Guid userId)
        => await db.ClubMembers.AnyAsync(cm => cm.ClubId == clubId && cm.UserId == userId);

    public async Task<ClubMember?> GetMemberAsync(Guid clubId, Guid userId)
        => await db.ClubMembers
            .Include(cm => cm.User)
            .FirstOrDefaultAsync(cm => cm.ClubId == clubId && cm.UserId == userId);

    public async Task<List<ClubMember>> GetMembersAsync(Guid clubId)
        => await db.ClubMembers
            .Where(cm => cm.ClubId == clubId)
            .Include(cm => cm.User)
            .OrderBy(cm => cm.JoinedAt)
            .ToListAsync();

    public async Task AddMemberAsync(ClubMember member)
    {
        db.ClubMembers.Add(member);
        await db.SaveChangesAsync();
    }
}
