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
            // Sensor tabanlı güvenlik kontrolleri
            if (snapshot.Stats == null ||
                snapshot.Stats.Bombs < snapshot.ElapsedTime / 10000 ||                    // Orijinal kontrol
                snapshot.Stats.Bombs < snapshot.Stats.SensorBombHits ||                  // Bomba sahnesine girmeden sayıldı mı?
                snapshot.Stats.IceCubes < snapshot.Stats.SensorIceHits ||                // Ice sahneye girmeden mi geldi?
                snapshot.Stats.Hearts < snapshot.Stats.SensorHeartHits ||               // Kalpler gerçekten sahneye girdi mi?
                snapshot.Stats.TotalHeartsCollected > snapshot.Stats.SensorHeartHits || // Toplanan kalp, sahneye girenden fazla mı?
                snapshot.Coins > snapshot.Stats.SensorCoinHits                    // Toplanan coin, sahneye girenden fazla mı?
                )
            {
                return Ok(new { valid = false });
            }

            return Ok(new { valid = true });
        }
        [HttpPost("submit")]
        public IActionResult SubmitScore([FromBody] GameYScoreSubmissionDto submission)
        {
            var ip = NormalizeIp(HttpContext.Connection.RemoteIpAddress?.ToString() ?? "");

            if (string.IsNullOrWhiteSpace(submission.SessionToken) ||
                !TokenServiceY.ValidateToken(submission.SessionToken, ip))
            {
                return Unauthorized();
            }

            bool isValid = ScoreValidator.IsValid(submission, 200); // 200 → finalScoreTrigger

            int finalScore = isValid
                ? submission.Coins * 5 + (submission.Trophy > 0 ? 50 : 0)
                : 0;

            return Ok(new { score = finalScore });
        }
        private static string NormalizeIp(string? ip)
        {
            if (ip == "::1") return "127.0.0.1";
            return ip ?? "unknown";
        }
    }
}
