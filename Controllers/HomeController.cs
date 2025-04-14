using Microsoft.AspNetCore.Mvc;
using ECommerceGameSite.Models;

namespace ECommerceGameSite.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            var products = new List<Product>
            {
                new Product { Id = 1, Name = "Red Bull", Description = "Enerji İçeceği", ImageUrl = "/images/redbull.jpg", Price = 35.0M },
                new Product { Id = 2, Name = "Coca Cola", Description = "Soğuk İçecek", ImageUrl = "/images/cocacola.png", Price = 30.0M, IsRecommended = true }
            };

            return View(products);
        }
       /* [HttpGet("api/product/recommendedImages")]
        public IActionResult GetRecommendedProductImages()
        {
        var products = new List<Product>
        {
        new Product { Id = 1, Name = "Red Bull", Description = "Enerji İçeceği", ImageUrl = "/images/redbull.jpg", Price = 35.0M },
        new Product { Id = 2, Name = "Coca Cola", Description = "Soğuk İçecek", ImageUrl = "/images/cocacola.png", Price = 30.0M, IsRecommended = true }
        };

        var recommendedImages = products.Where(p => p.IsRecommended).Select(p => p.ImageUrl).ToList();
        return Ok(recommendedImages);
        }*/
    }
    
    
}
