using Microsoft.AspNetCore.Mvc;
using System; // Console için

[ApiController]
[Route("api/score")]
public class ScoreController : ControllerBase
{
    private const int MaxCoins = 30;
    private const int MaxTrophy = 1;
    private const int MinDurationMs = 35000;

    [HttpPost("submit")]
    public IActionResult SubmitScore([FromBody] ScoreSubmissionDto data)
    {
        if (data == null || data.DurationMs <= 0 || data.Coins < 0 || data.Trophy < 0)
        {
            Console.WriteLine($"[Skor Hata] Geçersiz veri gönderildi: data is null: {data == null}, DurationMs: {data?.DurationMs}, Coins: {data?.Coins}, Trophy: {data?.Trophy}");
            return BadRequest(new
            {
                success = false,
                score = 0,
                message = "Geçersiz veri gönderildi."
            });
        }

        bool isValid = true;
        string invalidReason = "Geçerli";

        Console.WriteLine($"[Skor Kontrol] Gelen Veri - Coins: {data.Coins}, Trophy: {data.Trophy}, Duration: {data.DurationMs}ms");

        // Maksimum coin 
        if (data.Coins > MaxCoins)
        {
            isValid = false;
            invalidReason = $"Toplanan coin sayısı ({data.Coins}) maksimum limiti ({MaxCoins}) aştı.";
            Console.WriteLine($"[Skor Kontrol] Kural İhlali: {invalidReason}");
        }

        // Kupa sayısı 
        if (data.Trophy > MaxTrophy)
        {
            isValid = false;
            invalidReason = $"Toplanan kupa sayısı ({data.Trophy}) maksimum limiti ({MaxTrophy}) aştı.";
            Console.WriteLine($"[Skor Kontrol] Kural 2 İhlali: {invalidReason}");
        }

        // Kupa alındıysa minimum süreyi geçmiş olmalı
        if (data.Trophy > 0 && data.DurationMs < MinDurationMs)
        {
            isValid = false;
            invalidReason = $"Kupa alındı ({data.Trophy > 0}) ancak oyun süresi ({data.DurationMs}ms) minimum sürenin ({MinDurationMs}ms) altında.";
            Console.WriteLine($"[Skor Kontrol] Kural 3 İhlali: {invalidReason}");
        }

        //  Coin toplama hızı kontrolü saniyede 1 coinden fazla toplanamaz
        double durationInSeconds = data.DurationMs / 1000.0;
        if (data.Coins > durationInSeconds)
        {
            isValid = false;
            invalidReason = $"Coin toplama hızı izin verilen oranı aştı ({data.Coins} coin / {durationInSeconds:F2} sn). Saniyede 1 coinden fazla toplanamaz.";
            Console.WriteLine($"[Skor Kontrol] Kural 4 İhlali: {invalidReason}");
        }

        int finalScore = 0;
        string message = "";

        if (isValid)
        {
            // Eğer isValid hala true ise, skor hesaplanır.
            finalScore = (data.Coins * 10) + (data.Trophy * 50);
            message = "Skor başarıyla alındı.";
        }
        else
        {
            // Eğer isValid false ise, skor 0 olacak ve hata mesajı gösterilecek.
            finalScore = 0;
            message = $"Skor koşulları sağlanmadı, geçersiz sayıldı. Neden: {invalidReason}";
        }

        Console.WriteLine($"[Skor Sonuç] Coins: {data.Coins}, Trophy: {data.Trophy}, Duration: {data.DurationMs}ms, Final Score: {finalScore}, Geçerli: {isValid}, Neden: {invalidReason}");

        return Ok(new
        {
            success = isValid,
            score = finalScore,
            message = message
        });
    }

    [HttpGet("rules")]
    public IActionResult GetScoreRules()
    {
        return Ok(new
        {
            maxCoins = MaxCoins,
            maxTrophy = MaxTrophy,
            minDurationMs = MinDurationMs
        });
    }
} 
