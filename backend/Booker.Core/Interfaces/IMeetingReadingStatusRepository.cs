namespace Booker.Core.Interfaces;

public interface IMeetingReadingStatusRepository
{
    Task<MeetingReadingStatus?> GetAsync(Guid meetingId, Guid userId);
    Task<List<MeetingReadingStatus>> GetByMeetingIdAsync(Guid meetingId);
    Task<MeetingReadingStatus> UpsertAsync(Guid meetingId, Guid userId, bool hasBook, bool hasStarted);
}
