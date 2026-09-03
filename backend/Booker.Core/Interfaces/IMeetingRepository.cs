namespace Booker.Core.Interfaces;

public interface IMeetingRepository
{
    Task<List<Meeting>> GetByClubIdAsync(Guid clubId);
    Task<Meeting?> GetByIdAsync(Guid id);
    Task<Meeting?> GetNextForUserAsync(Guid userId);
    Task<List<Meeting>> GetOnDateAsync(DateTime utcDate);
    Task<Meeting?> GetNextAfterAsync(Guid clubId, DateTime afterDate);
    Task<Meeting> CreateAsync(Meeting meeting);
    Task<Meeting> UpdateAsync(Meeting meeting);
}
