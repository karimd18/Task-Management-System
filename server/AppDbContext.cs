using Microsoft.EntityFrameworkCore;
using FinalProjectAPIs.Models;
using System.Reflection.Emit;

namespace FinalProjectAPIs
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opts)
            : base(opts)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Team> Teams => Set<Team>();
        public DbSet<Member> Members => Set<Member>();
        public DbSet<TaskEntity> Tasks => Set<TaskEntity>();
        public DbSet<Status> Statuses => Set<Status>();
        public DbSet<Invitation> Invitations => Set<Invitation>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Task → AssignedToUser
            builder.Entity<TaskEntity>()
                .HasOne(t => t.AssignedToUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedToUserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Task → Status
            builder.Entity<TaskEntity>()
                .HasOne(t => t.Status)
                .WithMany(s => s.Tasks)
                .HasForeignKey(t => t.StatusId)
                .OnDelete(DeleteBehavior.SetNull);

            // Task → Team
            builder.Entity<TaskEntity>()
                .HasOne(t => t.Team)
                .WithMany(team => team.Tasks)
                .HasForeignKey(t => t.TeamId)
                .OnDelete(DeleteBehavior.SetNull);

            // Team → CreatedByUser
            builder.Entity<Team>()
                .HasOne(t => t.CreatedByUser)
                .WithMany()
                .HasForeignKey(t => t.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);

            // Member → Team
            builder.Entity<Member>()
                .HasOne(m => m.Team)
                .WithMany(t => t.Members)
                .HasForeignKey(m => m.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // Member → User
            builder.Entity<Member>()
                .HasOne(m => m.User)
                .WithMany(u => u.Memberships)
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Invitation → Team
            builder.Entity<Invitation>()
                .HasOne(i => i.Team)
                .WithMany(t => t.Invitations)
                .HasForeignKey(i => i.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // Invitation → Inviter
            builder.Entity<Invitation>()
                .HasOne(i => i.Inviter)
                .WithMany(u => u.SentInvitations)
                .HasForeignKey(i => i.InviterId)
                .OnDelete(DeleteBehavior.Restrict);

            // Invitation → Invitee
            builder.Entity<Invitation>()
                .HasOne(i => i.Invitee)
                .WithMany(u => u.ReceivedInvitations)
                .HasForeignKey(i => i.InviteeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Status → Team
            builder.Entity<Status>()
                .HasOne(s => s.Team)
                .WithMany(t => t.Statuses)
                .HasForeignKey(s => s.TeamId)
                .OnDelete(DeleteBehavior.SetNull);

            // Status → CreatedByUser (New relationship)
            builder.Entity<Status>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(s => s.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}