namespace Booker.Core.Interfaces;

public interface IMeetingReadingStatusService
{
    Task<MeetingReadingStatus?> GetAsync(Guid meetingId, Guid userId);
    Task<MeetingReadingStatus> UpsertAsync(Guid meetingId, Guid userId, bool hasBook, bool hasStarted);
}
