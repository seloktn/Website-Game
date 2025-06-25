using Microsoft.AspNetCore.Mvc;
using System;
using ECommerceGameSite.Models;

namespace ECommerceGameSite.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameYController : ControllerBase
    {
        [HttpGet("rules")]
        public IActionResult GetGameRules()
        {
            var ip = NormalizeIp(HttpContext.Connection.RemoteIpAddress?.ToString());
            var sessionToken = TokenServiceY.GenerateToken(ip);

            var rules = new GameYRulesDto
            {
                SessionToken = sessionToken,
                
                DifficultyLevels = new[]
                {
                    new { score = 0, level = "easy" },
                    new { score = 20, level = "medium" },
                    new { score = 45, level = "hard" },
                    new { score = 70, level = "veryhard" },
                    new { score = 200, level = "final" }
                },
                DifficultyConfig = new
                {
                    easy = new { itemSpawn = 4000, bombSpawn = 2000, heartSpawn = 30000, iceSpawn = 4000 },
                    medium = new { itemSpawn = 3000, bombSpawn = 1500, heartSpawn = 30000, iceSpawn = 3500 },
                    hard = new { itemSpawn = 2000, bombSpawn = 1000, heartSpawn = 20000, iceSpawn = 3000 },
                    veryhard = new { itemSpawn = 2000, bombSpawn = 750, heartSpawn = 15000, iceSpawn = 2500 },
                    final = new { itemSpawn = 1000, bombSpawn = 500, heartSpawn = 10000, iceSpawn = 2000 }
                },
                FinalScoreTrigger = 200
            };

            return Ok(rules);
        }
        [HttpPost("validateState")]
        public IActionResult ValidateState([FromBody] GameStateSnapshot snapshot)
        {
            var ip = NormalizeIp(HttpContext.Connection.RemoteIpAddress?.ToString() ?? "");

            if (string.IsNullOrWhiteSpace(snapshot.SessionToken) ||
                !TokenServiceY.ValidateToken(snapshot.SessionToken, ip, consume: false))
            {
                return Unauthorized();
            }

            if (snapshot.Stats == null || snapshot.Stats.Bombs < snapshot.ElapsedTime / 10000)
                return Ok(new { valid = false });

            return Ok(new { valid = true });
        }
        private static string NormalizeIp(string? ip)
        {
            if (ip == "::1") return "127.0.0.1";
            return ip ?? "unknown";
        }
    }
}
