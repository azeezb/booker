namespace Booker.Infrastructure.Repositories;

public class UserRepository(BookerDbContext db) : IUserRepository
{
    public async Task<User?> GetByAuth0IdAsync(string auth0Id)
        => await db.Users.FirstOrDefaultAsync(u => u.Auth0Id == auth0Id);

    public async Task<User?> GetByEmailAsync(string email)
        => await db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User> CreateAsync(User user)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        db.Users.Update(user);
        await db.SaveChangesAsync();
        return user;
    }

    public async Task DeleteAsync(Guid userId)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is not null)
        {
            db.Users.Remove(user);
            await db.SaveChangesAsync();
        }
    }
}
