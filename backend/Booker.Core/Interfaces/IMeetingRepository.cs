namespace Booker.Core.Interfaces;

public interface IMeetingRepository
{
    Task<List<Meeting>> GetByClubIdAsync(Guid clubId);
    Task<Meeting?> GetByIdAsync(Guid id);
    Task<Meeting?> GetNextForUserAsync(Guid userId);
    Task<Meeting> CreateAsync(Meeting meeting);
    Task<Meeting> UpdateAsync(Meeting meeting);
}
