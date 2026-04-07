namespace Booker.Core.Interfaces;

public interface IClubRepository
{
    Task<List<Club>> GetPublicClubsAsync();
    Task<List<Club>> GetUserClubsAsync(Guid userId);
    Task<Club?> GetByIdAsync(Guid id);
    Task<Club> CreateAsync(Club club);
    Task<Club> UpdateAsync(Club club);
    Task<bool> IsMemberAsync(Guid clubId, Guid userId);
    Task<ClubMember?> GetMemberAsync(Guid clubId, Guid userId);
    Task<List<ClubMember>> GetMembersAsync(Guid clubId);
    Task AddMemberAsync(ClubMember member);
}
