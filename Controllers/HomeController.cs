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
                new Product { Id = 1, Name = "Red Bull", Description = "Enerji İçeceği", ImageUrl = "/images/redbull.jpg", Price = 35.0M }
            };

            return View(products);
        }
    }
}
