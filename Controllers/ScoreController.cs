using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/score")]
public class ScoreController : ControllerBase
{
    [HttpPost("submit")]
    public IActionResult SubmitScore([FromBody] ScoreSubmissionDto data)
    {
        // Güvenlik sınırları
        int maxCoins = 40;
        int maxTrophy = 1;

        int validCoins = Math.Min(data.Coins, maxCoins);
        int validTrophy = Math.Min(data.Trophy, maxTrophy);

        int finalScore = (validCoins * 10) + (validTrophy * 50);

        // Örnek: Veritabanına kaydetmek yerine şimdilik sadece log basalım
        Console.WriteLine($"[Skor] Coins: {validCoins}, Trophy: {validTrophy}, Total: {finalScore}");

        return Ok(new
        {
            success = true,
            score = finalScore,
            message = "Skor başarıyla alındı."
        });
    }
}
