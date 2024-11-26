namespace server.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public required string Text { get; set; }
        public required bool Completed { get; set; }
        public required string Status { get; set; }
        public required string Date { get; set; }
        public required string Description { get; set; }
        public required string Category { get; set; }
    }
}

