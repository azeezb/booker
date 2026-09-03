namespace Booker.API.Services;

public class NotificationBackgroundService(IServiceScopeFactory scopeFactory, IConfiguration configuration, ILogger<NotificationBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var pollMinutes = configuration.GetValue("Notifications:PollIntervalMinutes", 60);
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(pollMinutes));

        do
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                await notificationService.RunGetBookRemindersAsync();
                await notificationService.RunSetNextBookNudgeAsync();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Notification poll failed");
            }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
