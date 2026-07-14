namespace Booker.Infrastructure.Services;

public class MeetingReadingStatusService(IMeetingReadingStatusRepository repository) : IMeetingReadingStatusService
{
    public Task<MeetingReadingStatus?> GetAsync(Guid meetingId, Guid userId)
        => repository.GetAsync(meetingId, userId);

    public Task<MeetingReadingStatus> UpsertAsync(Guid meetingId, Guid userId, bool hasBook, bool hasStarted)
        => repository.UpsertAsync(meetingId, userId, hasBook, hasStarted);
}
