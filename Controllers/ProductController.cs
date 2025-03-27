using Microsoft.AspNetCore.Mvc;
using ECommerceGameSite.Models; // Modeli eklemeyi unutma

namespace ECommerceGameSite.Controllers
{
    public class ProductController : Controller
    {
        public IActionResult Index()
        {
            var products = new List<Product>
            {
                new Product { Id = 1, Name = "Red Bull", Description = "Enerji İçeceği", ImageUrl = "/images/redbull.jpg", Price = 35.0M }
            };

            return View(products);
        }
    }
}
