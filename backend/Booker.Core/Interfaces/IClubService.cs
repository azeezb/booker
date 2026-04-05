namespace Booker.Core.Interfaces;

public interface IClubService
{
    Task<List<Club>> GetPublicClubsAsync();
    Task<List<Club>> GetUserClubsAsync(Guid userId);
    Task<Club?> GetByIdAsync(Guid id);
    Task<Club> CreateClubAsync(Guid userId, string name, string description, bool isPublic);
    Task<bool> JoinClubAsync(Guid clubId, Guid userId);
}
