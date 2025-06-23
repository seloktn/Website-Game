using System.Text.Json.Serialization;

namespace ECommerceGameSite.Models
{
    public class GameYScoreSubmissionDto
    {
        public string? SessionToken { get; set; }
        public int Coins { get; set; }
        public int Trophy { get; set; }
        public long DurationMs { get; set; }
        public SpawnStats? Stats { get; set; }
    }

    public class GameStateSnapshot
    {
        public string? SessionToken { get; set; }
        public long ElapsedTime { get; set; }
        public SpawnStats? Stats { get; set; }
    }

    public class SpawnStats
    {
        public int Bombs { get; set; }
        public int IceCubes { get; set; }
        public int Hearts { get; set; }
        public int TotalHeartsCollected { get; set; }
    }


    public static class ScoreValidator
    {
        public static bool IsValid(GameYScoreSubmissionDto payload)
        {
            int seconds = (int)(payload.DurationMs / 1000);
            if (seconds < 40 && payload.Trophy > 0) return false;
            if (payload.Coins > seconds) return false;
            if (payload.Coins > 40) return false;
            if (payload.Trophy > 0 && payload.Coins < 40) return false;
            if (payload.Stats == null) return false;
            if (payload.Stats.Bombs < seconds / 3) return false;


            return true;
        }
    }
    public class GameYRulesDto
    {
        [JsonPropertyName("sessionToken")]
        public string? SessionToken { get; set; }

        [JsonPropertyName("recommendedImages")]
        public string[]? RecommendedImages { get; set; }

        [JsonPropertyName("difficultyLevels")]
        public object[]? DifficultyLevels { get; set; }

        [JsonPropertyName("difficultyConfig")]
        public object? DifficultyConfig { get; set; }

        [JsonPropertyName("finalScoreTrigger")]
        public int FinalScoreTrigger { get; set; }
    }
}
