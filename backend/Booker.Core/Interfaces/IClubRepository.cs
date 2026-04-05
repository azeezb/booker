namespace Booker.Core.Interfaces;

public interface IClubRepository
{
    Task<List<Club>> GetPublicClubsAsync();
    Task<List<Club>> GetUserClubsAsync(Guid userId);
    Task<Club?> GetByIdAsync(Guid id);
    Task<Club> CreateAsync(Club club);
    Task<bool> IsMemberAsync(Guid clubId, Guid userId);
    Task AddMemberAsync(ClubMember member);
}
