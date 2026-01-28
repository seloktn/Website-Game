namespace GameApi.Models
{
    public class ScoreSubmissionDto
    {
        public string? PlayerId { get; set; }
        public int CoinCount { get; set; }
        public int TimeMs { get; set; }
         public int ObstacleCount { get; set; }  // Görülen engel sayısı
    }
    }

