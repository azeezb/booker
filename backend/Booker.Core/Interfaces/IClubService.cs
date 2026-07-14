namespace Booker.Core.Interfaces;

public interface IClubService
{
    Task<List<Club>> GetPublicClubsAsync();
    Task<List<Club>> GetUserClubsAsync(Guid userId);
    Task<Club?> GetByIdAsync(Guid id);
    Task<Club> CreateClubAsync(Guid userId, string name, string description, bool isPublic);
    Task<bool> JoinClubAsync(Guid clubId, Guid userId);
    Task<List<ClubMember>> GetMembersAsync(Guid clubId);
    Task<ClubMember?> GetMemberAsync(Guid clubId, Guid userId);
    Task<Club?> UpdateFrequencyAsync(Guid clubId, MeetingFrequency? frequency);
    Task<Club?> UpdateClubAsync(Guid clubId, string name, string description);
    Task<bool> LeaveClubAsync(Guid clubId, Guid userId);
    Task<bool> RemoveMemberAsync(Guid clubId, Guid requesterId, Guid targetUserId);
}
