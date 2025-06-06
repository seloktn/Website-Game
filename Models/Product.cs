namespace ECommerceGameSite.Models
{
    public class Product
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public bool IsRecommended { get; set; } = false; // Varsayılan olarak false
    }
}
