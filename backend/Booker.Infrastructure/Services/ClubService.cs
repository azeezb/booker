using Booker.Core.Interfaces;

namespace Booker.Infrastructure.Services;

public class ClubService(IClubRepository clubRepository) : IClubService
{
    public async Task<List<Club>> GetPublicClubsAsync()
        => await clubRepository.GetPublicClubsAsync();

    public async Task<List<Club>> GetUserClubsAsync(Guid userId)
        => await clubRepository.GetUserClubsAsync(userId);

    public async Task<Club?> GetByIdAsync(Guid id)
        => await clubRepository.GetByIdAsync(id);

    public async Task<Club> CreateClubAsync(Guid userId, string name, string description, bool isPublic)
    {
        var club = new Club
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            CreatedBy = userId,
            IsPublic = isPublic,
            CreatedAt = DateTime.UtcNow
        };

        await clubRepository.CreateAsync(club);

        await clubRepository.AddMemberAsync(new ClubMember
        {
            Id = Guid.NewGuid(),
            ClubId = club.Id,
            UserId = userId,
            Role = "owner",
            JoinedAt = DateTime.UtcNow
        });

        return club;
    }

    public async Task<bool> JoinClubAsync(Guid clubId, Guid userId)
    {
        if (await clubRepository.IsMemberAsync(clubId, userId))
            return false;

        await clubRepository.AddMemberAsync(new ClubMember
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            UserId = userId,
            Role = "member",
            JoinedAt = DateTime.UtcNow
        });

        return true;
    }
}
