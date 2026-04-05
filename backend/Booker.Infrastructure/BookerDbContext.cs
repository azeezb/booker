namespace Booker.Infrastructure;

public class BookerDbContext(DbContextOptions<BookerDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Club> Clubs => Set<Club>();
    public DbSet<ClubMember> ClubMembers => Set<ClubMember>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<ClubBook> ClubBooks => Set<ClubBook>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Auth0Id).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Club>(e =>
        {
            e.HasKey(c => c.Id);
        });

        modelBuilder.Entity<ClubMember>(e =>
        {
            e.HasKey(cm => cm.Id);
            e.HasIndex(cm => new { cm.ClubId, cm.UserId }).IsUnique();
            e.HasOne(cm => cm.Club).WithMany().HasForeignKey(cm => cm.ClubId);
            e.HasOne(cm => cm.User).WithMany().HasForeignKey(cm => cm.UserId);
        });

        modelBuilder.Entity<Book>(e =>
        {
            e.HasKey(b => b.Id);
            e.HasIndex(b => b.Isbn).IsUnique();
        });

        modelBuilder.Entity<ClubBook>(e =>
        {
            e.HasKey(cb => cb.Id);
            e.HasOne(cb => cb.Club).WithMany().HasForeignKey(cb => cb.ClubId);
            e.HasOne(cb => cb.Book).WithMany().HasForeignKey(cb => cb.BookId);
        });
    }
}
