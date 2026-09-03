using Microsoft.Extensions.Logging;

namespace Booker.Infrastructure.Services;

public class NotificationService(
    IMeetingRepository meetingRepository,
    IMeetingReadingStatusRepository readingStatusRepository,
    IClubRepository clubRepository,
    INotificationRepository notificationRepository,
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<NotificationService> logger) : INotificationService
{
    public async Task RunGetBookRemindersAsync()
    {
        var daysBefore = configuration.GetValue("Notifications:DaysBeforeMeeting", 7);
        var appUrl = configuration["App:BaseUrl"] ?? string.Empty;
        var meetings = await meetingRepository.GetOnDateAsync(DateTime.UtcNow.AddDays(daysBefore));

        foreach (var meeting in meetings.Where(m => m.BookId is not null))
        {
            var members = await clubRepository.GetMembersAsync(meeting.ClubId);
            var statuses = await readingStatusRepository.GetByMeetingIdAsync(meeting.Id);
            var hasBookUserIds = statuses.Where(s => s.HasBook).Select(s => s.UserId).ToHashSet();

            foreach (var member in members.Where(m => !hasBookUserIds.Contains(m.UserId)))
            {
                if (await notificationRepository.ExistsAsync(meeting.Id, member.UserId, NotificationType.GetBookReminder))
                    continue;

                var html = EmailTemplates.GetBookReminderEmail(
                    member.User.Name, meeting.Club.Name, meeting.Book!.Title, meeting.Book.Author, meeting.ScheduledDate, appUrl);

                try
                {
                    await emailService.SendAsync(member.User.Email, member.User.Name, $"Get your book for {meeting.Club.Name}", html);
                    await notificationRepository.LogAsync(meeting.Id, member.UserId, NotificationType.GetBookReminder);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to send get-book reminder for meeting {MeetingId} to user {UserId}", meeting.Id, member.UserId);
                }
            }
        }
    }

    public async Task RunSetNextBookNudgeAsync()
    {
        var daysAfter = configuration.GetValue("Notifications:DaysAfterMeeting", 7);
        var appUrl = configuration["App:BaseUrl"] ?? string.Empty;
        var pastMeetings = await meetingRepository.GetOnDateAsync(DateTime.UtcNow.AddDays(-daysAfter));

        foreach (var pastMeeting in pastMeetings)
        {
            var nextMeeting = await meetingRepository.GetNextAfterAsync(pastMeeting.ClubId, pastMeeting.ScheduledDate);
            if (nextMeeting is null || nextMeeting.BookId is not null)
                continue;

            var members = await clubRepository.GetMembersAsync(pastMeeting.ClubId);
            var owner = members.FirstOrDefault(m => m.Role == MemberRole.Owner);
            if (owner is null)
                continue;

            if (await notificationRepository.ExistsAsync(pastMeeting.Id, owner.UserId, NotificationType.SetNextBookNudge))
                continue;

            var html = EmailTemplates.SetNextBookNudgeEmail(owner.User.Name, pastMeeting.Club.Name, pastMeeting.ScheduledDate, appUrl);

            try
            {
                await emailService.SendAsync(owner.User.Email, owner.User.Name, $"Pick the next book for {pastMeeting.Club.Name}", html);
                await notificationRepository.LogAsync(pastMeeting.Id, owner.UserId, NotificationType.SetNextBookNudge);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send set-next-book nudge for meeting {MeetingId} to user {UserId}", pastMeeting.Id, owner.UserId);
            }
        }
    }
}
