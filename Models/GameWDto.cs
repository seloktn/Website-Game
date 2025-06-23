using System.Text.Json.Serialization;

namespace ECommerceGameSite.Models
{
    public class GameWScoreSubmissionDto
    {
        public string? SessionToken { get; set; }
        public int Score { get; set; }
        public int ArrowsFired { get; set; }
        public int SpawnedItems { get; set; }
        public int SpawnedBombs { get; set; }
        public int SpawnedTrophy { get; set; }
        public int ItemsHit { get; set; }
        public int BombsHit { get; set; }
        public int HeartsLeft { get; set; }
        public bool Won { get; set; }
        public long DurationMs { get; set; }
    }

    public class GameWSpawnStats
    {
        public int SpawnedItems { get; set; }
        public int SpawnedBombs { get; set; }
    }

    public static class GameWScoreValidator
    {
        private static (int itemMs, int bombMs) GetSpawnIntervals(string difficulty) =>
            difficulty.ToLower() switch
            {
                "easy" => (2000, 5000),
                "medium" => (1500, 3000),
                "hard" => (1500, 1500),
                "very-hard" => (1200, 800),
                _ => (1500, 3000)
            };

        public static bool IsValid(GameWScoreSubmissionDto data)
        {
            {
                int seconds = (int)(data.DurationMs / 1000);

                if (seconds < 15 || seconds > 200) return false;
                if (data.Score < 0 || data.Score > 600) return false;
                if (data.ItemsHit * 10 != data.Score) return false;
                if (data.ItemsHit > data.SpawnedItems) return false;
                if (data.BombsHit > data.SpawnedBombs) return false;
                if (data.ItemsHit > 55) return false;
                if (data.ItemsHit < data.ArrowsFired * 2) return false;
                if (data.BombsHit > 4) return false;
                if (data.HeartsLeft > 4 || data.HeartsLeft < -1) return false;
                if (data.SpawnedTrophy != 1) return false;
                if (data.Won && data.Score < 500) return false;
                return true;
            }
            // 200 saniye oyundaki süre sınırına göre hesaplandı: 
            // 15sn (başlangıç) + 3 (coin başına kazanılan süre) x 
            // 50 (vurulması gereken coin sayısı) + 
            // 35 sn hata payı
        }
    }
}
