namespace Booker.Core.Interfaces;

public interface IUserService
{
    Task<User> GetOrCreateUserAsync(string auth0Id, string email, string name);
    Task<User?> GetByAuth0IdAsync(string auth0Id);
    Task<User?> UpdateUserAsync(string auth0Id, string name);
    Task<bool> DeleteUserAsync(string auth0Id);
}
