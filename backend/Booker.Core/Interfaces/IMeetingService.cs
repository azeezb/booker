namespace Booker.Core.Interfaces;

public interface IMeetingService
{
    Task<List<Meeting>> GetByClubIdAsync(Guid clubId);
    Task<Meeting?> GetNextForUserAsync(Guid userId);
    Task<Meeting> CreateAsync(Guid clubId, Guid addedByUserId, DateTime scheduledDate, string? notes);
    Task<Meeting?> UpdateAsync(Guid meetingId, DateTime? scheduledDate, Guid? bookId, string? notes);
}
