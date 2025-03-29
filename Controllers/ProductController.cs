using Microsoft.AspNetCore.Mvc;
using ECommerceGameSite.Models;

namespace ECommerceGameSite.Controllers
{
    public class ProductController : Controller
    {
        public IActionResult Index()
        {
            var products = new List<Product>
            {
                new Product { Id = 1, Name = "Red Bull", Description = "Enerji İçeceği", ImageUrl = "/images/redbull.jpg", Price = 35.0M },
                new Product { Id = 2, Name = "Coca Cola", Description = "Soğuk İçecek", ImageUrl = "/images/cocacola.jpg", Price = 30.0M, IsRecommended = true }
            };

            return View(products);
        }

        public IActionResult Detail(int id)
        {
            // Detaylı ürün bilgisi burada alınabilir
            var product = new Product { Id = id, Name = "Red Bull", Description = "Enerji İçeceği", ImageUrl = "/images/redbull.jpg", Price = 35.0M };
            return View(product);
        }
    }
}
