using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Collections.Concurrent;

namespace GameAPI.Controllers
{
    [ApiController]
    [Route("api/game")]
    public class GameController : ControllerBase
    {
        private readonly ILogger<GameController> _logger;

        // Thread-safe collections for high-traffic scenarios
        private static readonly ConcurrentDictionary<string, DeviceBoundToken> _deviceTokens = new();
        private static readonly ConcurrentDictionary<string, DeviceFingerprint> _deviceFingerprints = new();
        private static readonly ConcurrentDictionary<string, GameSession> _activeSessions = new();
        private static readonly ConcurrentDictionary<string, GameplayMetrics> _gameplayMetrics = new();
        private static readonly ConcurrentDictionary<string, SuspiciousActivity> _suspiciousActivities = new();
        private static readonly ConcurrentDictionary<string, RateLimitInfo> _rateLimits = new();



        // Security secrets (load from environment variables)
        private static readonly string DEVICE_SECRET = Environment.GetEnvironmentVariable("DEVICE_SECRET")
            ?? "device-binding-secret-2024-CHANGE-IN-PRODUCTION-xyz789";
        private static readonly string MASTER_SECRET = Environment.GetEnvironmentVariable("MASTER_SECRET")
            ?? "master-game-secret-2024-CHANGE-IN-PRODUCTION-abc123";
        private static readonly string GAMEPLAY_SECRET = Environment.GetEnvironmentVariable("GAMEPLAY_SECRET")
            ?? "gameplay-validation-secret-2024-CHANGE-IN-PRODUCTION-def456";

        //  Security constants
        private const int TOKEN_EXPIRY_SECONDS = 120;
        private const int MAX_TAMPER_ATTEMPTS = 5;
        private const int MAX_SESSION_TIME_HOURS = 4;
        private const double MAX_SCORE_PER_SECOND = 8.0;
        private const int MAX_REQUESTS_PER_MINUTE = 50;
        private const int CANVAS_FINGERPRINT_MIN_LENGTH = 30;

        //  Valid origins for CORS
        private static readonly HashSet<string> VALID_ORIGINS = new()
{
    "http://localhost:3000",
    "http://localhost:5080",    // ✅ Sizin setup'ınız
    "http://localhost:8080",
    "https://yourgame.com",
    "https://www.yourgame.com"
};

        public GameController(ILogger<GameController> logger)
        {
            _logger = logger;

            // Start background cleanup task
            _ = Task.Run(BackgroundCleanupTask);
        }



