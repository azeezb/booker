namespace Booker.Infrastructure.Repositories;

public class MeetingRepository(BookerDbContext db) : IMeetingRepository
{
    public async Task<List<Meeting>> GetByClubIdAsync(Guid clubId)
        => await db.Meetings
            .Where(m => m.ClubId == clubId)
            .Include(m => m.Book)
            .Include(m => m.AddedBy)
            .OrderByDescending(m => m.ScheduledDate)
            .ToListAsync();

    public async Task<Meeting?> GetByIdAsync(Guid id)
        => await db.Meetings
            .Include(m => m.Book)
            .Include(m => m.AddedBy)
            .FirstOrDefaultAsync(m => m.Id == id);

    public async Task<Meeting> CreateAsync(Meeting meeting)
    {
        db.Meetings.Add(meeting);
        await db.SaveChangesAsync();
        return meeting;
    }

    public async Task<Meeting> UpdateAsync(Meeting meeting)
    {
        db.Meetings.Update(meeting);
        await db.SaveChangesAsync();
        return meeting;
    }
}
