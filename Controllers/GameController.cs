using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace ECommerceGameSite.Controllers
{
    public class GameController : Controller
    {
        public IActionResult Index()
        {
            List<string> games = new List<string> { "X", "Y", "Z" }; // Oyunlar listesi
            return View(games); // Listeyi Index View'a gönderiyoruz
        }

        public IActionResult Start(string gameName)
        {
            if (gameName == "X")
            {
                // X oyunu için özel oyun başlatma işlemi
                return View("StartX"); // X oyunu için özel StartX view'ını yükle
            }
            else if (gameName == "Y")
            {
                // Y oyunu için özel oyun başlatma işlemi
                return View("StartY"); // Y oyunu için özel StartY view'ını yükle
            }
            else if (gameName == "Z")
            {
                // Z oyunu için özel oyun başlatma işlemi
                return View("StartZ"); // Z oyunu için özel StartZ view'ını yükle
            }

            return NotFound(); // Eğer oyun bulunamazsa 404 döndür
        }
    }
}
