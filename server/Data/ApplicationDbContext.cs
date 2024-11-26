using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using server.Models;

namespace server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public required DbSet<TaskItem> Tasks { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    }
}