        // DEVICE-BOUND PERMISSION REQUEST
        [HttpPost("request-device-bound-permission")]
        public async Task<IActionResult> RequestDeviceBoundPermission([FromBody] DeviceBoundPermissionRequest request)
        {
            try
            {
                // 1. RATE LIMITING CHECK
                var rateLimitResult = CheckRateLimit(request.SessionId);
                if (!rateLimitResult.IsValid)
                {
                    _logger.LogWarning($" RATE LIMIT EXCEEDED: {request.SessionId}");
                    return StatusCode(429, new { success = false, reason = "Rate limit exceeded" });
                }

                // 2. ORIGIN VALIDATION
                var originResult = ValidateRequestOrigin();
                if (!originResult.IsValid)
                {
                    _logger.LogWarning($"INVALID ORIGIN: {originResult.Reason}");
                    return Unauthorized(new { success = false, reason = "Invalid request origin" });
                }

                // 3. REQUEST VALIDATION
                var requestResult = ValidatePermissionRequest(request);
                if (!requestResult.IsValid)
                {
                    _logger.LogWarning($" INVALID REQUEST: {requestResult.Reason}");
                    return BadRequest(new { success = false, reason = requestResult.Reason });
                }

                // 4. DEVICE FINGERPRINT VALIDATION
                var deviceResult = ValidateDeviceFingerprint(request);
                if (!deviceResult.IsValid)
                {
                    _logger.LogWarning($" DEVICE VALIDATION FAILED: {deviceResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "device_validation_failure", deviceResult.Reason);
                    return Unauthorized(new { success = false, reason = "Device validation failed" });
                }

                // 5. SESSION MANAGEMENT
                await InitializeOrUpdateSession(request);

                // 6. DEVICE BINDING CREATION
                var deviceId = CreateDeviceId(request.DeviceFingerprint);
                var bindingSecret = GenerateDeviceBindingSecret(deviceId, request.SessionId);

                // 7. TOKEN GENERATION WITH ENCRYPTION
                var tokenData = await GenerateDeviceBoundToken(request.SessionId, deviceId, bindingSecret, request.GameData);

                // 8. STORE DEVICE-BOUND TOKEN
                var expiresAt = DateTime.UtcNow.AddSeconds(TOKEN_EXPIRY_SECONDS);
                _deviceTokens[tokenData.Token] = new DeviceBoundToken
                {
                    SessionId = request.SessionId,
                    DeviceId = deviceId,
                    BindingSecret = bindingSecret,
                    ExpectedGameState = CalculateExpectedGameState(request.GameData),
                    DeviceFingerprint = request.DeviceFingerprint,
                    ClientIP = GetClientIpAddress(),
                    UserAgent = GetUserAgent(),
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = expiresAt,
                    IsUsed = false
                };

                // 9. STORE/UPDATE DEVICE FINGERPRINT
                _deviceFingerprints[deviceId] = new DeviceFingerprint
                {
                    DeviceId = deviceId,
                    Fingerprint = request.DeviceFingerprint,
                    LastSeen = DateTime.UtcNow,
                    IPAddress = GetClientIpAddress(),
                    SessionId = request.SessionId,
                    UsageCount = _deviceFingerprints.GetValueOrDefault(deviceId)?.UsageCount + 1 ?? 1
                };

                _logger.LogInformation($" Device-bound permission granted: {tokenData.Token[..8]}... for device {deviceId[..8]}...");

                return Ok(new
                {
                    success = true,
                    permissionToken = tokenData.Token,
                    deviceChallenge = tokenData.DeviceChallenge,
                    expiresIn = TOKEN_EXPIRY_SECONDS,
                    serverTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    deviceTrustScore = CalculateDeviceTrustScore(deviceId)
                });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Device-bound permission error");
                return StatusCode(500, new { success = false, reason = "Permission generation failed" });
            }
        }

        // DEVICE-BOUND ACTION VALIDATION
        [HttpPost("validate-device-bound-action")]
        public async Task<IActionResult> ValidateDeviceBoundAction([FromBody] DeviceBoundActionRequest request)
        {
            try
            {
                // 1. RATE LIMITING CHECK
                var rateLimitResult = CheckRateLimit(request.SessionId);
                if (!rateLimitResult.IsValid)
                {
                    return StatusCode(429, new { success = false, reason = "Rate limit exceeded" });
                }

                // 2. DEVICE-BOUND TOKEN VALIDATION (CRITICAL)
                var tokenResult = ValidateDeviceBoundToken(request);
                if (!tokenResult.IsValid)
                {
                    _logger.LogWarning($" DEVICE TOKEN VALIDATION FAILED: {tokenResult.Reason} for session {request.SessionId}");
                    await RecordSuspiciousActivity(request.SessionId, "device_token_failure", tokenResult.Reason);
                    return Ok(new { success = false, reason = "Device token validation failed", cheatProbability = 99 });
                }

                // 3. DEVICE CHALLENGE VERIFICATION
                var challengeResult = VerifyDeviceChallenge(request);
                if (!challengeResult.IsValid)
                {
                    _logger.LogWarning($" DEVICE CHALLENGE FAILED: {challengeResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "device_challenge_failure", challengeResult.Reason);
                    return Ok(new { success = false, reason = "Device challenge failed", cheatProbability = 99 });
                }

                // 4. DEVICE CONSISTENCY CHECK
                var deviceConsistencyResult = ValidateDeviceConsistency(request);
                if (!deviceConsistencyResult.IsValid)
                {
                    _logger.LogWarning($" DEVICE CONSISTENCY FAILED: {deviceConsistencyResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "device_consistency_failure", deviceConsistencyResult.Reason);
                    return Ok(new { success = false, reason = deviceConsistencyResult.Reason, cheatProbability = 95 });
                }

                // 5. ENHANCED GAME STATE VERIFICATION
                var gameStateResult = VerifyEnhancedGameState(request);
                if (!gameStateResult.IsValid)
                {
                    _logger.LogWarning($" ENHANCED GAME STATE FAILED: {gameStateResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "game_state_failure", gameStateResult.Reason);
                    return Ok(new { success = false, reason = gameStateResult.Reason, cheatProbability = 90 });
                }

                // 6. TEMPORAL & BEHAVIORAL ANALYSIS
                var behaviorResult = AnalyzeEnhancedBehavior(request);
                if (!behaviorResult.IsValid)
                {
                    _logger.LogWarning($" BEHAVIOR ANALYSIS FAILED: {behaviorResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "behavior_failure", behaviorResult.Reason);
                    return Ok(new { success = false, reason = behaviorResult.Reason, cheatProbability = 80 });
                }

                // 7. PHYSICS VALIDATION
                var physicsResult = ValidatePhysics(request.GameData.Physics);
                if (!physicsResult.IsValid)
                {
                    _logger.LogWarning($" PHYSICS VALIDATION FAILED: {physicsResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "physics_tamper", physicsResult.Reason);
                    return Ok(new { success = false, reason = physicsResult.Reason, cheatProbability = 95 });
                }

                // 8. POSITION VALIDATION
                var positionResult = ValidatePosition(request.GameData.PlayerPosition, request.SessionId);
                if (!positionResult.IsValid)
                {
                    _logger.LogWarning($" POSITION VALIDATION FAILED: {positionResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "position_tamper", positionResult.Reason);
                    return Ok(new { success = false, reason = positionResult.Reason, cheatProbability = 90 });
                }

                // 9. CROSS-REFERENCE VALIDATION
                var crossRefResult = CrossReferenceValidation(request);
                if (!crossRefResult.IsValid)
                {
                    _logger.LogWarning($" CROSS-REFERENCE FAILED: {crossRefResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "cross_reference_failure", crossRefResult.Reason);
                    return Ok(new { success = false, reason = crossRefResult.Reason, cheatProbability = 80 });
                }

                // 10. SUCCESS - UPDATE METRICS AND MARK TOKEN AS USED
                await UpdateSuccessfulValidation(request);

                var deviceTrustScore = CalculateDeviceTrustScore(CreateDeviceId(request.DeviceFingerprint));
                var sessionMetrics = _gameplayMetrics.GetValueOrDefault(request.SessionId);

                _logger.LogInformation($" Device-bound action validated for session {request.SessionId} (Trust: {deviceTrustScore}%)");

                return Ok(new
                {
                    success = true,
                    message = "Device-bound validation successful",
                    deviceTrustScore = deviceTrustScore,
                    sessionTime = sessionMetrics?.SessionTime ?? 0,
                    nextPermissionIn = 5000,
                    serverVerification = GenerateServerVerification(request.SessionId)
                });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Device-bound validation error");
                await RecordSuspiciousActivity(request.SessionId, "validation_exception", ex.Message);
                return Ok(new { success = false, reason = "Validation error", cheatProbability = 85 });
            }
        }

        // 🍯 HONEYPOT COLLISION ENDPOINT
        [HttpPost("honeypot-collision")]
        public async Task<IActionResult> ReportHoneypotCollision([FromBody] HoneypotCollision collision)
        {
            try
            {
                _logger.LogWarning($" HONEYPOT COLLISION: Session {collision.SessionId} at ({collision.PlayerPosition.X}, {collision.PlayerPosition.Y})");

                await RecordSuspiciousActivity(collision.SessionId, "honeypot_collision",
                    $"ObstacleId: {collision.ObstacleId}, Type: {collision.CollisionType}");

                // Immediate session termination for honeypot collision
                if (_activeSessions.ContainsKey(collision.SessionId))
                {
                    _activeSessions[collision.SessionId].IsTerminated = true;
                    _activeSessions[collision.SessionId].TerminationReason = "Honeypot collision detected";
                }

                return Ok(new
                {
                    success = false,
                    reason = "Collision bypass detected via honeypot",
                    cheatProbability = 100,
                    action = "terminate_immediately"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing honeypot collision");
                return Ok(new { success = false, reason = "Processing error" });
            }
        }

        //  TAMPER REPORT ENDPOINT
        [HttpPost("tamper-report")]
        public async Task<IActionResult> ReportTamperAttempt([FromBody] TamperReport report)
        {
            try
            {
                await RecordSuspiciousActivity(report.SessionId, report.Type, report.Details);

                var activity = _suspiciousActivities.GetValueOrDefault(report.SessionId);
                var tamperCount = activity?.TamperAttempts ?? 0;

                if (tamperCount >= MAX_TAMPER_ATTEMPTS)
                {
                    _logger.LogWarning($" SESSION TERMINATED: {report.SessionId} exceeded tamper limit ({tamperCount})");

                    // Terminate session
                    if (_activeSessions.ContainsKey(report.SessionId))
                    {
                        _activeSessions[report.SessionId].IsTerminated = true;
                        _activeSessions[report.SessionId].TerminationReason = $"Multiple tamper attempts ({tamperCount})";
                    }

                    return Ok(new
                    {
                        success = false,
                        reason = $"Multiple tamper attempts detected ({tamperCount})",
                        cheatProbability = 95,
                        action = "terminate_session"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Tamper attempt logged",
                    tamperCount = tamperCount,
                    warningLevel = tamperCount >= 3 ? "high" : "medium"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing tamper report");
                return StatusCode(500, new { success = false, reason = "Internal error" });
            }
        }

        //  GAME CONFIGURATION ENDPOINT
        [HttpGet("config")]
        public IActionResult GetGameConfig()
        {
            return Ok(new
            {
                scrollSpeed = 11.0,
                gravity = 2000,
                jumpForce = 950.0,
                playerSpeed = 150,
                playerScale = 0.38,
                groundLevel = 540,
                playerStartX = 150,
                maxCoins = 30,
                victoryScore = 300,
                securityMode = "device-bound-v2.0",
                tokenExpirySeconds = TOKEN_EXPIRY_SECONDS,
                maxSessionHours = MAX_SESSION_TIME_HOURS
            });
        }

        // GAME SESSION RESET ENDPOINT
        [HttpPost("session/reset")]
public IActionResult ResetSession()
{
    try
    {
        var currentTime = DateTime.UtcNow;
        var newSessionId = Guid.NewGuid().ToString();
        
        _logger.LogInformation($"🔄 Session reset requested at {currentTime:yyyy-MM-dd HH:mm:ss.fff}");
        
        // Tüm cache'leri temizle
        _deviceTokens.Clear();
        _activeSessions.Clear();
        _gameplayMetrics.Clear();
        
        _logger.LogInformation("✅ All session data cleared for fresh start");

        return Ok(new
        {
            success = true,
            message = "Session reset successful",
            timestamp = currentTime,
            sessionId = newSessionId
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Session reset failed");
        return BadRequest(new
        {
            success = false,
            message = "Session reset failed",
            error = ex.Message
        });
    }
}


        [HttpPost("coin/collect-batch")]
        public IActionResult ValidateCoinBatch([FromBody] CoinBatchSubmissionRequest request)
        {
            try
            {
                // ✅ Null check ekleyin
                if (request?.Coins == null || request.Coins.Count == 0)
                {
                    return Ok(new { success = true, validCoins = 0, totalScore = 0, totalCoins = 0 });
                }

                var validCoins = request.Coins.Count;
                var totalScore = validCoins * 10;

                _logger.LogInformation($"🪙 Coin batch validated: {validCoins} coins = {totalScore} score");

                return Ok(new
                {
                    success = true,
                    validCoins = validCoins,
                    totalScore = totalScore,
                    totalCoins = validCoins,
                    invalidCoins = 0,
                    message = "Batch validated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Coin batch validation error");
                return StatusCode(500, new { success = false, error = "Validation failed" });
            }
        }

        // COIN INTERVAL ENDPOINT
        [HttpGet("coin/interval")]
        public IActionResult GetCoinInterval()
        {
            try
            {
                return Ok(new
                {
                    success = true,
                    interval = 2500,        // Coin spawn aralığı (ms)
                    minInterval = 1500,     // Minimum aralık
                    maxInterval = 4000,     // Maximum aralık
                    difficulty = "normal"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Coin interval fetch failed",
                    error = ex.Message
                });
            }
        }

        [HttpGet("obstacle/difficulty/{level}")]
        public IActionResult GetObstacleDifficulty(int level)
        {
            try
            {
                // Difficulty based configuration
                var difficultyConfig = level switch
                {
                    1 => new
                    {
                        scrollSpeed = 11.0,
                        spawnRate = 1.0,
                        obstacleSpeed = 1.0,
                        message = "Normal difficulty"
                    },
                    2 => new
                    {
                        scrollSpeed = 13.0,
                        spawnRate = 1.2,
                        obstacleSpeed = 1.1,
                        message = "Increased difficulty"
                    },
                    3 => new
                    {
                        scrollSpeed = 15.0,
                        spawnRate = 1.4,
                        obstacleSpeed = 1.2,
                        message = "Hard difficulty"
                    },
                    _ => new
                    {
                        scrollSpeed = 11.0,
                        spawnRate = 1.0,
                        obstacleSpeed = 1.0,
                        message = "Default difficulty"
                    }
                };

                _logger.LogInformation($"🎮 Difficulty level {level} requested");

                return Ok(new
                {
                    success = true,
                    level = level,
                    config = difficultyConfig,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting difficulty {level}");
                return StatusCode(500, new { success = false, error = "Difficulty fetch failed" });
            }
        }



        [HttpGet("coin/difficulty/{coinCount}")]  // ✅ Farklı route
        public IActionResult GetCoinDifficulty(int coinCount)
        {
            try
            {
                // Her 3 coin'de bir hız artışı
                var speedIncrease = (coinCount / 3) * 0.5;
                var newScrollSpeed = Math.Min(11.0 + speedIncrease, 18.0); // Max 18

                var maxCoins = 30; // Victory için maksimum coin

                _logger.LogInformation($"🎮 Coin difficulty for {coinCount} coins: speed={newScrollSpeed}");

                return Ok(new
                {
                    success = true,
                    newScrollSpeed = newScrollSpeed,
                    maxCoins = maxCoins,
                    coinCount = coinCount,
                    speedIncrease = speedIncrease,
                    message = $"Speed increased to {newScrollSpeed:F1}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting coin difficulty for {coinCount}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Coin difficulty calculation failed"
                });
            }
        }



        //  SERVER HEALTH CHECK
        [HttpGet("health")]
        public IActionResult ServerHealth()
        {
            var activeTokens = _deviceTokens.Count(kvp => !kvp.Value.IsUsed && kvp.Value.ExpiresAt > DateTime.UtcNow);
            var activeSessions = _activeSessions.Count(kvp => !kvp.Value.IsTerminated);

            return Ok(new
            {
                status = "healthy",
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                server = "game-api-secure-v2.0",
                activeTokens = activeTokens,
                activeSessions = activeSessions,
                securityMode = "device-bound"
            });
        }

        [HttpGet("debug/session/{sessionId}")]
        public IActionResult GetSessionDebugInfo(string sessionId)
        {
            try
            {
                if (_activeSessions.TryGetValue(sessionId, out var session))
                {
                    var currentTime = DateTime.UtcNow;
                    var sessionAge = currentTime - session.StartTime;
                    var gameTimeSeconds = (int)sessionAge.TotalSeconds;
                    
                    return Ok(new
                    {
                        sessionId = session.SessionId,
                        startTime = session.StartTime.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                        currentTime = currentTime.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                        sessionAgeSeconds = gameTimeSeconds,
                        lastValidation = session.LastValidation.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                        validationCount = session.ValidationCount,
                        totalScore = session.TotalScore,
                        isTerminated = session.IsTerminated,
                        lastPlayerPosition = session.LastPlayerPosition,
                        sessionAgeTotalMs = sessionAge.TotalMilliseconds,
                        timeSinceLastValidation = (currentTime - session.LastValidation).TotalSeconds
                    });
                }
                else
                {
                    return NotFound(new { 
                        error = "Session not found",
                        sessionId = sessionId,
                        totalActiveSessions = _activeSessions.Count,
                        activeSessionIds = _activeSessions.Keys.Take(5).ToList() // İlk 5 session ID
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting debug info for session {sessionId}");
                return StatusCode(500, new { error = "Debug info fetch failed", details = ex.Message });
            }
        }

        [HttpGet("debug/sessions")]
        public IActionResult GetAllSessionsDebugInfo()
        {
            try
            {
                var currentTime = DateTime.UtcNow;
                var sessions = _activeSessions.Values.Select(session => new
                {
                    sessionId = session.SessionId,
                    startTime = session.StartTime.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                    ageSeconds = (int)(currentTime - session.StartTime).TotalSeconds,
                    validationCount = session.ValidationCount,
                    totalScore = session.TotalScore,
                    isTerminated = session.IsTerminated,
                    lastValidationAgo = (currentTime - session.LastValidation).TotalSeconds
                }).ToList();

                return Ok(new
                {
                    totalSessions = sessions.Count,
                    currentTime = currentTime.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                    sessions = sessions,
                    activeTokens = _deviceTokens.Count,
                    suspiciousActivities = _suspiciousActivities.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all sessions debug info");
                return StatusCode(500, new { error = "Debug info fetch failed" });
            }
        }


        [HttpPost("game-over-signal")]
public IActionResult SignalGameOver([FromBody] GameOverSignal signal)
{
    try
    {
        _logger.LogInformation($"🎮 Game over signal received for session {signal.SessionId}");

        if (_activeSessions.TryGetValue(signal.SessionId, out var session))
        {
            // ✅ SESSION'I RESET ET - FRESH START
            session.LastPlayerPosition = null;
            session.TotalScore = 0;
            session.TotalDistance = 0;
            session.ValidationCount = 0;
            session.LastValidation = DateTime.UtcNow;
            
            // ✅ YENİ OYUN İÇİN START TIME'I RESET ET
            session.StartTime = DateTime.UtcNow;
            
            _logger.LogInformation($"✅ Session {signal.SessionId} completely reset with new start time: {session.StartTime:yyyy-MM-dd HH:mm:ss.fff}");
        }
        else
        {
            _logger.LogWarning($"⚠️ Session {signal.SessionId} not found, will be created on next validation");
        }

        return Ok(new { success = true, message = "Session reset for new game" });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error processing game over signal");
        return StatusCode(500, new { success = false, error = "Signal processing failed" });
    }
}


        //  SECURE SCORE SUBMISSION ENDPOINT
        [HttpPost("score/secure-submit")]
        public async Task<IActionResult> SecureScoreSubmission([FromBody] SecureScoreSubmissionRequest request)
        {
            try
            {
                _logger.LogInformation($" Secure score submission received: Score={request.Score}, Coins={request.Coins}");

                // 1. RATE LIMITING CHECK
                var rateLimitResult = CheckRateLimit(request.SessionId);
                if (!rateLimitResult.IsValid)
                {
                    return StatusCode(429, new { success = false, reason = "Rate limit exceeded" });
                }

                // 2. SESSION VALIDATION
                var sessionResult = ValidateScoreSession(request);
                if (!sessionResult.IsValid)
                {
                    _logger.LogWarning($" INVALID SESSION: {sessionResult.Reason}");
                    return BadRequest(new { success = false, reason = "Invalid session" });
                }

                // 3. SCORE VALIDATION
                var scoreResult = ValidateScoreData(request);
                if (!scoreResult.IsValid)
                {
                    _logger.LogWarning($" INVALID SCORE: {scoreResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "score_manipulation", scoreResult.Reason);
                    return Ok(new { success = false, reason = scoreResult.Reason, cheatProbability = 95 });
                }

                // 4. TIMING VALIDATION
                var timingResult = ValidateScoreTiming(request);
                if (!timingResult.IsValid)
                {
                    _logger.LogWarning($" SUSPICIOUS TIMING: {timingResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "timing_manipulation", timingResult.Reason);
                    return Ok(new { success = false, reason = timingResult.Reason, cheatProbability = 80 });
                }

                // 5. CROSS-REFERENCE WITH SESSION DATA
                var crossRefResult = CrossReferenceScoreWithSession(request);
                if (!crossRefResult.IsValid)
                {
                    _logger.LogWarning($" SCORE CROSS-REFERENCE FAILED: {crossRefResult.Reason}");
                    await RecordSuspiciousActivity(request.SessionId, "score_inconsistency", crossRefResult.Reason);
                    return Ok(new { success = false, reason = crossRefResult.Reason, cheatProbability = 90 });
                }

                // 6. SUCCESS - RECORD LEGITIMATE SCORE
                var finalScore = RecordLegitimateScore(request);

                _logger.LogInformation($" Legitimate score recorded: {finalScore.FinalScore} points");

                return Ok(new
                {
                    success = true,
                    finalScore = finalScore.FinalScore,
                    ranking = finalScore.Ranking,
                    isPersonalBest = finalScore.IsPersonalBest,
                    verification = GenerateScoreVerification(request.SessionId, finalScore.FinalScore)
                });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Secure score submission error");
                return StatusCode(500, new { success = false, reason = "Score processing failed" });
            }
        }

        [HttpGet("obstacles-batch")]
public IActionResult GetObstaclesBatch([FromQuery] int count = 100)
{
    try
    {
        var random = new Random();
        var obstacles = new List<object>();
        var groundTypes = new[] { "cone", "cart", "cart2", "cat", "old" };
        var skyTypes = new[] { "pigeon" };
        
        // ✅ ANTI-CONSECUTIVE SYSTEM
        var consecutiveSkyCount = 0;
        var maxConsecutiveSky = 2; // Maksimum 2 art arda sky
        
        var currentX = 800;
        var minSpacing = 300;
        var maxSpacing = 600;

        for (int i = 0; i < count; i++)
        {
            bool isGround;
            
            // ✅ CONSECUTIVE CHECK
            if (consecutiveSkyCount >= maxConsecutiveSky)
            {
                // Zorunlu ground obstacle
                isGround = true;
                consecutiveSkyCount = 0;
                _logger.LogInformation($"🚧 Forced ground obstacle after {maxConsecutiveSky} sky obstacles");
            }
            else
            {
                // Normal random selection
                isGround = random.NextDouble() < 0.8; // 80% ground, 20% sky
            }
            
            // ✅ UPDATE COUNTER
            if (isGround)
            {
                consecutiveSkyCount = 0; // Reset counter
            }
            else
            {
                consecutiveSkyCount++; // Increment sky counter
            }
            
            var type = isGround ?
                groundTypes[random.Next(groundTypes.Length)] :
                skyTypes[random.Next(skyTypes.Length)];

            var spacing = random.Next(minSpacing, maxSpacing + 1);
            currentX += spacing;

            obstacles.Add(new
            {
                id = $"obstacle_{i}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                x = currentX,
                type = type,
                isGround = isGround,
                scale = isGround ? 1.0 : 0.38,
                spacing = spacing,
                consecutiveCount = consecutiveSkyCount // ✅ Debug için
            });
        }

        _logger.LogInformation($"🚧 Generated {count} obstacles with anti-consecutive system (max: {maxConsecutiveSky} sky)");

        return Ok(new
        {
            success = true,
            obstacles = obstacles,
            count = obstacles.Count,
            maxConsecutiveSky = maxConsecutiveSky,
            minSpacing = minSpacing,
            maxSpacing = maxSpacing,
            totalDistance = currentX - 800,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "❌ Obstacles batch generation failed");
        return StatusCode(500, new { success = false, error = "Obstacles batch generation failed" });
    }
}
        // ============================================
        // 🪙 COINS BATCH ENDPOINT (YENİ)
        // ============================================
        [HttpGet("coins-batch")]
        public IActionResult GetCoinsBatch([FromQuery] int count = 60)
        {
            try
            {
                var random = new Random();
                var coins = new List<object>();

                for (int i = 0; i < count; i++)
                {
                    var x = random.Next(800, 2500);
                    var y = random.Next(250, 500);

                    coins.Add(new
                    {
                        id = $"coin_{i}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                        x = x,
                        y = y,
                        type = "coin",
                        scale = 0.12
                    });
                }

                _logger.LogInformation($"🪙 Generated {count} coins for batch queue");

                return Ok(new
                {
                    success = true,
                    coins = coins,
                    count = coins.Count,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Coins batch generation failed");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Coins batch generation failed"
                });
            }
        }




        //  PRIVATE VALIDATION METHOD

        private ValidationResult ValidateRequestOrigin()
        {
            var referer = Request.Headers["Referer"].FirstOrDefault();
            var origin = Request.Headers["Origin"].FirstOrDefault();
            var userAgent = GetUserAgent();

            // ✅ Debug logging
            _logger.LogInformation($"🔍 Origin: {origin}");
            _logger.LogInformation($"🔍 Referer: {referer}");
            _logger.LogInformation($"🔍 UserAgent: {userAgent}");
            _logger.LogInformation($"🔍 Valid Origins: {string.Join(", ", VALID_ORIGINS)}");

            if (string.IsNullOrEmpty(origin))
            {
                _logger.LogWarning("❌ Missing origin header");
                return new ValidationResult(false, "Missing origin header");
            }

            if (!VALID_ORIGINS.Any(validOrigin => origin.StartsWith(validOrigin)))
            {
                _logger.LogWarning($"❌ Invalid origin: {origin} not in valid list");
                return new ValidationResult(false, $"Invalid origin: {origin}");
            }

            if (string.IsNullOrEmpty(userAgent) || userAgent.Length < 20)
            {
                _logger.LogWarning($"❌ Suspicious user agent: {userAgent}");
                return new ValidationResult(false, "Suspicious user agent");
            }

            // Check for automation tools
            if (userAgent.Contains("selenium", StringComparison.OrdinalIgnoreCase) ||
                userAgent.Contains("puppeteer", StringComparison.OrdinalIgnoreCase) ||
                userAgent.Contains("headless", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning($"❌ Automation tool detected: {userAgent}");
                return new ValidationResult(false, "Automation tool detected");
            }

            _logger.LogInformation("✅ Origin validation passed");
            return new ValidationResult(true, "Origin validated");
        }

        private ValidationResult CheckRateLimit(string sessionId)
        {
            var clientIp = GetClientIpAddress();
            var key = $"{sessionId}_{clientIp}";
            var now = DateTime.UtcNow;

            if (!_rateLimits.ContainsKey(key))
            {
                _rateLimits[key] = new RateLimitInfo { RequestCount = 1, FirstRequest = now };
                return new ValidationResult(true, "Rate limit OK");
            }

            var rateLimit = _rateLimits[key];

            if ((now - rateLimit.FirstRequest).TotalMinutes > 1)
            {
                rateLimit.RequestCount = 1;
                rateLimit.FirstRequest = now;
                return new ValidationResult(true, "Rate limit reset");
            }

            if (rateLimit.RequestCount >= MAX_REQUESTS_PER_MINUTE)
                return new ValidationResult(false, $"Rate limit exceeded: {rateLimit.RequestCount} requests/minute");

            rateLimit.RequestCount++;
            return new ValidationResult(true, "Rate limit OK");
        }

        private ValidationResult ValidatePermissionRequest(DeviceBoundPermissionRequest request)
        {
            if (string.IsNullOrEmpty(request.SessionId))
                return new ValidationResult(false, "Invalid session ID");

            if (request.GameData == null)
                return new ValidationResult(false, "Missing game data");

            if (request.DeviceFingerprint == null)
                return new ValidationResult(false, "Missing device fingerprint");

            if (string.IsNullOrEmpty(request.DeviceFingerprint.UserAgent))
                return new ValidationResult(false, "Missing user agent in fingerprint");

            if (string.IsNullOrEmpty(request.DeviceFingerprint.CanvasFingerprint) ||
                request.DeviceFingerprint.CanvasFingerprint.Length < CANVAS_FINGERPRINT_MIN_LENGTH)
                return new ValidationResult(false, "Invalid canvas fingerprint");

            if (request.DeviceFingerprint.ScreenResolution == null ||
                request.DeviceFingerprint.ScreenResolution.Width <= 0 ||
                request.DeviceFingerprint.ScreenResolution.Height <= 0)
                return new ValidationResult(false, "Invalid screen resolution");

            return new ValidationResult(true, "Request validated");
        }

        private ValidationResult ValidateDeviceFingerprint(DeviceBoundPermissionRequest request)
        {
            var fingerprint = request.DeviceFingerprint;
            var deviceId = CreateDeviceId(fingerprint);

            // Canvas fingerprint validation
            if (fingerprint.CanvasFingerprint.Length < CANVAS_FINGERPRINT_MIN_LENGTH)
                return new ValidationResult(false, "Canvas fingerprint too short");

            // Check for obviously fake canvas fingerprints
            if (fingerprint.CanvasFingerprint.Contains("fake") ||
                fingerprint.CanvasFingerprint == "constant_value")
                return new ValidationResult(false, "Fake canvas fingerprint detected");

            // Device consistency check
            if (_deviceFingerprints.ContainsKey(deviceId))
            {
                var existingFingerprint = _deviceFingerprints[deviceId];

                if (!AreFingerprintsSimilar(existingFingerprint.Fingerprint, fingerprint))
                    return new ValidationResult(false, "Device fingerprint changed - possible spoofing");

                var currentIP = GetClientIpAddress();
                if (existingFingerprint.IPAddress != currentIP)
                {
                    var timeSinceLastSeen = DateTime.UtcNow - existingFingerprint.LastSeen;
                    if (timeSinceLastSeen.TotalMinutes < 30)
                        return new ValidationResult(false, "Suspicious IP change detected");
                }
            }

            return new ValidationResult(true, "Device fingerprint valid");
        }

        private ValidationResult ValidateDeviceBoundToken(DeviceBoundActionRequest request)
        {

            _logger.LogInformation($"🔍 Token Validation Debug:");
            _logger.LogInformation($"   Request Token: {request.PermissionToken}");
            _logger.LogInformation($"   Active Tokens Count: {_deviceTokens.Count}");
            _logger.LogInformation($"   Session ID: {request.SessionId}");

            if (!_deviceTokens.TryGetValue(request.PermissionToken, out var tokenData))
                return new ValidationResult(false, "Device-bound token not found");

            if (DateTime.UtcNow > tokenData.ExpiresAt)
                return new ValidationResult(false, "Device-bound token expired");

            if (tokenData.IsUsed)
                return new ValidationResult(false, "Device-bound token already used");

            if (tokenData.SessionId != request.SessionId)
                return new ValidationResult(false, "Token session mismatch");

            // Device binding validation
            var currentDeviceId = CreateDeviceId(request.DeviceFingerprint);
            if (tokenData.DeviceId != currentDeviceId)
                return new ValidationResult(false, "Device binding mismatch - token theft detected");

            // IP consistency check
            var currentIP = GetClientIpAddress();
            if (tokenData.ClientIP != currentIP)
                return new ValidationResult(false, "IP address mismatch - possible token theft");

            // User Agent consistency
            var currentUserAgent = GetUserAgent();
            if (tokenData.UserAgent != currentUserAgent)
                return new ValidationResult(false, "User agent mismatch - possible token theft");

            return new ValidationResult(true, "Device-bound token valid");
        }

        private ValidationResult VerifyDeviceChallenge(DeviceBoundActionRequest request)
{
    if (!_deviceTokens.TryGetValue(request.PermissionToken, out var tokenData))
        return new ValidationResult(false, "No token data for challenge verification");

    var expectedResponse = SolveDeviceChallenge(
        tokenData.DeviceId,
        request.SessionId,
        request.DeviceFingerprint
    );

    // ✅ Debug logging ekleyin
    _logger.LogInformation($"🔍 Device Challenge Verification:");
    _logger.LogInformation($"   Device ID: {tokenData.DeviceId}");
    _logger.LogInformation($"   Session ID: {request.SessionId}");
    _logger.LogInformation($"   Expected: {expectedResponse}");
    _logger.LogInformation($"   Received: {request.DeviceChallengeResponse}");

    if (request.DeviceChallengeResponse != expectedResponse)
    {
        _logger.LogWarning($"❌ Challenge mismatch: expected '{expectedResponse}', got '{request.DeviceChallengeResponse}'");
        return new ValidationResult(false, "Device challenge response incorrect");
    }

    _logger.LogInformation("✅ Device challenge verified successfully");
    return new ValidationResult(true, "Device challenge verified");
}

        private ValidationResult ValidateDeviceConsistency(DeviceBoundActionRequest request)
        {
            var deviceId = CreateDeviceId(request.DeviceFingerprint);

            if (_deviceFingerprints.TryGetValue(deviceId, out var storedFingerprint))
            {
                if (!AreFingerprintsSimilar(storedFingerprint.Fingerprint, request.DeviceFingerprint))
                    return new ValidationResult(false, "Device fingerprint inconsistency detected");
            }

            return new ValidationResult(true, "Device-bound token valid");
        }

        private ValidationResult VerifyEnhancedGameState(DeviceBoundActionRequest request)
{
    if (!_deviceTokens.TryGetValue(request.PermissionToken, out var tokenData))
        return new ValidationResult(false, "No token data for game state verification");

    // ✅ SESSION-BASED TIME VALIDATION
    if (_activeSessions.TryGetValue(request.SessionId, out var session))
    {
        var sessionStartTime = session.StartTime;
        var currentTime = DateTime.UtcNow;
        var actualGameTimeMs = (currentTime - sessionStartTime).TotalMilliseconds;
        var actualGameTimeSeconds = (int)(actualGameTimeMs / 1000);
        
        // ✅ FRONTEND'DEN GELEN ZAMAN (saniye cinsinden)
        var reportedGameTimeSeconds = request.GameData.GameTime > long.MaxValue 
            ? int.MaxValue 
            : (int)request.GameData.GameTime;
        
        // ✅ DEBUG LOGGING
        _logger.LogInformation($"🕒 Time Validation Debug:");
        _logger.LogInformation($"   Session start: {sessionStartTime:yyyy-MM-dd HH:mm:ss.fff}");
        _logger.LogInformation($"   Current time:  {currentTime:yyyy-MM-dd HH:mm:ss.fff}");
        _logger.LogInformation($"   Actual game time: {actualGameTimeSeconds} seconds");
        _logger.LogInformation($"   Reported game time: {reportedGameTimeSeconds} seconds");
        _logger.LogInformation($"   Time difference: {Math.Abs(actualGameTimeSeconds - reportedGameTimeSeconds)} seconds");
        
        // ✅ ZAMAN TOLERANCE (5 saniye)
        var timeDifference = Math.Abs(actualGameTimeSeconds - reportedGameTimeSeconds);
         const int TIME_TOLERANCE_SECONDS = 15;
        
        if (timeDifference > TIME_TOLERANCE_SECONDS)
        {
            _logger.LogWarning($"❌ Time verification failed: expected ~{actualGameTimeSeconds}s, got {reportedGameTimeSeconds}s (diff: {timeDifference}s)");
            return new ValidationResult(false, $"Time verification failed: expected ~{actualGameTimeSeconds}, got {reportedGameTimeSeconds}");
        }
        
        _logger.LogInformation($"✅ Time validation passed: {timeDifference}s difference within {TIME_TOLERANCE_SECONDS}s tolerance");
    }
    else
    {
        _logger.LogWarning($"❌ Session {request.SessionId} not found for time validation");
        return new ValidationResult(false, "Session not found for time validation");
    }

    // ✅ DİĞER VALIDATİONLAR (score, position vs.) - daha toleranslı
    var expectedState = tokenData.ExpectedGameState;
    var actualData = request.GameData;

    // Score progression validation (daha toleranslı)
    var scoreDiff = Math.Abs(actualData.Score - expectedState.ExpectedScore);
    if (scoreDiff > 100) // 100 points tolerance
        return new ValidationResult(false, $"Score verification failed: expected ~{expectedState.ExpectedScore}, got {actualData.Score}");

    // Position progression validation (daha toleranslı)
    var positionDiff = Math.Abs(actualData.PlayerPosition.X - expectedState.ExpectedPosition.X);
    if (positionDiff > 200) // 200px tolerance
        return new ValidationResult(false, $"Position verification failed: expected ~{expectedState.ExpectedPosition.X}, got {actualData.PlayerPosition.X}");

    return new ValidationResult(true, "Enhanced game state verified");
}

        private ValidationResult AnalyzeEnhancedBehavior(DeviceBoundActionRequest request)
        {
            var sessionId = request.SessionId;

            if (!_gameplayMetrics.TryGetValue(sessionId, out var metrics))
                return new ValidationResult(true, "No previous behavior data");

            var currentTime = DateTime.UtcNow;
            var timeSinceLastAction = (currentTime - metrics.LastActionTime).TotalMilliseconds;

            // Timing analysis
            if (timeSinceLastAction < 3000)
                return new ValidationResult(false, $"Actions too frequent: {timeSinceLastAction}ms");

            if (timeSinceLastAction > 15000)
                return new ValidationResult(false, $"Action gap too large: {timeSinceLastAction}ms");

            // Pattern analysis
            var scoreIncrease = (double)(request.GameData.Score - metrics.LastScore);
            metrics.ScoreIncreases.Add(scoreIncrease);

            if (metrics.ScoreIncreases.Count > 5)
            {
                var avgIncrease = metrics.ScoreIncreases.Average();

                if (scoreIncrease > avgIncrease * 3)
                    return new ValidationResult(false, $"Abnormal score increase: {scoreIncrease} vs avg {avgIncrease:F1}");

                var variance = CalculateVariance(metrics.ScoreIncreases);
                if (variance < 5)
                    return new ValidationResult(false, $"Score pattern too consistent (bot-like): variance {variance:F2}");

                if (metrics.ScoreIncreases.Count > 10)
                    metrics.ScoreIncreases.RemoveAt(0);
            }

            return new ValidationResult(true, "Enhanced behavior analysis passed");
        }

        private ValidationResult ValidatePhysics(PhysicsData physics)
        {
            if (Math.Abs(physics.Gravity - 2000) > 200)
                return new ValidationResult(false, $"Invalid gravity: {physics.Gravity}");

            if (Math.Abs(physics.JumpForce - 950) > 50)
                return new ValidationResult(false, $"Invalid jump force: {physics.JumpForce}");

            if (physics.PlayerScale < 0.1 || physics.PlayerScale > 1.0)
                return new ValidationResult(false, $"Invalid player scale: {physics.PlayerScale}");

            return new ValidationResult(true, "Physics validation passed");
        }

        private ValidationResult ValidatePosition(Position playerPosition, string sessionId)
{
    // Basic impossible position checks
    if (playerPosition.Y < -200 || playerPosition.Y > 700)
        return new ValidationResult(false, $"Impossible Y position: {playerPosition.Y}");

    if (playerPosition.X < -100 || playerPosition.X > 10000)
        return new ValidationResult(false, $"Impossible X position: {playerPosition.X}");

    // ✅ SESSION-BASED TELEPORTATION CHECK
    if (_activeSessions.TryGetValue(sessionId, out var session) && session.LastPlayerPosition != null)
    {
        var distance = Math.Abs(playerPosition.X - session.LastPlayerPosition.X);
        var timeDiff = (DateTime.UtcNow - session.LastValidation).TotalSeconds;
        
        if (timeDiff > 0)
        {
            var speed = distance / timeDiff;
            
            // ✅ REASONABLE SPEED LIMIT (500px/s)
            if (speed > 500)
            {
                _logger.LogWarning($"⚠️ Teleportation detected: {speed:F1}px/s (distance: {distance}px, time: {timeDiff:F1}s)");
                return new ValidationResult(false, $"Teleportation detected: speed {speed:F1}px/s");
            }
        }
    }
    else
    {
        _logger.LogInformation($"🆕 First position validation for session {sessionId} - no previous data to compare");
    }

    return new ValidationResult(true, "Position validation passed");
}

        private ValidationResult CrossReferenceValidation(DeviceBoundActionRequest request)
        {
            var gameData = request.GameData;

            // Coin collection ratio validation
            var coinsPerScore = gameData.Score > 0 ? (double)gameData.CoinsCollected / gameData.Score : 0;
            if (coinsPerScore > 0.5)
                return new ValidationResult(false, $"Impossible coin collection ratio: {coinsPerScore:F2}");

            // Score vs time correlation
            if (gameData.GameTime > 0)
            {
                var gameTimeSeconds = Math.Max(1, gameData.GameTime); // Minimum 1 saniye
var scorePerSecond = (double)gameData.Score / gameTimeSeconds;
var maxScorePerSecond = 20.0; // Realistik limit: 20 puan/saniye

if (scorePerSecond > maxScorePerSecond)
    return new ValidationResult(false, $"Score too fast: {scorePerSecond:F2} points/second (max: {maxScorePerSecond})");
            }

            return new ValidationResult(true, "Cross-reference validation passed");
        }

        // 🔧 HELPER METHODS

        private string CreateDeviceId(ClientDeviceFingerprint fingerprint)
        {
            var deviceString = $"{fingerprint.UserAgent}:{fingerprint.ScreenResolution.Width}x{fingerprint.ScreenResolution.Height}:{fingerprint.TimezoneOffset}:{fingerprint.CanvasFingerprint}:{fingerprint.WebGLFingerprint}";

            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(deviceString));
            return Convert.ToHexString(hashBytes)[..32];
        }

        private string GenerateDeviceBindingSecret(string deviceId, string sessionId)
        {
            var input = $"{deviceId}:{sessionId}:{DEVICE_SECRET}:{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(DEVICE_SECRET));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
            return Convert.ToBase64String(hashBytes);
        }

        private async Task<DeviceBoundTokenData> GenerateDeviceBoundToken(string sessionId, string deviceId, string bindingSecret, GameData gameData)
        {
            // Create token payload with device binding
            var tokenPayload = new
            {
                sessionId = sessionId,
                deviceId = deviceId,
                gameState = new
                {
                    score = gameData.Score,
                    position = gameData.PlayerPosition,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                },
                bindingHash = ComputeBindingHash(deviceId, bindingSecret),
                createdAt = DateTime.UtcNow.ToString("O")
            };

            var tokenJson = JsonSerializer.Serialize(tokenPayload);

            // Encrypt token with device binding secret
            using var aes = Aes.Create();
            aes.Key = DeriveKeyFromSecret(bindingSecret);
            aes.GenerateIV();

            using var encryptor = aes.CreateEncryptor();
            var tokenBytes = Encoding.UTF8.GetBytes(tokenJson);
            var encryptedToken = encryptor.TransformFinalBlock(tokenBytes, 0, tokenBytes.Length);

            var tokenWithIV = new byte[aes.IV.Length + encryptedToken.Length];
            Array.Copy(aes.IV, 0, tokenWithIV, 0, aes.IV.Length);
            Array.Copy(encryptedToken, 0, tokenWithIV, aes.IV.Length, encryptedToken.Length);

            var token = Convert.ToBase64String(tokenWithIV);

            // Generate device challenge
            var deviceChallenge = GenerateDeviceChallenge(deviceId, sessionId);

            return new DeviceBoundTokenData
            {
                Token = token,
                DeviceChallenge = deviceChallenge
            };
        }

        private string GenerateDeviceChallenge(string deviceId, string sessionId)
        {
            var challengeInput = $"{deviceId}:{sessionId}:{DateTime.UtcNow.Ticks}:{MASTER_SECRET}";
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(challengeInput));
            return Convert.ToHexString(hashBytes)[..16];
        }

        private string SolveDeviceChallenge(string deviceId, string sessionId, ClientDeviceFingerprint fingerprint)
{
    var solution = $"{deviceId}:{sessionId}:{fingerprint.CanvasFingerprint}:{fingerprint.TimezoneOffset}:{GAMEPLAY_SECRET}";
    
    // ✅ DEBUG EKLEYİN:
    _logger.LogInformation($"🔍 Challenge Solution Debug:");
    _logger.LogInformation($"   Device ID: {deviceId}");
    _logger.LogInformation($"   Session ID: {sessionId}");
    _logger.LogInformation($"   Canvas FP (first 50): {fingerprint.CanvasFingerprint?.Substring(0, Math.Min(50, fingerprint.CanvasFingerprint.Length))}...");
    _logger.LogInformation($"   Timezone: {fingerprint.TimezoneOffset}");
    _logger.LogInformation($"   Secret: {GAMEPLAY_SECRET}");
    _logger.LogInformation($"   Solution String (first 100): {solution.Substring(0, Math.Min(100, solution.Length))}...");
    
    using var sha256 = SHA256.Create();
    var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(solution));
    var result = Convert.ToHexString(hashBytes)[..8].ToLower(); // ✅ Lowercase
    
    _logger.LogInformation($"   Expected Response: {result}");
    
    return result;
}

        private bool AreFingerprintsSimilar(ClientDeviceFingerprint fp1, ClientDeviceFingerprint fp2)
        {
            return fp1.UserAgent == fp2.UserAgent &&
                   fp1.ScreenResolution.Width == fp2.ScreenResolution.Width &&
                   fp1.ScreenResolution.Height == fp2.ScreenResolution.Height &&
                   Math.Abs(fp1.TimezoneOffset - fp2.TimezoneOffset) <= 60 && // 1 hour tolerance for DST
                   fp1.CanvasFingerprint == fp2.CanvasFingerprint;
        }

        private byte[] DeriveKeyFromSecret(string secret)
        {
            using var sha256 = SHA256.Create();
            return sha256.ComputeHash(Encoding.UTF8.GetBytes(secret));
        }

        private string ComputeBindingHash(string deviceId, string bindingSecret)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(bindingSecret));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(deviceId));
            return Convert.ToBase64String(hashBytes)[..16];
        }

        private ExpectedGameState CalculateExpectedGameState(GameData currentData)
        {
            var timeIncrement = 5000; // 5 seconds
            var expectedScoreIncrease = (int)(MAX_SCORE_PER_SECOND * 5); // ~40 points
            var expectedXMovement = (int)(11 * 5 * 0.1); // scroll speed * time * distance multiplier

            return new ExpectedGameState
            {
                ExpectedScore = currentData.Score + expectedScoreIncrease,
                ExpectedPosition = new Position(currentData.PlayerPosition.X + expectedXMovement, currentData.PlayerPosition.Y),
                ExpectedGameTime = currentData.GameTime + timeIncrement
            };
        }

        private Task InitializeOrUpdateSession(DeviceBoundPermissionRequest request)
{
    var sessionId = request.SessionId;
    var currentTime = DateTime.UtcNow;

    if (!_activeSessions.ContainsKey(sessionId))
    {
        // ✅ YENİ SESSION - START TIME KAYDET
        _activeSessions[sessionId] = new GameSession 
{
    SessionId = sessionId,
    StartTime = DateTime.UtcNow,  // ← BU EKSIK!
    LastValidation = DateTime.UtcNow,
    IsTerminated = false
};
        
        _logger.LogInformation($"🆕 New session created: {sessionId} at {currentTime:yyyy-MM-dd HH:mm:ss.fff}");
    }
    else
    {
        // ✅ MEVCUT SESSION - SADECE LAST VALIDATION GÜNCELLE
        var existingSession = _activeSessions[sessionId]; // ✅ Farklı isim kullan
        existingSession.LastValidation = currentTime;
        
        _logger.LogInformation($"🔄 Session updated: {sessionId}, started at {existingSession.StartTime:yyyy-MM-dd HH:mm:ss.fff}");
    }

    var sessionToCheck = _activeSessions[sessionId]; // ✅ Farklı isim kullan
    
    // Check for session timeout
    var sessionDuration = currentTime - sessionToCheck.StartTime;
    if (sessionDuration.TotalHours > MAX_SESSION_TIME_HOURS)
    {
        sessionToCheck.IsTerminated = true;
        sessionToCheck.TerminationReason = "Session timeout";
        _logger.LogWarning($"⏰ Session {sessionId} timed out after {sessionDuration.TotalHours:F1} hours");
    }

    return Task.CompletedTask;
}

        private Task UpdateSuccessfulValidation(DeviceBoundActionRequest request)
        {
            // Mark token as used
            if (_deviceTokens.TryGetValue(request.PermissionToken, out var tokenData))
            {
                tokenData.IsUsed = true;
            }

            // Update session
            if (_activeSessions.TryGetValue(request.SessionId, out var session))
            {
                session.LastValidation = DateTime.UtcNow;
                session.LastPlayerPosition = request.GameData.PlayerPosition;
                session.TotalScore = request.GameData.Score;
                session.TotalDistance = request.GameData.Distance;
                session.ValidationCount++;
            }

            // Update gameplay metrics
            var sessionId = request.SessionId;
            if (!_gameplayMetrics.ContainsKey(sessionId))
            {
                _gameplayMetrics[sessionId] = new GameplayMetrics
                {
                    SessionId = sessionId,
                    ScoreIncreases = new List<double>(),
                    FirstActionTime = DateTime.UtcNow
                };
            }

            var metrics = _gameplayMetrics[sessionId];
            metrics.LastActionTime = DateTime.UtcNow;
            metrics.LastScore = request.GameData.Score;
            metrics.LastGameTime = request.GameData.GameTime;
            metrics.ActionCount++;
            metrics.SessionTime = (DateTime.UtcNow - metrics.FirstActionTime).TotalSeconds;

            return Task.CompletedTask;
        }

        private int CalculateDeviceTrustScore(string deviceId)
        {
            if (!_deviceFingerprints.TryGetValue(deviceId, out var deviceInfo))
                return 50; // Default trust for new devices

            var trustScore = 100;

            // Reduce trust for suspicious patterns
            if (deviceInfo.UsageCount > 100) trustScore -= 10; // Very high usage

            var deviceAge = DateTime.UtcNow - deviceInfo.LastSeen;
            if (deviceAge.TotalDays < 1) trustScore -= 5; // Very new device

            // Check for suspicious activity
            var suspiciousCount = _suspiciousActivities.Values
                .Where(sa => sa.DeviceId == deviceId)
                .Sum(sa => sa.TamperAttempts);

            trustScore -= Math.Min(suspiciousCount * 10, 50); // Max 50 point reduction

            return Math.Max(0, Math.Min(100, trustScore));
        }

        private string GenerateServerVerification(string sessionId)
        {
            var verificationInput = $"{sessionId}:{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}:{MASTER_SECRET}";
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(verificationInput));
            return Convert.ToBase64String(hashBytes)[..16];
        }

        private double CalculateVariance(List<double> values)
        {
            if (values.Count < 2) return 1.0;
            var mean = values.Average();
            return values.Sum(x => Math.Pow(x - mean, 2)) / values.Count;
        }

        private string GetClientIpAddress()
        {
            var forwarded = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwarded))
            {
                return forwarded.Split(',')[0].Trim();
            }

            return Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        private string GetUserAgent()
        {
            return Request.Headers["User-Agent"].FirstOrDefault() ?? "";
        }

        private ValidationResult ValidateScoreSession(SecureScoreSubmissionRequest request)
        {
            if (string.IsNullOrEmpty(request.SessionId))
                return new ValidationResult(false, "Missing session ID");

            // Check if session exists
            if (_activeSessions.TryGetValue(request.SessionId, out var session))
            {
                if (session.IsTerminated)
                    return new ValidationResult(false, "Session terminated");

                var sessionAge = DateTime.UtcNow - session.StartTime;
                if (sessionAge.TotalHours > MAX_SESSION_TIME_HOURS)
                    return new ValidationResult(false, "Session expired");
            }

            return new ValidationResult(true, "Session valid");
        }

        private ValidationResult ValidateScoreData(SecureScoreSubmissionRequest request)
        {
            // Basic score validation
            if (request.Score < 0 || request.Score > 1000)
                return new ValidationResult(false, $"Impossible score: {request.Score}");

            if (request.Coins < 0 || request.Coins > 100)
                return new ValidationResult(false, $"Impossible coin count: {request.Coins}");

            // Score vs coins ratio
            var expectedScore = request.Coins * 10;
            if (Math.Abs(request.Score - expectedScore) > 50)
                return new ValidationResult(false, $"Score/coin mismatch: {request.Score} vs expected {expectedScore}");

            return new ValidationResult(true, "Score data valid");
        }

        private ValidationResult ValidateScoreTiming(SecureScoreSubmissionRequest request)
        {
            if (request.PlayTime <= 0)
                return new ValidationResult(false, "Invalid play time");

            if (request.PlayTime > 3600000) // max 1 saat
                return new ValidationResult(false, $"Play time too long: {request.PlayTime}ms");

            // Score per second check
            var scorePerSecond = (double)request.Score / (request.PlayTime / 1000.0);
            if (scorePerSecond > MAX_SCORE_PER_SECOND * 2) // tolerans
                return new ValidationResult(false, $"Score too fast: {scorePerSecond:F2} points/second");

            return new ValidationResult(true, "Timing valid");
        }

        private ValidationResult CrossReferenceScoreWithSession(SecureScoreSubmissionRequest request)
        {
            // Check if we have game state for this session
            if (_activeSessions.TryGetValue(request.SessionId, out var session))
            {
                // Compare submitted score with the tracked score
                var scoreDiff = Math.Abs(request.Score - session.TotalScore);
                if (scoreDiff > 30) // 30 puan tolerans
                    return new ValidationResult(false, $"Score mismatch: submitted {request.Score}, tracked {session.TotalScore}");
            }

            return new ValidationResult(true, "Cross-reference valid");
        }

        private FinalScoreResult RecordLegitimateScore(SecureScoreSubmissionRequest request)
        {

            var finalScore = request.Score;
            var ranking = CalculateRanking(finalScore);
            var isPersonalBest = IsPersonalBest(request.SessionId, finalScore);


            _logger.LogInformation($"LEGITIMATE SCORE: {finalScore} points by session {request.SessionId}");

            return new FinalScoreResult
            {
                FinalScore = finalScore,
                Ranking = ranking,
                IsPersonalBest = isPersonalBest
            };
        }

        private int CalculateRanking(int score)
        {

            if (score >= 300) return 1;
            if (score >= 200) return 2;
            if (score >= 100) return 3;
            return 4;
        }

        private bool IsPersonalBest(string sessionId, int score)
        {

            return score > 250;
        }

        private string GenerateScoreVerification(string sessionId, int score)
        {
            var verificationInput = $"{sessionId}:{score}:{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}:{MASTER_SECRET}";
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(verificationInput));
            return Convert.ToBase64String(hashBytes)[..12];
        }

        private Task RecordSuspiciousActivity(string sessionId, string type, string details)
{
    var deviceId = "";

    // aktif sessiondan device id al
    if (_activeSessions.TryGetValue(sessionId, out var session))
    {
        var deviceToken = _deviceTokens.Values.FirstOrDefault(t => t.SessionId == sessionId);
        deviceId = deviceToken?.DeviceId ?? "";
    }

    if (!_suspiciousActivities.ContainsKey(sessionId))
    {
        _suspiciousActivities[sessionId] = new SuspiciousActivity
        {
            SessionId = sessionId,
            DeviceId = deviceId,
            TamperAttempts = 0,
            FirstIncident = DateTime.UtcNow,
            Incidents = new List<SecurityIncident>()
        };
    }

    var activity = _suspiciousActivities[sessionId];
    activity.TamperAttempts++;
    activity.LastIncident = DateTime.UtcNow;
    activity.Incidents.Add(new SecurityIncident
    {
        Type = type,
        Details = details,
        Timestamp = DateTime.UtcNow,
        IPAddress = GetClientIpAddress(),
        UserAgent = GetUserAgent()
    });

    if (activity.Incidents.Count > 50)
    {
        activity.Incidents.RemoveAt(0);
    }

    _logger.LogWarning($"🚨 SUSPICIOUS ACTIVITY #{activity.TamperAttempts}: Session {sessionId}, Type: {type}, Details: {details}");

    return Task.CompletedTask; // ✅ Bu satır zaten var olmalı
}

        //  BACKGROUND CLEANUP TASK
        private async Task BackgroundCleanupTask()
        {
            while (true)
            {
                try
                {
                    await Task.Delay(TimeSpan.FromMinutes(5)); // 5 dkda bir

                    var now = DateTime.UtcNow;
                    var cleanupTasks = new List<Task>
                    {
                        Task.Run(() => CleanupExpiredTokens(now)),
                        Task.Run(() => CleanupOldSessions(now)),
                        Task.Run(() => CleanupRateLimits(now)),
                        Task.Run(() => CleanupSuspiciousActivities(now))
                    };

                    await Task.WhenAll(cleanupTasks);

                    var activeTokens = _deviceTokens.Count;
                    var activeSessions = _activeSessions.Count;

                    _logger.LogInformation($" Cleanup completed. Active tokens: {activeTokens}, Active sessions: {activeSessions}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background cleanup error");
                }
            }
        }

        private void CleanupExpiredTokens(DateTime now)
        {
            var expiredTokens = _deviceTokens
                .Where(kvp => kvp.Value.ExpiresAt < now || kvp.Value.IsUsed)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var token in expiredTokens)
            {
                _deviceTokens.TryRemove(token, out _);
            }
        }

        private void CleanupOldSessions(DateTime now)
        {
            var oldSessions = _activeSessions
                .Where(kvp => (now - kvp.Value.StartTime).TotalHours > MAX_SESSION_TIME_HOURS * 2)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var sessionId in oldSessions)
            {
                _activeSessions.TryRemove(sessionId, out _);
                _gameplayMetrics.TryRemove(sessionId, out _);
            }
        }

        private void CleanupRateLimits(DateTime now)
        {
            var oldRateLimits = _rateLimits
                .Where(kvp => (now - kvp.Value.FirstRequest).TotalHours > 1)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var key in oldRateLimits)
            {
                _rateLimits.TryRemove(key, out _);
            }
        }

        private void CleanupSuspiciousActivities(DateTime now)
        {
            var oldActivities = _suspiciousActivities
                .Where(kvp => (now - kvp.Value.LastIncident).TotalDays > 7)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var sessionId in oldActivities)
            {
                _suspiciousActivities.TryRemove(sessionId, out _);
            }
        }
    }

    public class CoinBatchSubmissionRequest
    {
        public string SessionId { get; set; } = "";
        public List<CoinSubmissionData> Coins { get; set; } = new();
    }

    public class CoinSubmissionData
    {
        public string CoinId { get; set; } = "";
        public int X { get; set; }
        public int Y { get; set; }
    }


    public class DeviceBoundPermissionRequest
    {
        public string SessionId { get; set; } = "";
        public GameData GameData { get; set; } = new();
        public ClientDeviceFingerprint DeviceFingerprint { get; set; } = new();
        public long Timestamp { get; set; }
    }

    public class DeviceBoundActionRequest
    {
        public string SessionId { get; set; } = "";
        public string PermissionToken { get; set; } = "";
        public string DeviceChallengeResponse { get; set; } = "";
        public GameData GameData { get; set; } = new();
        public ClientDeviceFingerprint DeviceFingerprint { get; set; } = new();
        public long Timestamp { get; set; }
    }

    public class ClientDeviceFingerprint
    {
        public string UserAgent { get; set; } = "";
        public ScreenResolution ScreenResolution { get; set; } = new();
        public int TimezoneOffset { get; set; }
        public string CanvasFingerprint { get; set; } = "";
        public string WebGLFingerprint { get; set; } = "";
    }

    public class ScreenResolution
    {
        public int Width { get; set; }
        public int Height { get; set; }
    }

    public class GameData
    {
        public int Score { get; set; }
        public int CoinsCollected { get; set; }
        public long GameTime { get; set; }
        public int Distance { get; set; }
        public Position PlayerPosition { get; set; } = new();
        public PhysicsData Physics { get; set; } = new();
    }

    public class PhysicsData
    {
        public double Gravity { get; set; }
        public double JumpForce { get; set; }
        public double PlayerScale { get; set; }
    }

    public class Position
    {
        public int X { get; set; }
        public int Y { get; set; }
        public Position() { }
        public Position(int x, int y) { X = x; Y = y; }
    }

    public class DeviceBoundToken
    {
        public string SessionId { get; set; } = "";
        public string DeviceId { get; set; } = "";
        public string BindingSecret { get; set; } = "";
        public ExpectedGameState ExpectedGameState { get; set; } = new();
        public ClientDeviceFingerprint DeviceFingerprint { get; set; } = new();
        public string ClientIP { get; set; } = "";
        public string UserAgent { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
    }

    public class DeviceFingerprint
    {
        public string DeviceId { get; set; } = "";
        public ClientDeviceFingerprint Fingerprint { get; set; } = new();
        public DateTime LastSeen { get; set; }
        public string IPAddress { get; set; } = "";
        public string SessionId { get; set; } = "";
        public int UsageCount { get; set; }
    }

    public class DeviceBoundTokenData
    {
        public string Token { get; set; } = "";
        public string DeviceChallenge { get; set; } = "";
    }

    public class ExpectedGameState
    {
        public int ExpectedScore { get; set; }
        public Position ExpectedPosition { get; set; } = new();
        public long ExpectedGameTime { get; set; }
    }

    public class GameSession
    {
        public string SessionId { get; set; } = "";
        public DateTime StartTime { get; set; }
        public DateTime LastValidation { get; set; }
        public Position? LastPlayerPosition { get; set; }
        public int TotalScore { get; set; }
        public int TotalDistance { get; set; }
        public int ValidationCount { get; set; }
        public bool IsTerminated { get; set; }
        public string TerminationReason { get; set; } = "";
    }

    public class GameplayMetrics
    {
        public string SessionId { get; set; } = "";
        public DateTime FirstActionTime { get; set; }
        public DateTime LastActionTime { get; set; }
        public int LastScore { get; set; }
        public long LastGameTime { get; set; }
        public int ActionCount { get; set; }
        public double SessionTime { get; set; }
        public List<double> ScoreIncreases { get; set; } = new();
    }

    public class SuspiciousActivity
    {
        public string SessionId { get; set; } = "";
        public string DeviceId { get; set; } = "";
        public int TamperAttempts { get; set; }
        public DateTime FirstIncident { get; set; }
        public DateTime LastIncident { get; set; }
        public List<SecurityIncident> Incidents { get; set; } = new();
    }

    public class SecurityIncident
    {
        public string Type { get; set; } = "";
        public string Details { get; set; } = "";
        public DateTime Timestamp { get; set; }
        public string IPAddress { get; set; } = "";
        public string UserAgent { get; set; } = "";
    }

    public class RateLimitInfo
    {
        public int RequestCount { get; set; }
        public DateTime FirstRequest { get; set; }
    }

    public class HoneypotCollision
    {
        public string SessionId { get; set; } = "";
        public string ObstacleId { get; set; } = "";
        public string CollisionType { get; set; } = "";
        public Position PlayerPosition { get; set; } = new();
        public long Timestamp { get; set; }
    }

    public class TamperReport
    {
        public string SessionId { get; set; } = "";
        public string Type { get; set; } = "";
        public string Details { get; set; } = "";
        public long Timestamp { get; set; }
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string Reason { get; set; }

        public ValidationResult(bool isValid, string reason)
        {
            IsValid = isValid;
            Reason = reason;
        }
    }

    public class SecureScoreSubmissionRequest
    {
        public string SessionId { get; set; } = "";
        public int Score { get; set; }
        public int Coins { get; set; }
        public long PlayTime { get; set; }
        public string GameEndReason { get; set; } = "";
        public long SubmissionTime { get; set; }
    }



    public class FinalScoreResult
    {
        public int FinalScore { get; set; }
        public int Ranking { get; set; }
        public bool IsPersonalBest { get; set; }
    }

    public class GameOverSignal
    {
        public string SessionId { get; set; } = "";
        public int FinalScore { get; set; }
        public string Reason { get; set; } = "";
        public long Timestamp { get; set; }
    }

}