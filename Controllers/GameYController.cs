using Microsoft.AspNetCore.Mvc;
using ECommerceGameSite.Models;

namespace ECommerceGameSite.Controllers
{
    [ApiController]
    [Route("api/gamey")]
    public class GameYController : ControllerBase
    {
        [HttpPost("submit")]
        public IActionResult SubmitScore([FromBody] GameYScoreSubmissionDto payload)
        {
            if (string.IsNullOrWhiteSpace(payload.SessionToken) || !TokenServiceY.ValidateToken(payload.SessionToken))
                return Unauthorized();


            if (!ScoreValidator.IsValid(payload))
                return BadRequest(new { score = 0, reason = "Invalid submission" });

            int score = payload.Coins * 5 + (payload.Trophy > 0 ? 50 : 0);
            return Ok(new { score });
        }

        [HttpPost("validateState")]
        public IActionResult ValidateState([FromBody] GameStateSnapshot snapshot)
        {
            if (string.IsNullOrWhiteSpace(snapshot.SessionToken) || !TokenServiceY.ValidateToken(snapshot.SessionToken))
                return Unauthorized();

            // örnek kontrol: 10 saniyede 1 
            if (snapshot.Stats == null || snapshot.Stats.Bombs < snapshot.ElapsedTime / 10000)
                return Ok(new { valid = false });

            return Ok(new { valid = true });
        }

        [HttpGet("rules")]
        public IActionResult GetGameRules()
        {
            var sessionToken = Guid.NewGuid().ToString();

            var baseLevels = new[]
            {
        new { score = 0, level = "easy" },
        new { score = 20, level = "medium" },
        new { score = 45, level = "hard" },
        new { score = 70, level = "veryhard" },
        new { score = 20, level = "final" }
    };

            var difficultyConfig = new
            {
                easy = new { itemSpawn = 4000, bombSpawn = 2000, heartSpawn = 30000, iceSpawn = 5000 },
                medium = new { itemSpawn = 3000, bombSpawn = 1500, heartSpawn = 30000, iceSpawn = 4500 },
                hard = new { itemSpawn = 2000, bombSpawn = 1000, heartSpawn = 20000, iceSpawn = 3500 },
                veryhard = new { itemSpawn = 2000, bombSpawn = 750, heartSpawn = 15000, iceSpawn = 3500 },
                final = new { itemSpawn = 1000, bombSpawn = 500, heartSpawn = 10000, iceSpawn = 2000 }
            };

            var rules = new GameYRulesDto
            {
                SessionToken = sessionToken,
                RecommendedImages = new[]
                {
            "/images/products/item1.png",
            "/images/products/item2.png",
            "/images/products/item3.png"
        },
                DifficultyLevels = baseLevels,
                DifficultyConfig = difficultyConfig,
                FinalScoreTrigger = 20
            };

            return Ok(rules);
        }

    }
}
