namespace Booker.Infrastructure;

public class BookerDbContext(DbContextOptions<BookerDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Club> Clubs => Set<Club>();
    public DbSet<ClubMember> ClubMembers => Set<ClubMember>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<MeetingReadingStatus> MeetingReadingStatuses => Set<MeetingReadingStatus>();

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
            e.Property(cm => cm.Role)
             .HasConversion(
                 v => v.ToString().ToLower(),
                 v => Enum.Parse<MemberRole>(v, ignoreCase: true))
             .HasMaxLength(10);
            e.HasOne(cm => cm.Club).WithMany().HasForeignKey(cm => cm.ClubId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(cm => cm.User).WithMany().HasForeignKey(cm => cm.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Book>(e =>
        {
            e.HasKey(b => b.Id);
            e.HasIndex(b => b.GoogleBookId).IsUnique();
            e.HasIndex(b => b.Isbn).IsUnique().HasFilter("\"Isbn\" IS NOT NULL");
        });

        modelBuilder.Entity<Meeting>(e =>
        {
            e.HasKey(m => m.Id);
            e.HasIndex(m => m.ClubId);
            e.HasIndex(m => m.ScheduledDate);
            e.HasOne(m => m.Club).WithMany().HasForeignKey(m => m.ClubId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.Book).WithMany().HasForeignKey(m => m.BookId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(m => m.AddedBy).WithMany().HasForeignKey(m => m.AddedByUserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<MeetingReadingStatus>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasIndex(s => new { s.MeetingId, s.UserId }).IsUnique();
            e.HasOne(s => s.Meeting).WithMany().HasForeignKey(s => s.MeetingId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.User).WithMany().HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
