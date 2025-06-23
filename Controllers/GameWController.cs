using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceGameSite.Models;

namespace ECommerceGameSite.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameWController : ControllerBase
    {
        [HttpPost("submit-score")]
        [Authorize]
        public IActionResult SubmitScore([FromBody] GameWScoreSubmissionDto data)
        {
            var username = User.Identity?.Name ?? "anonymous";

            if (!GameWScoreValidator.IsValid(data))
            {
                return BadRequest("Geçersiz skor verisi veya oyun sahteciliği şüphesi.");
            }

            Console.WriteLine($"[SCORE] ✅ Kullanıcı: {username}, Skor: {data.Score}, Süre: {data.DurationMs}ms");

            return Ok(new
            {
                message = "Skor başarıyla kaydedildi.",
                score = data.Score,
                user = username
            });
        }
    }
}
