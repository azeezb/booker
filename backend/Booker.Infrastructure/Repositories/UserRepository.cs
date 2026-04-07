namespace Booker.Infrastructure.Repositories;

public class UserRepository(BookerDbContext db) : IUserRepository
{
    public async Task<User?> GetByAuth0IdAsync(string auth0Id)
        => await db.Users.FirstOrDefaultAsync(u => u.Auth0Id == auth0Id);

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
}
