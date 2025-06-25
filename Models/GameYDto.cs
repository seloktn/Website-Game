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
        public string? Difficulty { get; set; }
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
        public static bool IsValid(GameYScoreSubmissionDto payload, int finalScoreTrigger)
        {
            int seconds = (int)(payload.DurationMs / 1000);
            if (seconds < 40 && payload.Trophy > 0) return false;
            if (payload.Coins > seconds) return false;
            if (payload.Coins > 40) return false;
            if (payload.Trophy > 0 && payload.Coins < 40) return false;
            if (payload.Stats == null) return false;
            if (payload.Stats.Bombs < seconds / 3) return false;
            if (payload.Stats.IceCubes < seconds / 3) return false;
            if (payload.Stats.TotalHeartsCollected > seconds / 10) return false;

            if (!string.IsNullOrWhiteSpace(payload.Difficulty))
            {
                string diff = payload.Difficulty.ToLower();
                int score = payload.Coins * 5 + (payload.Trophy > 0 ? 50 : 0);

                switch (diff)
                {
                    case "easy":
                        if (score >= 20) return false;
                        break;

                    case "medium":
                        if (score < 20 || score >= 45) return false;
                        break;

                    case "hard":
                        if (score < 45 || score >= 70) return false;
                        break;

                    case "veryhard":
                        if (score < 70 || payload.Trophy > 0) return false;
                        break;

                    case "final":
                        if (score < finalScoreTrigger || payload.Trophy == 0) return false;
                        break;

                    default:
                        return false;
                }
            }

            return true;
        }
    }

    public class GameYRulesDto
    {
        [JsonPropertyName("sessionToken")]
        public string? SessionToken { get; set; }
        
        [JsonPropertyName("difficultyLevels")]
        public object[]? DifficultyLevels { get; set; }

        [JsonPropertyName("difficultyConfig")]
        public object? DifficultyConfig { get; set; }

        [JsonPropertyName("finalScoreTrigger")]
        public int FinalScoreTrigger { get; set; }
    }
}
