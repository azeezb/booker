namespace Booker.Infrastructure;

public class BookerDbContext(DbContextOptions<BookerDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Club> Clubs => Set<Club>();
    public DbSet<ClubMember> ClubMembers => Set<ClubMember>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Meeting> Meetings => Set<Meeting>();

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
            e.Property(c => c.MeetingFrequency)
             .HasConversion<string>()
             .HasMaxLength(20);
        });

        modelBuilder.Entity<ClubMember>(e =>
        {
            e.HasKey(cm => cm.Id);
            e.HasIndex(cm => new { cm.ClubId, cm.UserId }).IsUnique();
            e.HasOne(cm => cm.Club).WithMany().HasForeignKey(cm => cm.ClubId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(cm => cm.User).WithMany().HasForeignKey(cm => cm.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Book>(e =>
        {
            e.HasKey(b => b.Id);
            e.HasIndex(b => b.Isbn).IsUnique();
        });

        modelBuilder.Entity<Meeting>(e =>
        {
            e.HasKey(m => m.Id);
            e.HasOne(m => m.Club).WithMany().HasForeignKey(m => m.ClubId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.Book).WithMany().HasForeignKey(m => m.BookId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(m => m.AddedBy).WithMany().HasForeignKey(m => m.AddedByUserId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
