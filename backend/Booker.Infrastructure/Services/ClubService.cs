namespace Booker.Infrastructure.Services;

public class ClubService(IClubRepository clubRepository) : IClubService
{
    public async Task<List<Club>> GetPublicClubsAsync()
        => await clubRepository.GetPublicClubsAsync();

    public async Task<List<Club>> GetUserClubsAsync(Guid userId)
        => await clubRepository.GetUserClubsAsync(userId);

    public async Task<Club?> GetByIdAsync(Guid id)
        => await clubRepository.GetByIdAsync(id);

    public async Task<List<ClubMember>> GetMembersAsync(Guid clubId)
        => await clubRepository.GetMembersAsync(clubId);

    public async Task<ClubMember?> GetMemberAsync(Guid clubId, Guid userId)
        => await clubRepository.GetMemberAsync(clubId, userId);

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

    public async Task<Club?> UpdateFrequencyAsync(Guid clubId, MeetingFrequency? frequency)
    {
        var club = await clubRepository.GetByIdAsync(clubId);
        if (club is null) return null;
        club.MeetingFrequency = frequency;
        return await clubRepository.UpdateAsync(club);
    }

    public async Task<Club?> UpdateClubAsync(Guid clubId, string name, string description)
    {
        var club = await clubRepository.GetByIdAsync(clubId);
        if (club is null) return null;
        club.Name = name;
        club.Description = description;
        return await clubRepository.UpdateAsync(club);
    }

    public async Task<bool> LeaveClubAsync(Guid clubId, Guid userId)
    {
        var member = await clubRepository.GetMemberAsync(clubId, userId);
        if (member is null) return false;

        if (member.Role == "owner")
        {
            var allMembers = await clubRepository.GetMembersAsync(clubId);
            if (allMembers.Count == 1)
            {
                await clubRepository.DeleteAsync(clubId);
                return true;
            }
            var nextOwner = allMembers.First(m => m.UserId != userId);
            nextOwner.Role = "owner";
            await clubRepository.UpdateMemberAsync(nextOwner);
        }

        await clubRepository.RemoveMemberAsync(clubId, userId);
        return true;
    }

    public async Task<bool> RemoveMemberAsync(Guid clubId, Guid requesterId, Guid targetUserId)
    {
        var requester = await clubRepository.GetMemberAsync(clubId, requesterId);
        if (requester is null || requester.Role != "owner") return false;
        if (requesterId == targetUserId) return false;

        var target = await clubRepository.GetMemberAsync(clubId, targetUserId);
        if (target is null) return false;

        await clubRepository.RemoveMemberAsync(clubId, targetUserId);
        return true;
    }
}
