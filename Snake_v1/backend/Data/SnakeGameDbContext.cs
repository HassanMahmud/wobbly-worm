using Microsoft.EntityFrameworkCore;
using SnakeGame.Models;

namespace SnakeGame.Data;

public class SnakeGameDbContext : DbContext
{
    public SnakeGameDbContext(DbContextOptions<SnakeGameDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Score> Scores { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.HasIndex(e => e.Username).IsUnique();
        });

        modelBuilder.Entity<Score>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Points).IsRequired();
            entity.Property(e => e.FoodCount).IsRequired();
            entity.Property(e => e.GameTime).IsRequired();
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Scores)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
