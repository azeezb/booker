namespace Booker.Core.Interfaces;

public interface INotificationService
{
    Task RunGetBookRemindersAsync();
    Task RunSetNextBookNudgeAsync();
}
