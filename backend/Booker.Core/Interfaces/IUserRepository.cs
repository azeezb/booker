namespace Booker.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByAuth0IdAsync(string auth0Id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(Guid userId);
}
