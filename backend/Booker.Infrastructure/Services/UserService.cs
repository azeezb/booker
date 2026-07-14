namespace Booker.Infrastructure.Services;

public class UserService(IUserRepository userRepository) : IUserService
{
    public async Task<User> GetOrCreateUserAsync(string auth0Id, string email, string name)
    {
        var user = await userRepository.GetByAuth0IdAsync(auth0Id);

        if (user is not null)
            return user;

        user = new User
        {
            Id = Guid.NewGuid(),
            Auth0Id = auth0Id,
            Email = email,
            Name = name,
            CreatedAt = DateTime.UtcNow
        };

        return await userRepository.CreateAsync(user);
    }

    public async Task<User?> GetByAuth0IdAsync(string auth0Id)
        => await userRepository.GetByAuth0IdAsync(auth0Id);

    public async Task<User?> UpdateUserAsync(string auth0Id, string name)
    {
        var user = await userRepository.GetByAuth0IdAsync(auth0Id);
        if (user is null) return null;
        user.Name = name;
        return await userRepository.UpdateAsync(user);
    }

    public async Task<bool> DeleteUserAsync(string auth0Id)
    {
        var user = await userRepository.GetByAuth0IdAsync(auth0Id);
        if (user is null) return false;
        await userRepository.DeleteAsync(user.Id);
        return true;
    }
}
