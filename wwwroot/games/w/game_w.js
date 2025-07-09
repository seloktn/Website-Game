// 🔐 DEVICE FINGERPRINTING SYSTEM 
class DeviceFingerprintManager {
    constructor() {
        this.fingerprint = null;
        this.canvasFingerprint = null;
        this.webglFingerprint = null;

        console.log('🔐 DeviceFingerprintManager initializing...');
        this.generateDeviceFingerprint();
    }

    // Canvas fingerprinting - benzersiz canvas çizimi
    generateCanvasFingerprint() {
        try {
            console.log('🎨 Generating canvas fingerprint...');

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;

            // Benzersiz çizim pattern'i
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';

            // Arka plan
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(10, 10, 100, 20);

            // Text layer 1
            ctx.fillStyle = '#4ecdc4';
            ctx.fillText('Wizard fingerprint test 🔒', 15, 15);

            // Text layer 2
            ctx.fillStyle = '#45b7d1';
            ctx.fillText('Security check ✓', 15, 30);

            const fingerprint = canvas.toDataURL();
            console.log(`✅ Canvas fingerprint generated (${fingerprint.length} chars)`);
            return fingerprint;

        } catch (error) {
            console.warn('⚠️ Canvas fingerprinting failed:', error);
            return 'canvas_unavailable_' + Date.now();
        }
    }

    // WebGL fingerprinting - GPU bilgileri
    generateWebGLFingerprint() {
        try {
            console.log('🖥️ Generating WebGL fingerprint...');

            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) {
                console.warn('⚠️ WebGL not available');
                return 'webgl_unavailable';
            }

            // GPU bilgilerini topla
            const info = {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
            };

            const fingerprint = btoa(JSON.stringify(info)).substring(0, 32);
            console.log('✅ WebGL fingerprint generated:', fingerprint);
            return fingerprint;

        } catch (error) {
            console.warn('⚠️ WebGL fingerprinting failed:', error);
            return 'webgl_error_' + Date.now();
        }
    }

    // Ana device fingerprint oluşturma
    generateDeviceFingerprint() {
        console.log('🔐 Generating complete device fingerprint...');

        // Alt sistemleri çalıştır
        this.canvasFingerprint = this.generateCanvasFingerprint();
        this.webglFingerprint = this.generateWebGLFingerprint();

        // Tüm device bilgilerini topla
        this.fingerprint = {
            userAgent: navigator.userAgent,
            screenResolution: {
                width: screen.width,
                height: screen.height
            },
            timezoneOffset: new Date().getTimezoneOffset(),
            canvasFingerprint: this.canvasFingerprint,
            webGLFingerprint: this.webglFingerprint,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            localStorage: typeof Storage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        console.log('✅ Complete device fingerprint generated:');
        console.log('📱 Platform:', this.fingerprint.platform);
        console.log('📺 Screen:', `${this.fingerprint.screenResolution.width}x${this.fingerprint.screenResolution.height}`);
        console.log('🌍 Timezone:', this.fingerprint.timezone);
        console.log('🎨 Canvas length:', this.fingerprint.canvasFingerprint.length);
        console.log('🖥️ WebGL:', this.fingerprint.webGLFingerprint);
    }

    // Frontend için fingerprint al
    getFingerprint() {
        return this.fingerprint;
    }

    // Backend için uyumlu format
    getBackendCompatibleFingerprint() {
        if (!this.fingerprint) {
            console.error('❌ Fingerprint not generated yet');
            return null;
        }

        return {
            UserAgent: this.fingerprint.userAgent,
            ScreenResolution: {
                Width: this.fingerprint.screenResolution.width,
                Height: this.fingerprint.screenResolution.height
            },
            TimezoneOffset: this.fingerprint.timezoneOffset,
            CanvasFingerprint: this.fingerprint.canvasFingerprint,
            WebGLFingerprint: this.fingerprint.webGLFingerprint
        };
    }

    // Test metodu
    testFingerprint() {
        console.log('🧪 Testing device fingerprint...');
        console.log('Complete fingerprint:', this.fingerprint);
        console.log('Backend compatible format:', this.getBackendCompatibleFingerprint());

        return true;
    }
}

// Global olarak kullanılabilir hale getir
window.DeviceFingerprintManager = DeviceFingerprintManager;

// 📸 HAFIF WIZARD SNAPSHOT PROTECTION SYSTEM
class WizardSnapshotProtection {
    constructor(gameScene) {
        this.scene = gameScene;
        this.interval = 30000; // 30 saniyede bir (10'dan 30'a çıkarıldı)
        this.snapshotCounter = 0;
        this.isActive = false;
        this.apiClient = null;
        this.developmentMode = true; // Development mode aktif

        console.log("📸 LIGHT Wizard Snapshot Protection initialized");
    }

    setAPIClient(apiClient) {
        this.apiClient = apiClient;
        console.log('🔗 API Client connected to snapshot protection');
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;

        // İlk snapshot'ı çok daha geç al
        setTimeout(() => {
            this.startSnapshotLoop();
        }, 60000); // 60 saniye sonra başla (5'ten 60'a çıkarıldı)

        console.log(`📸 LIGHT Snapshot protection started - First snapshot in 60 seconds`);
        console.log(`📸 Development mode: ${this.developmentMode ? 'ON' : 'OFF'}`);
    }

    startSnapshotLoop() {
        if (!this.isActive) return;

        this.captureAndValidateSnapshot();

        setTimeout(() => {
            this.startSnapshotLoop();
        }, this.interval);
    }

    async captureAndValidateSnapshot() {
        if (!this.scene.gameActive || !this.isActive || !this.apiClient) return;

        try {
            this.snapshotCounter++;
            const snapshot = this.captureGameState();
            console.log(`📸 LIGHT Capturing snapshot #${this.snapshotCounter}:`, snapshot);

            // Development mode'da daha toleranslı
            if (this.developmentMode) {
                // Sadece kritik durumları kontrol et
                if (this.isCriticalViolation(snapshot)) {
                    console.log("🚨 CRITICAL violation detected in development mode");
                    await this.performLightValidation(snapshot);
                } else {
                    console.log(`✅ Development snapshot #${this.snapshotCounter} passed (light check)`);
                }
            } else {
                // Production mode'da normal validation
                await this.performFullValidation(snapshot);
            }

        } catch (error) {
            console.warn("⚠️ Snapshot validation warning (not critical):", error);
            // Hata durumunda oyunu sonlandırma, sadece log
        }
    }

    // Kritik ihlal kontrolü - sadece açık cheat'leri yakala
    isCriticalViolation(snapshot) {
        const gameTime = (Date.now() - this.scene.gameStartTime) / 1000;

        // Kritik durumlar:
        // 1. Score çok hızlı artmış (1 saniyede 100+ puan)
        if (gameTime < 5 && snapshot.score > 100) {
            return true;
        }

        // 2. İmkansız score/time ratio (saniyede 50+ puan)
        if (gameTime > 0 && (snapshot.score / gameTime) > 50) {
            return true;
        }

        // 3. Negatif değerler
        if (snapshot.score < 0 || snapshot.hearts < 0) {
            return true;
        }

        // 4. Can artmış (3'ten fazla)
        if (snapshot.hearts > 3) {
            return true;
        }

        return false; // Kritik değil
    }

    // Hafif validation - sadece backend'e bilgi gönder, oyunu sonlandırma
    async performLightValidation(snapshot) {
        try {
            console.log("🔍 Performing light validation...");

            // Önce permission iste (hata kontrolü ile)
            let permissionResult;
            try {
                permissionResult = await this.apiClient.requestDevicePermission(snapshot);
            } catch (permissionError) {
                console.warn("⚠️ Permission request failed, skipping validation:", permissionError);
                return; // Hata varsa validation'ı atla
            }

            if (!permissionResult || !permissionResult.success) {
                console.warn("⚠️ Permission denied, skipping validation");
                return; // Permission yoksa validation'ı atla
            }

            // Sonra validate et (hata kontrolü ile)
            let validationResult;
            try {
                validationResult = await this.apiClient.validateSecureAction(snapshot);
            } catch (validationError) {
                console.warn("⚠️ Validation request failed:", validationError);
                return; // Hata varsa sessizce devam et
            }

            if (!validationResult || !validationResult.success) {
                console.log("🚨 Light validation failed - logging only (not terminating game)");
                console.log(`Reason: ${validationResult?.reason || 'Unknown'}`);
                console.log(`Cheat Probability: ${validationResult?.cheatProbability || 0}%`);

                // Development mode'da oyunu sonlandırma, sadece uyar
                this.showLightWarning(validationResult?.reason || 'Suspicious activity detected');
            } else {
                console.log(`✅ Light validation passed for snapshot #${this.snapshotCounter}`);
            }

        } catch (error) {
            console.warn("⚠️ Light validation error (continuing game):", error);
            // Hata durumunda oyunu devam ettir
        }
    }

    // Hafif uyarı göster - oyunu sonlandırma
    showLightWarning(reason) {
        try {
            const warningText = this.scene.add.text(
                this.scene.scale.width / 2,
                80,
                `⚠️ Security Warning: ${reason}`,
                {
                    fontSize: '18px',
                    fill: '#ffaa00',
                    align: 'center',
                    fontFamily: 'monospace',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            );
            warningText.setOrigin(0.5);
            warningText.setDepth(9999);

            // 5 saniye sonra kaybolsun
            setTimeout(() => {
                if (warningText && warningText.destroy) {
                    warningText.destroy();
                }
            }, 5000);
        } catch (error) {
            console.warn("Could not show warning text:", error);
        }
    }

    captureGameState() {
        return {
            score: this.scene.score || 0,
            hearts: this.scene.hearts || 3,
            itemsHit: this.scene.itemsHit || 0,
            bombsHit: this.scene.bombsHit || 0,
            gameTime: Date.now() - (this.scene.gameStartTime || Date.now())
        };
    }

    // Oyunu sonlandırma, sadece durdur
    stop() {
        this.isActive = false;
        console.log("📸 Light Snapshot Protection stopped");
    }

    getStatus() {
        return {
            isActive: this.isActive,
            snapshotCount: this.snapshotCounter,
            interval: this.interval / 1000 + 's',
            developmentMode: this.developmentMode,
            type: 'LIGHT_PROTECTION'
        };
    }

    // Development mode toggle
    toggleDevelopmentMode() {
        this.developmentMode = !this.developmentMode;
        console.log(`📸 Development mode: ${this.developmentMode ? 'ON' : 'OFF'}`);
    }
}

// Global access
window.WizardSnapshotProtection = WizardSnapshotProtection;

// 🍯 INVISIBLE HONEYPOT DETECTION SYSTEM
class WizardHoneypot {
    constructor(gameScene) {
        this.scene = gameScene;
        this.invisibleObstacles = new Set();
        this.expectedCollisions = new Set();
        this.actualCollisions = new Set();
        this.suspiciousActivity = [];
        this.collisionlessCount = 0;
        this.sessionId = null;

        console.log("🍯 Wizard Honeypot system initialized");
    }

    setSessionId(sessionId) {
        this.sessionId = sessionId;
        console.log(`🍯 Honeypot session set: ${sessionId}`);
    }

    // Görünmez engel oluştur
    createInvisibleObstacle(x, y, type = 'invisible') {
        const obstacleId = `honeypot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        console.log(`🍯 Creating invisible obstacle: ${obstacleId} at (${x}, ${y})`);

        // Görünmez obstacle oluştur
        const invisible = this.scene.add.rectangle(x, y, 40, 60, 0x000000, 0);
        this.scene.physics.add.existing(invisible);
        invisible.body.setImmovable(true);
        invisible.body.allowGravity = false;
        invisible.setVisible(false); // Görünmez

        invisible.honeypotId = obstacleId;
        invisible.honeypotType = type;
        invisible.expectedHit = true;
        invisible.hasPassed = false;

        // Collision handler ekle
        this.scene.physics.add.overlap(this.scene.arrows, invisible, (arrow, obstacle) => {
            console.log(`💥 Honeypot collision: ${obstacle.honeypotId}`);
            this.onHoneypotCollision(obstacle.honeypotId, obstacle.honeypotType);
        });

        this.invisibleObstacles.add(invisible);
        this.expectedCollisions.add(obstacleId);

        console.log(`🍯 Total invisible obstacles: ${this.invisibleObstacles.size}`);

        return invisible;
    }

    // Strategik honeypot yerleştirme
    placeStrategicHoneypots() {
        console.log("🔍 Placing strategic honeypots...");

        if (!this.scene.bombs || !this.scene.items) {
            console.log("❌ Game objects not ready for honeypot placement");
            return;
        }

        // Bombalar ve itemlar arasına honeypot yerleştir
        const allObjects = [
            ...this.scene.bombs.children.entries,
            ...this.scene.items.children.entries
        ];

        if (allObjects.length < 2) {
            console.log("⚠️ Not enough objects for honeypot placement");
            return;
        }

        let honeypotCount = 0;

        // Random pozisyonlarda honeypot yerleştir
        for (let i = 0; i < 2; i++) {
            const x = Phaser.Math.Between(600, 1200);
            const y = Phaser.Math.Between(200, 600);

            this.createInvisibleObstacle(x, y, 'strategic');
            honeypotCount++;
        }

        console.log(`✅ Placed ${honeypotCount} strategic honeypots`);
    }

    // Honeypot collision tespit edildi
    onHoneypotCollision(obstacleId, type) {
        console.log(`💥 Honeypot collision detected: ${obstacleId} (${type})`);

        this.actualCollisions.add(obstacleId);
        this.collisionlessCount = 0;

        // Suspicious activity kaydet
        this.suspiciousActivity.push({
            type: 'honeypot_collision',
            obstacleId: obstacleId,
            timestamp: Date.now(),
            playerPosition: { x: this.scene.player?.x || 0, y: this.scene.player?.y || 0 }
        });

        // Backend'e bildir
        this.reportCollisionToServer(obstacleId, 'honeypot_hit');

        // Honeypot'ı temizle
        this.invisibleObstacles.forEach(obstacle => {
            if (obstacle.honeypotId === obstacleId) {
                obstacle.destroy();
                this.invisibleObstacles.delete(obstacle);
                console.log(`🧹 Honeypot ${obstacleId} cleaned up after collision`);
            }
        });
    }

    // Server'a collision rapor et
    async reportCollisionToServer(obstacleId, type) {
        try {
            console.log(`📡 Reporting honeypot collision: ${type}`);
            // Bu endpoint'i henüz backend'e eklemiyoruz, sadece log
            console.log(`🍯 Honeypot data: ${obstacleId}, Session: ${this.sessionId}`);
        } catch (error) {
            console.error("❌ Failed to report honeypot collision:", error);
        }
    }

    // Player tracking - arrows takip et
    trackPlayerArrows() {
        if (!this.scene.arrows) return;

        this.scene.arrows.children.each((arrow) => {
            if (arrow && arrow.active) {
                // Arrow'ların honeypot'larla etkileşimini izle
                this.invisibleObstacles.forEach(obstacle => {
                    if (obstacle.active) {
                        const distance = Phaser.Math.Distance.Between(arrow.x, arrow.y, obstacle.x, obstacle.y);
                        if (distance < 30 && !obstacle.hasPassed) {
                            obstacle.hasPassed = true;
                            console.log(`🎯 Arrow passed near honeypot: ${obstacle.honeypotId}`);
                        }
                    }
                });
            }
        });
    }

    // Cleanup
    cleanup() {
        this.invisibleObstacles.forEach(obstacle => {
            if (obstacle && obstacle.destroy) {
                obstacle.destroy();
            }
        });
        this.invisibleObstacles.clear();
        console.log("🧹 Honeypot obstacles cleaned up");
    }

    // Debug info
    getStatus() {
        return {
            sessionId: this.sessionId,
            totalInvisibleObstacles: this.invisibleObstacles.size,
            expectedCollisions: this.expectedCollisions.size,
            actualCollisions: this.actualCollisions.size,
            collisionlessCount: this.collisionlessCount,
            suspiciousActivities: this.suspiciousActivity.length
        };
    }
}

// Global access
window.WizardHoneypot = WizardHoneypot;


// 🌐 COMPLETE WIZARD GAME API CLIENT
class WizardGameAPI {
    constructor() {
        
        const currentIP = location.hostname; // bulunduğun IP
        this.possibleURLs = [
            `http://${currentIP}:5181/api/wizardgame`,
            'http://localhost:5181/api/wizardgame',
            'http://127.0.0.1:5181/api/wizardgame'
        ];


        this.baseURL = null;
        this.sessionId = this.generateSessionId();
        this.deviceFingerprint = null;
        this.connectionStatus = 'searching';

        console.log('🔍 Smart API Client starting - testing URLs...');
        console.log('🏠 Primary IP: 192.168.1.57');

        // Automatically find working URL
        this.findWorkingURL().then(() => {
            this.initializeDeviceFingerprint();
            this.initializeTokenSystem();
        });
    }

    // 🔍 Test all URLs and find the working one
    async findWorkingURL() {
        console.log(`🌐 Testing ${this.possibleURLs.length} possible URLs...`);

        for (let i = 0; i < this.possibleURLs.length; i++) {
            const url = this.possibleURLs[i];
            console.log(`🔗 Testing URL ${i + 1}/${this.possibleURLs.length}: ${url}`);

            if (await this.testURL(url)) {
                this.baseURL = url;
                this.connectionStatus = 'connected';
                console.log(`✅ SUCCESS! Using URL: ${url}`);
                return true;
            }
        }

        // No URL worked
        this.connectionStatus = 'failed';
        console.error('❌ ALL URLs FAILED! No backend connection available.');
        this.enableOfflineMode();
        return false;
    }

    // 🧪 Test a single URL
    async testURL(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

            const response = await fetch(`${url}/status`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ URL test passed: ${url} - ${data.message}`);
                return true;
            } else {
                console.log(`⚠️ URL returned ${response.status}: ${url}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ URL test failed: ${url} - ${error.message}`);
            return false;
        }
    }

    // 📴 Enable offline mode
    enableOfflineMode() {
        console.log('📴 OFFLINE MODE ENABLED - Game will work without backend');
        this.baseURL = null;
        this.connectionStatus = 'offline';

        // Override all API methods to return mock data
        this.recordArrowShot = () => Promise.resolve({ success: true, offline: true });
        this.recordItemHit = () => Promise.resolve({ success: true, offline: true });
        this.recordBombHit = () => Promise.resolve({ success: true, offline: true });
        this.requestDevicePermission = () => Promise.resolve({ success: true, offline: true });
        this.validateSecureAction = () => Promise.resolve({ success: true, offline: true });

        console.log('✅ Offline mode ready - all API calls will return mock data');
    }

    // 📡 Smart request method
    async makeRequest(endpoint, options = {}) {
        // If offline mode, return mock data
        if (this.connectionStatus === 'offline' || !this.baseURL) {
            console.log('📴 Offline mode - returning mock response');
            return { success: true, offline: true, message: 'Offline mode active' };
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`❌ API Request failed: ${endpoint}`, error);
            return { success: false, error: error.message, offline: true };
        }
    }

    // 🎯 API methods
    async getStatus() {
        return this.makeRequest('/status');
    }

    async getGameConfig() {
        try {
            const response = await fetch(`${this.baseURL}/config`);
            const data = await response.json();
            console.log('✅ Game config alındı:', data);
            return data;
        } catch (error) {
            console.error('❌ Config alma hatası:', error);
            return null;
        }
    }

    async recordArrowShot(velocityX, velocityY) {
        return this.makeRequest('/arrow-shot', {
            method: 'POST',
            body: JSON.stringify({
                velocityX: velocityX,
                velocityY: velocityY,
                sessionId: this.sessionId
            })
        });
    }

    async recordItemHit(newScore) {
        return this.makeRequest('/item-hit', {
            method: 'POST',
            body: JSON.stringify({
                newScore: newScore,
                sessionId: this.sessionId
            })
        });
    }

    async recordBombHit(remainingHearts) {
        return this.makeRequest('/bomb-hit', {
            method: 'POST',
            body: JSON.stringify({
                remainingHearts: remainingHearts,
                sessionId: this.sessionId
            })
        });
    }

    // 🔐 Security methods
    async requestDevicePermission(gameData) {
        if (!this.deviceFingerprint) {
            console.warn('Device fingerprint not ready yet');
            return { success: false, reason: 'Device fingerprint not ready' };
        }

        return this.makeRequest('/request-device-permission', {
            method: 'POST',
            body: JSON.stringify({
                sessionId: this.sessionId,
                gameData: gameData,
                deviceFingerprint: this.deviceFingerprint.getBackendCompatibleFingerprint(),
                timestamp: Date.now()
            })
        });
    }

    async validateSecureAction(gameData) {
        return this.makeRequest('/validate-secure-action', {
            method: 'POST',
            body: JSON.stringify({
                sessionId: this.sessionId,
                permissionToken: this.currentToken,
                gameData: gameData,
                deviceFingerprint: this.deviceFingerprint.getBackendCompatibleFingerprint(),
                timestamp: Date.now()
            })
        });
    }

    // 🆔 Session ID generator
    generateSessionId() {
        return `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 🔐 Initialize device fingerprint
    initializeDeviceFingerprint() {
        try {
            this.deviceFingerprint = new DeviceFingerprintManager();
            console.log('✅ Device fingerprint integrated with API client');
        } catch (error) {
            console.error('❌ Device fingerprint initialization failed:', error);
        }
    }

    // 🎫 Initialize token system
    initializeTokenSystem() {
        this.currentToken = null;
        this.deviceChallenge = null;
        this.tokenExpiresAt = null;
        console.log('🎫 Token system initialized');
    }

    // 📊 Get connection status
    getConnectionStatus() {
        return {
            status: this.connectionStatus,
            baseURL: this.baseURL,
            sessionId: this.sessionId,
            isOffline: this.connectionStatus === 'offline'
        };
    }
}

// Global API client
window.wizardAPI = new WizardGameAPI();

// Real-time validation metodu
WizardGameAPI.prototype.realTimeValidation = async function (validationData) {
    try {
        return this.makeRequest('/real-time-validation', {
            method: 'POST',
            body: JSON.stringify(validationData)
        });
    } catch (error) {
        console.error('❌ Real-time validation error:', error);
        return { success: false, reason: 'Validation failed', error: error.message };
    }
};

// Suspicious activity reporting metodu
WizardGameAPI.prototype.reportSuspiciousActivity = async function (activityData) {
    try {
        return this.makeRequest('/report-suspicious-activity', {
            method: 'POST',
            body: JSON.stringify(activityData)
        });
    } catch (error) {
        console.error('❌ Suspicious activity reporting error:', error);
        return { success: false, reason: 'Reporting failed', error: error.message };
    }
};

console.log('🔥 API Client methods loaded successfully!');

// 🔥 REAL-TIME MONITORING SYSTEM
class WizardRealTimeMonitor {
    constructor(gameScene) {
        this.scene = gameScene;
        this.sessionId = null;
        this.apiClient = null;
        this.isActive = false;

        // Monitoring intervals
        this.validationInterval = 15000; // 15 saniyede bir validation
        this.activityCheckInterval = 5000; // 5 saniyede bir activity check

        // Data tracking
        this.lastGameState = null;
        this.scoreHistory = [];
        this.actionHistory = [];
        this.suspiciousEvents = [];

        // Thresholds
        this.maxScorePerSecond = 15;
        this.maxActionsPerSecond = 10;
        this.suspiciousScoreJump = 50;

        console.log('🔥 Real-Time Monitor initialized');
    }

    setAPIClient(apiClient) {
        this.apiClient = apiClient;
        this.sessionId = apiClient.sessionId;
        console.log('🔗 Real-Time Monitor connected to API');
    }

    start() {
        if (this.isActive || !this.apiClient) return;

        this.isActive = true;
        this.startTime = Date.now();

        // Validation loop başlat
        setTimeout(() => {
            this.startValidationLoop();
        }, this.validationInterval);

        // Activity monitoring loop başlat
        setTimeout(() => {
            this.startActivityMonitoringLoop();
        }, this.activityCheckInterval);

        console.log('🔥 Real-Time Monitoring started');
        console.log(`📊 Validation every ${this.validationInterval / 1000}s`);
        console.log(`👁️ Activity check every ${this.activityCheckInterval / 1000}s`);
    }

    stop() {
        this.isActive = false;
        console.log('🔥 Real-Time Monitoring stopped');
    }

    // Ana validation loop
    startValidationLoop() {
        if (!this.isActive) return;

        this.performRealTimeValidation();

        setTimeout(() => {
            this.startValidationLoop();
        }, this.validationInterval);
    }

    // Activity monitoring loop
    startActivityMonitoringLoop() {
        if (!this.isActive) return;

        this.checkSuspiciousActivity();

        setTimeout(() => {
            this.startActivityMonitoringLoop();
        }, this.activityCheckInterval);
    }

    // Real-time validation gerçekleştir
    async performRealTimeValidation() {
        if (!this.scene.gameActive || !this.apiClient) return;

        try {
            const currentGameState = this.captureGameState();
            const gameTimeSeconds = (Date.now() - this.startTime) / 1000;

            const validationData = {
                sessionId: this.sessionId,
                currentScore: currentGameState.score,
                remainingHearts: currentGameState.hearts,
                itemsHit: currentGameState.itemsHit,
                bombsHit: currentGameState.bombsHit,
                gameTimeSeconds: gameTimeSeconds,
                timestamp: Date.now()
            };

            console.log('🔥 Performing real-time validation:', validationData);

            const response = await this.apiClient.realTimeValidation(validationData);

            if (!response.success) {
                console.log('🚨 REAL-TIME VALIDATION FAILED!');
                console.log(`Reason: ${response.reason}`);
                console.log(`Cheat Probability: ${response.cheatProbability}%`);

                this.handleValidationFailure(response);
            } else {
                console.log(`✅ Real-time validation passed (Trust Score: ${response.trustScore})`);
            }

        } catch (error) {
            console.error('❌ Real-time validation error:', error);
        }
    }

    // Şüpheli aktivite kontrolü
    checkSuspiciousActivity() {
        if (!this.scene.gameActive) return;

        const currentState = this.captureGameState();

        // Skor history'ye ekle
        this.scoreHistory.push({
            score: currentState.score,
            timestamp: Date.now()
        });

        // Son 10 saniyeyi tut
        const tenSecondsAgo = Date.now() - 10000;
        this.scoreHistory = this.scoreHistory.filter(entry => entry.timestamp > tenSecondsAgo);

        // Şüpheli aktiviteleri kontrol et
        this.detectRapidScoreIncrease();
        this.detectImpossibleTiming();
        this.detectPatternAnomalies();

        this.lastGameState = currentState;
    }

    // Hızlı skor artışı tespiti
    detectRapidScoreIncrease() {
        if (this.scoreHistory.length < 2) return;

        const current = this.scoreHistory[this.scoreHistory.length - 1];
        const previous = this.scoreHistory[this.scoreHistory.length - 2];

        const scoreDiff = current.score - previous.score;
        const timeDiff = (current.timestamp - previous.timestamp) / 1000;

        if (timeDiff > 0) {
            const scorePerSecond = scoreDiff / timeDiff;

            if (scorePerSecond > this.maxScorePerSecond) {
                const severity = Math.min(10, Math.floor(scorePerSecond / 5));
                this.reportSuspiciousActivity(
                    'rapid_score_increase',
                    `Score increased by ${scoreDiff} in ${timeDiff.toFixed(2)}s (${scorePerSecond.toFixed(2)} pts/s)`,
                    severity
                );
            }
        }
    }

    // İmkansız timing tespiti
    detectImpossibleTiming() {
        const gameTime = (Date.now() - this.startTime) / 1000;
        const currentScore = this.scene.score || 0;

        // Minimum oyun süresi vs skor kontrolü
        const minTimeForScore = currentScore / 50; // Maksimum 20 puan/saniye kabul et

        if (gameTime < minTimeForScore && currentScore > 50) {
            this.reportSuspiciousActivity(
                'impossible_timing',
                `Score ${currentScore} achieved in ${gameTime.toFixed(2)}s (min expected: ${minTimeForScore.toFixed(2)}s)`,
                9
            );
        }
    }

    // Pattern anomalileri tespiti
    detectPatternAnomalies() {
        if (this.scoreHistory.length < 5) return;

        // Son 5 skor değişimini al
        const recent = this.scoreHistory.slice(-5);
        const scoreChanges = [];

        for (let i = 1; i < recent.length; i++) {
            const change = recent[i].score - recent[i - 1].score;
            if (change > 0) scoreChanges.push(change);
        }

        // Eğer tüm değişimler aynı değerde ise (örn. hep +10)
        if (scoreChanges.length >= 3) {
            const allSame = scoreChanges.every(change => change === scoreChanges[0]);
            const averageChange = scoreChanges.reduce((a, b) => a + b, 0) / scoreChanges.length;

            if (allSame && averageChange >= 30) {
                this.reportSuspiciousActivity(
                    'pattern_anomaly',
                    `Consistent score pattern detected: ${scoreChanges.join(', ')}`,
                    6
                );
            }
        }
    }

    // Şüpheli aktiviteyi rapor et
    async reportSuspiciousActivity(activityType, details, severityLevel) {
        try {
            console.log(`🚨 Suspicious activity detected: ${activityType}`);
            console.log(`📝 Details: ${details}`);
            console.log(`⚡ Severity: ${severityLevel}/10`);

            const report = {
                sessionId: this.sessionId,
                activityType: activityType,
                details: details,
                severityLevel: severityLevel,
                timestamp: Date.now()
            };

            // Backend'e rapor gönder
            const response = await this.apiClient.reportSuspiciousActivity(report);

            if (!response.success) {
                console.log(`🔨 SUSPICIOUS ACTIVITY RESPONSE: ${response.action}`);
                console.log(`🎯 Cheat Probability: ${response.cheatProbability}%`);

                if (response.action === 'terminate_session') {
                    this.handleSessionTermination(response);
                }
            }

            // Local storage
            this.suspiciousEvents.push({
                ...report,
                response: response
            });

        } catch (error) {
            console.error('❌ Failed to report suspicious activity:', error);
        }
    }

    // Validation failure handling
    handleValidationFailure(response) {
        console.log('🔨 HANDLING VALIDATION FAILURE');

        if (response.action === 'terminate_session') {
            this.handleSessionTermination(response);
        } else {
            // Uyarı göster ama oyunu devam ettir
            this.showWarning(response.reason);
        }
    }

    // Session sonlandırma
    handleSessionTermination(response) {
        console.log('💀 TERMINATING SESSION DUE TO CHEAT DETECTION');

        this.stop();
        this.scene.gameActive = false;

        // Cheat detection mesajı göster
        const cheatText = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            `🚨 CHEAT DETECTED 🚨\n\n${response.reason}\n\nSession Terminated\nProbability: ${response.cheatProbability}%`,
            {
                fontSize: '28px',
                fill: '#ff0000',
                align: 'center',
                fontFamily: 'monospace',
                stroke: '#ffffff',
                strokeThickness: 2
            }
        );
        cheatText.setOrigin(0.5);
        cheatText.setDepth(10000);

        // 3 saniye sonra game over
        setTimeout(() => {
            this.scene.handleGameOver();
        }, 3000);
    }

    // Uyarı göster
    showWarning(message) {
        const warningText = this.scene.add.text(
            this.scene.scale.width / 2,
            100,
            `⚠️ WARNING: ${message}`,
            {
                fontSize: '20px',
                fill: '#ffaa00',
                align: 'center',
                fontFamily: 'monospace',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        warningText.setOrigin(0.5);
        warningText.setDepth(9999);

        // 3 saniye sonra kaybolsun
        setTimeout(() => {
            if (warningText && warningText.destroy) {
                warningText.destroy();
            }
        }, 3000);
    }

    // Oyun durumunu yakala
    captureGameState() {
        return {
            score: this.scene.score || 0,
            hearts: this.scene.hearts || 3,
            itemsHit: this.scene.itemsHit || 0,
            bombsHit: this.scene.bombsHit || 0,
            gameTime: Date.now() - (this.scene.gameStartTime || Date.now())
        };
    }

    // Action kaydet (opsiyonel - detaylı tracking için)
    recordAction(actionType, data) {
        this.actionHistory.push({
            type: actionType,
            data: data,
            timestamp: Date.now()
        });

        // Son 1 dakikayı tut
        const oneMinuteAgo = Date.now() - 60000;
        this.actionHistory = this.actionHistory.filter(action => action.timestamp > oneMinuteAgo);
    }

    // Status bilgisi
    getStatus() {
        return {
            isActive: this.isActive,
            sessionId: this.sessionId,
            scoreHistoryLength: this.scoreHistory.length,
            suspiciousEventsCount: this.suspiciousEvents.length,
            lastValidation: this.lastValidation || 'Not yet performed',
            monitoringTime: this.isActive ? Math.floor((Date.now() - this.startTime) / 1000) + 's' : 'Not active'
        };
    }
}

// Global access
window.WizardRealTimeMonitor = WizardRealTimeMonitor;

// API Client'e yeni metodlar eklenmesi gerekiyor
// WizardGameAPI sınıfına eklenecek metodlar:

// Real-time validation metodu
WizardGameAPI.prototype.realTimeValidation = async function (validationData) {
    try {
        const response = await fetch(`${this.baseURL}/real-time-validation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validationData)
        });

        const data = await response.json();
        console.log('🔥 Real-time validation response:', data);
        return data;
    } catch (error) {
        console.error('❌ Real-time validation error:', error);
        return { success: false, reason: 'Validation failed', error: error.message };
    }
};

// Suspicious activity reporting metodu
WizardGameAPI.prototype.reportSuspiciousActivity = async function (activityData) {
    try {
        const response = await fetch(`${this.baseURL}/report-suspicious-activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityData)
        });

        const data = await response.json();
        console.log('🚨 Suspicious activity response:', data);
        return data;
    } catch (error) {
        console.error('❌ Suspicious activity reporting error:', error);
        return { success: false, reason: 'Reporting failed', error: error.message };
    }
};

console.log('🔥 Real-Time Monitoring System loaded and ready!');

// 🛡️ DÜZELTİLMİŞ VARIABLE PROTECTION - Çok daha geç başlatılacak
class WizardVariableProtection {
    constructor(gameScene) {
        this.scene = gameScene;
        this.isActive = false;
        this.protectedVars = new Map();
        this.backupValues = new Map();
        this.validationInterval = 10000; // 10 saniyede bir (5'ten 10'a çıkarıldı)
        this.suspiciousChanges = [];
        this.trustScore = 100;
        this.developmentMode = true;
        this.isInitialized = false; // Yeni: başlatılıp başlatılmadığını kontrol et

        console.log('🛡️ FIXED Variable Protection System initialized (will start in 60s)');
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;

        // ÇOK UZUN DELAY - Oyun tam stabilize olsun
        setTimeout(() => {
            this.initializeProtection();
        }, 60000); // 60 saniye bekle (30'dan 60'a çıkarıldı)

        console.log('🛡️ Variable Protection scheduled to start in 60 seconds');
    }

    // Koruma sistemini başlat (oyun stabilize olduktan sonra)
    initializeProtection() {
        if (!this.scene.gameActive) {
            console.log('🛡️ Game not active, skipping variable protection initialization');
            return;
        }

        console.log('🛡️ Initializing Variable Protection...');

        // Oyun değişkenlerinin hazır olduğunu kontrol et
        if (this.scene.score === undefined || this.scene.hearts === undefined) {
            console.log('⚠️ Game variables not ready, retrying in 10 seconds...');
            setTimeout(() => this.initializeProtection(), 10000);
            return;
        }

        this.setupProtectedVariables();
        this.startValidationLoop();
        this.isInitialized = true;

        console.log('✅ Variable Protection fully initialized and active');
    }

    setupProtectedVariables() {
        // Mevcut değerleri oku
        const currentScore = this.scene.score || 0;
        const currentHearts = this.scene.hearts || 3;
        const currentItemsHit = this.scene.itemsHit || 0;
        const currentBombsHit = this.scene.bombsHit || 0;

        console.log('🔍 Reading current game state for protection:');
        console.log(`   Score: ${currentScore}`);
        console.log(`   Hearts: ${currentHearts}`);
        console.log(`   Items Hit: ${currentItemsHit}`);
        console.log(`   Bombs Hit: ${currentBombsHit}`);

        // Çok toleranslı range'ler
        this.addProtectedVariable('score', () => this.scene.score, 0, 3000);
        this.addProtectedVariable('hearts', () => this.scene.hearts, 0, 3);
        this.addProtectedVariable('itemsHit', () => this.scene.itemsHit, 0, 300);
        this.addProtectedVariable('bombsHit', () => this.scene.bombsHit, 0, 50);
        this.addProtectedVariable('gameActive', () => this.scene.gameActive, [true, false]);

        this.captureBackupValues();
        console.log('🔒 Variable protection ranges set (VERY TOLERANT)');
    }

    addProtectedVariable(name, getter, minValue, maxValue) {
        const currentValue = getter();
        this.protectedVars.set(name, {
            getter: getter,
            minValue: minValue,
            maxValue: maxValue,
            lastValue: currentValue,
            changeCount: 0,
            lastChanged: Date.now()
        });

        console.log(`📊 Protected variable: ${name} = ${currentValue} (range: ${minValue}-${maxValue})`);
    }

    captureBackupValues() {
        for (let [name, config] of this.protectedVars) {
            const value = config.getter();
            this.backupValues.set(name, value);
            console.log(`💾 Backup: ${name} = ${value}`);
        }
        console.log('💾 All backup values captured');
    }

    startValidationLoop() {
        if (!this.isActive || !this.isInitialized) return;

        console.log('🔄 Starting variable validation loop...');

        setTimeout(() => {
            this.validateAllVariables();
            this.startValidationLoop();
        }, this.validationInterval);
    }

    validateAllVariables() {
        if (!this.scene.gameActive || !this.isInitialized) return;

        let suspiciousCount = 0;

        for (let [name, config] of this.protectedVars) {
            const currentValue = config.getter();
            const result = this.validateVariable(name, currentValue, config);

            if (!result.isValid) {
                suspiciousCount++;

                console.log(`⚠️ Variable validation failed: ${name}`);
                console.log(`   Current: ${currentValue}, Previous: ${config.lastValue}`);
                console.log(`   Reason: ${result.reason}`);

                // Sadece development mode'da uyarı ver
                if (this.developmentMode) {
                    this.showDevelopmentWarning(name, result);
                } else {
                    this.handleSuspiciousChange(name, result);
                }
            }

            config.lastValue = currentValue;
        }

        if (suspiciousCount === 0) {
            console.log('✅ Variable validation passed - All variables secure');
        }
    }

    validateVariable(name, currentValue, config) {
        const previousValue = config.lastValue;

        // NULL/undefined kontrolü
        if (currentValue === null || currentValue === undefined) {
            return {
                isValid: false,
                reason: 'null_value',
                details: `${name} is null/undefined`,
                severity: 5 // Düşük severity
            };
        }

        // Range kontrolü
        if (Array.isArray(config.minValue)) {
            if (!config.minValue.includes(currentValue)) {
                return {
                    isValid: false,
                    reason: 'invalid_value',
                    details: `${name}: ${currentValue} not in allowed values ${config.minValue}`,
                    severity: 6
                };
            }
        } else {
            if (currentValue < config.minValue || currentValue > config.maxValue) {
                return {
                    isValid: false,
                    reason: 'out_of_range',
                    details: `${name}: ${currentValue} not in range [${config.minValue}, ${config.maxValue}]`,
                    severity: 7
                };
            }
        }

        // Skor kontrolü - çok toleranslı
        if (name === 'score' && currentValue > previousValue) {
            const change = currentValue - previousValue;
            const timeDiff = Date.now() - config.lastChanged;

            // Çok toleranslı threshold
            if (change > 500 && timeDiff < 1000) { // 200'den 500'e çıkarıldı
                return {
                    isValid: false,
                    reason: 'rapid_score_change',
                    details: `Score increased by ${change} in ${timeDiff}ms`,
                    severity: 5 // Düşük severity
                };
            }
        }

        // Score decrease - hala kontrol et ama daha toleranslı
        if (name === 'score' && currentValue < previousValue) {
            const decrease = previousValue - currentValue;
            if (decrease > 10) { // Küçük düşüşlere izin ver
                return {
                    isValid: false,
                    reason: 'score_decreased',
                    details: `Score decreased from ${previousValue} to ${currentValue}`,
                    severity: 8
                };
            }
        }

        // Heart increase - hala kritik
        if (name === 'hearts' && currentValue > previousValue) {
            return {
                isValid: false,
                reason: 'heart_increase',
                details: `Hearts increased from ${previousValue} to ${currentValue}`,
                severity: 9
            };
        }

        if (currentValue !== previousValue) {
            config.lastChanged = Date.now();
            config.changeCount++;
        }

        return { isValid: true };
    }

    // Development mode uyarısı - oyunu sonlandırma
    showDevelopmentWarning(variableName, validationResult) {
        console.log(`🔧 DEV WARNING: Variable ${variableName} - ${validationResult.reason}`);
        console.log(`   Details: ${validationResult.details}`);
        console.log(`   Severity: ${validationResult.severity}/10 (DEVELOPMENT MODE - NOT TERMINATING)`);

        // Sadece hafif uyarı göster
        try {
            const warningText = this.scene.add.text(
                this.scene.scale.width / 2,
                60,
                `🔧 DEV: ${variableName} - ${validationResult.reason}`,
                {
                    fontSize: '14px',
                    fill: '#ffcc00',
                    align: 'center',
                    fontFamily: 'monospace'
                }
            );
            warningText.setOrigin(0.5);
            warningText.setDepth(9999);

            setTimeout(() => {
                if (warningText && warningText.destroy) {
                    warningText.destroy();
                }
            }, 2000);
        } catch (error) {
            console.warn("Could not show dev warning:", error);
        }
    }

    // Normal şüpheli değişiklik işleme
    handleSuspiciousChange(variableName, validationResult) {
        console.log(`🚨 SUSPICIOUS VARIABLE CHANGE: ${variableName}`);
        console.log(`Reason: ${validationResult.reason}`);
        console.log(`Details: ${validationResult.details}`);
        console.log(`Severity: ${validationResult.severity}/10`);

        this.trustScore = Math.max(0, this.trustScore - (validationResult.severity * 2));
        console.log(`📊 Trust Score: ${this.trustScore}%`);

        // Sadece severity 9+ için oyunu sonlandır
        if (validationResult.severity >= 9) {
            this.handleCriticalViolation({
                variable: variableName,
                reason: validationResult.reason,
                details: validationResult.details,
                severity: validationResult.severity
            });
        }
    }

    handleCriticalViolation(suspiciousChange) {
        console.log('💀 CRITICAL VARIABLE VIOLATION - TERMINATING GAME');

        this.stop();
        this.scene.gameActive = false;

        try {
            const violationText = this.scene.add.text(
                this.scene.scale.width / 2,
                this.scene.scale.height / 2,
                `🚨 CRITICAL VIOLATION 🚨\n\n${suspiciousChange.variable.toUpperCase()}\n${suspiciousChange.details}\n\nGame Terminated`,
                {
                    fontSize: '24px',
                    fill: '#ff0000',
                    align: 'center',
                    fontFamily: 'monospace',
                    stroke: '#ffffff',
                    strokeThickness: 2
                }
            );
            violationText.setOrigin(0.5);
            violationText.setDepth(10000);

            setTimeout(() => {
                this.scene.handleGameOver();
            }, 3000);
        } catch (error) {
            console.warn("Could not show violation text:", error);
            this.scene.handleGameOver();
        }
    }

    stop() {
        this.isActive = false;
        this.isInitialized = false;
        console.log('🛡️ Variable Protection stopped');
    }

    getStatus() {
        return {
            isActive: this.isActive,
            isInitialized: this.isInitialized,
            protectedVariableCount: this.protectedVars.size,
            trustScore: this.trustScore,
            developmentMode: this.developmentMode,
            validationInterval: this.validationInterval / 1000 + 's',
            type: 'FIXED_PROTECTION'
        };
    }

    // Development mode toggle
    toggleDevelopmentMode() {
        this.developmentMode = !this.developmentMode;
        console.log(`🛡️ Variable Protection development mode: ${this.developmentMode ? 'ON' : 'OFF'}`);
    }
}

// Global access
window.WizardVariableProtection = WizardVariableProtection;

console.log('🛡️ Variable Protection System loaded and ready!');

// 📊 RATE LIMITING SYSTEM
class WizardRateLimiting {
    constructor(gameScene) {
        this.scene = gameScene;
        this.isActive = false;
        this.trustScore = 100;

        // Action tracking
        this.actionHistory = [];
        this.clickHistory = [];
        this.arrowHistory = [];

        // Rate limits (per second)
        this.maxActionsPerSecond = 10;
        this.maxClicksPerSecond = 15;
        this.maxArrowsPerSecond = 8;

        // Time windows (ms)
        this.shortWindow = 1000;  // 1 second
        this.mediumWindow = 5000; // 5 seconds
        this.longWindow = 30000;  // 30 seconds

        // Violation tracking
        this.violations = [];
        this.warningCount = 0;
        this.suspiciousPatterns = [];

        console.log('📊 Rate Limiting System initialized');
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;

        // Cleanup loop başlat
        this.startCleanupLoop();

        console.log('📊 Rate Limiting ACTIVE');
        console.log(`⚡ Max actions/sec: ${this.maxActionsPerSecond}`);
        console.log(`🖱️ Max clicks/sec: ${this.maxClicksPerSecond}`);
        console.log(`🏹 Max arrows/sec: ${this.maxArrowsPerSecond}`);
    }

    stop() {
        this.isActive = false;
        console.log('📊 Rate Limiting STOPPED');
    }

    // Cleanup loop - eski kayıtları temizle
    startCleanupLoop() {
        if (!this.isActive) return;

        this.cleanupOldRecords();

        setTimeout(() => {
            this.startCleanupLoop();
        }, 5000); // 5 saniyede bir cleanup
    }

    // Eski kayıtları temizle
    cleanupOldRecords() {
        const now = Date.now();
        const cutoff = now - this.longWindow;

        this.actionHistory = this.actionHistory.filter(action => action.timestamp > cutoff);
        this.clickHistory = this.clickHistory.filter(click => click.timestamp > cutoff);
        this.arrowHistory = this.arrowHistory.filter(arrow => arrow.timestamp > cutoff);
        this.violations = this.violations.filter(violation => violation.timestamp > cutoff);
    }

    // Genel action kaydet
    recordAction(actionType, data = {}) {
        if (!this.isActive) return;

        const timestamp = Date.now();
        const action = {
            type: actionType,
            timestamp: timestamp,
            data: data
        };

        this.actionHistory.push(action);

        // Rate limiting kontrolü
        this.checkActionRates(actionType, timestamp);
    }

    // Click kaydet
    recordClick(x, y, buttonType = 'left') {
        if (!this.isActive) return;

        const timestamp = Date.now();
        const click = {
            x: x,
            y: y,
            button: buttonType,
            timestamp: timestamp
        };

        this.clickHistory.push(click);

        // Click rate kontrolü
        this.checkClickRates(timestamp);
    }

    // Arrow shot kaydet
    recordArrowShot(velocityX, velocityY) {
        if (!this.isActive) return;

        const timestamp = Date.now();
        const arrow = {
            velocityX: velocityX,
            velocityY: velocityY,
            timestamp: timestamp
        };

        this.arrowHistory.push(arrow);

        // Arrow rate kontrolü
        this.checkArrowRates(timestamp);

        // Genel action olarak da kaydet
        this.recordAction('arrow_shot', { velocityX, velocityY });
    }

    // Action rate kontrolü
    checkActionRates(actionType, timestamp) {
        const recentActions = this.getRecentActions(this.shortWindow);
        const actionsPerSecond = recentActions.length;

        if (actionsPerSecond > this.maxActionsPerSecond) {
            this.handleRateViolation('action_rate_exceeded', {
                type: actionType,
                rate: actionsPerSecond,
                limit: this.maxActionsPerSecond,
                window: 'short'
            }, 7);
        }

        // Medium window check
        const mediumActions = this.getRecentActions(this.mediumWindow);
        const mediumRate = mediumActions.length / (this.mediumWindow / 1000);

        if (mediumRate > this.maxActionsPerSecond * 0.8) {
            this.handleRateViolation('sustained_high_activity', {
                type: actionType,
                rate: mediumRate.toFixed(2),
                window: 'medium'
            }, 5);
        }
    }

    // Click rate kontrolü
    checkClickRates(timestamp) {
        const recentClicks = this.getRecentClicks(this.shortWindow);
        const clicksPerSecond = recentClicks.length;

        if (clicksPerSecond > this.maxClicksPerSecond) {
            this.handleRateViolation('click_rate_exceeded', {
                rate: clicksPerSecond,
                limit: this.maxClicksPerSecond,
                window: 'short'
            }, 6);
        }

        // Pattern analysis
        this.analyzeClickPatterns(recentClicks);
    }

    // Arrow rate kontrolü
    checkArrowRates(timestamp) {
        const recentArrows = this.getRecentArrows(this.shortWindow);
        const arrowsPerSecond = recentArrows.length;

        if (arrowsPerSecond > this.maxArrowsPerSecond) {
            this.handleRateViolation('arrow_rate_exceeded', {
                rate: arrowsPerSecond,
                limit: this.maxArrowsPerSecond,
                window: 'short'
            }, 9);
        }

        // Arrow pattern analysis
        this.analyzeArrowPatterns(recentArrows);
    }

    // Son X ms içindeki actionları al
    getRecentActions(windowMs) {
        const cutoff = Date.now() - windowMs;
        return this.actionHistory.filter(action => action.timestamp > cutoff);
    }

    // Son X ms içindeki clickleri al
    getRecentClicks(windowMs) {
        const cutoff = Date.now() - windowMs;
        return this.clickHistory.filter(click => click.timestamp > cutoff);
    }

    // Son X ms içindeki arrowları al
    getRecentArrows(windowMs) {
        const cutoff = Date.now() - windowMs;
        return this.arrowHistory.filter(arrow => arrow.timestamp > cutoff);
    }

    // Click pattern analizi
    analyzeClickPatterns(recentClicks) {
        if (recentClicks.length < 5) return;

        // Aynı pozisyonda çok fazla click
        const positions = recentClicks.map(click => `${Math.round(click.x / 10)}x${Math.round(click.y / 10)}`);
        const positionCounts = {};
        positions.forEach(pos => positionCounts[pos] = (positionCounts[pos] || 0) + 1);

        const maxSamePosition = Math.max(...Object.values(positionCounts));
        if (maxSamePosition >= 8) {
            this.handleRateViolation('repetitive_clicking', {
                samePositionClicks: maxSamePosition,
                position: Object.keys(positionCounts).find(key => positionCounts[key] === maxSamePosition)
            }, 7);
        }

        // Perfect timing pattern (bot detection)
        if (recentClicks.length >= 5) {
            const intervals = [];
            for (let i = 1; i < recentClicks.length; i++) {
                intervals.push(recentClicks[i].timestamp - recentClicks[i - 1].timestamp);
            }

            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;

            // Çok düşük variance = bot
            if (variance < 100 && avgInterval < 200) {
                this.handleRateViolation('robotic_clicking', {
                    avgInterval: avgInterval.toFixed(2),
                    variance: variance.toFixed(2)
                }, 9);
            }
        }
    }

    // Arrow pattern analizi
    analyzeArrowPatterns(recentArrows) {
        if (recentArrows.length < 3) return;

        // Aynı velocity ile çok fazla atış
        const velocities = recentArrows.map(arrow => `${Math.round(arrow.velocityX)}x${Math.round(arrow.velocityY)}`);
        const velocityCounts = {};
        velocities.forEach(vel => velocityCounts[vel] = (velocityCounts[vel] || 0) + 1);

        const maxSameVelocity = Math.max(...Object.values(velocityCounts));
        if (maxSameVelocity >= 7) {
            this.handleRateViolation('repetitive_arrows', {
                sameVelocityCount: maxSameVelocity,
                velocity: Object.keys(velocityCounts).find(key => velocityCounts[key] === maxSameVelocity)
            }, 6);
        }
    }

    // Rate violation işle
    async handleRateViolation(violationType, details, severity) {
        console.log(`🚨 RATE LIMITING VIOLATION!`);
        console.log(`Type: ${violationType}`);
        console.log(`Details:`, details);
        console.log(`Severity: ${severity}/10`);

        // Trust score düşür
        const scoreDecrease = severity * 3;
        this.trustScore = Math.max(0, this.trustScore - scoreDecrease);
        console.log(`📊 Trust Score decreased to: ${this.trustScore}%`);

        // Violation kaydet
        const violation = {
            type: violationType,
            details: details,
            severity: severity,
            timestamp: Date.now(),
            trustScore: this.trustScore
        };

        this.violations.push(violation);
        this.warningCount++;

        // Backend'e rapor et
        if (this.scene.api && this.scene.api.reportSuspiciousActivity) {
            try {
                await this.scene.api.reportSuspiciousActivity({
                    sessionId: this.scene.api.sessionId,
                    activityType: 'rate_limiting_violation',
                    details: `${violationType}: ${JSON.stringify(details)}`,
                    severityLevel: severity,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('❌ Failed to report rate violation:', error);
            }
        }

        // Severity'ye göre action al
        if (severity >= 8) {
            this.handleCriticalViolation(violation);
        } else if (severity >= 6) {
            this.showWarning(violation);
        }
    }

    // Kritik violation işle
    handleCriticalViolation(violation) {
        console.log('💀 CRITICAL RATE VIOLATION - TERMINATING GAME');

        this.stop();
        this.scene.gameActive = false;

        // Warning mesajı göster
        const violationText = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            `🚨 RATE LIMITING VIOLATION 🚨\n\n${violation.type.toUpperCase()}\n\nToo many actions per second\n\nGame Terminated`,
            {
                fontSize: '24px',
                fill: '#ff0000',
                align: 'center',
                fontFamily: 'monospace',
                stroke: '#ffffff',
                strokeThickness: 2
            }
        );
        violationText.setOrigin(0.5);
        violationText.setDepth(10000);

        // 3 saniye sonra game over
        setTimeout(() => {
            this.scene.handleGameOver();
        }, 3000);
    }

    // Warning göster
    showWarning(violation) {
        const warningText = this.scene.add.text(
            this.scene.scale.width / 2,
            120,
            `⚠️ RATE WARNING: ${violation.type}\nSlow down your actions!`,
            {
                fontSize: '18px',
                fill: '#ffaa00',
                align: 'center',
                fontFamily: 'monospace',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        warningText.setOrigin(0.5);
        warningText.setDepth(9999);

        // 3 saniye sonra kaybolsun
        setTimeout(() => {
            if (warningText && warningText.destroy) {
                warningText.destroy();
            }
        }, 3000);
    }

    // Manual rate check (debug için)
    checkCurrentRates() {
        const shortActions = this.getRecentActions(this.shortWindow);
        const shortClicks = this.getRecentClicks(this.shortWindow);
        const shortArrows = this.getRecentArrows(this.shortWindow);

        console.log('📊 CURRENT RATES:');
        console.log(`Actions/sec: ${shortActions.length}/${this.maxActionsPerSecond}`);
        console.log(`Clicks/sec: ${shortClicks.length}/${this.maxClicksPerSecond}`);
        console.log(`Arrows/sec: ${shortArrows.length}/${this.maxArrowsPerSecond}`);
        console.log(`Trust Score: ${this.trustScore}%`);
    }

    // Status bilgisi
    getStatus() {
        return {
            isActive: this.isActive,
            trustScore: this.trustScore,
            totalActions: this.actionHistory.length,
            totalClicks: this.clickHistory.length,
            totalArrows: this.arrowHistory.length,
            violationCount: this.violations.length,
            warningCount: this.warningCount,
            recentActionsPerSec: this.getRecentActions(this.shortWindow).length,
            recentClicksPerSec: this.getRecentClicks(this.shortWindow).length,
            recentArrowsPerSec: this.getRecentArrows(this.shortWindow).length
        };
    }

    // Son violationları göster
    getRecentViolations(count = 3) {
        return this.violations.slice(-count);
    }
}

// Global access
window.WizardRateLimiting = WizardRateLimiting;

console.log('📊 Rate Limiting System loaded and ready!');

// 📍 POSITION VALIDATION SYSTEM
class WizardPositionValidation {
    constructor(gameScene) {
        this.scene = gameScene;
        this.isActive = false;
        this.trustScore = 100;

        // Position tracking
        this.positionHistory = [];
        this.lastValidPosition = { x: 0, y: 0, timestamp: 0 };
        this.currentPosition = { x: 0, y: 0 };

        // Movement limits
        this.maxMovementSpeed = 500; // pixels per second
        this.teleportThreshold = 100; // pixels instantly
        this.boundaryTolerance = 10; // pixels outside boundaries

        // Game boundaries
        this.boundaries = {
            minX: 0,
            maxX: 1536,
            minY: 0,
            maxY: 1024
        };

        // Tracking intervals
        this.trackingInterval = 100; // 100ms tracking
        this.historyWindow = 10000; // 10 seconds history

        // Violation tracking
        this.violations = [];
        this.teleportCount = 0;
        this.boundaryViolations = 0;
        this.suspiciousMovements = [];

        console.log('📍 Position Validation System initialized');
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;

        // Initial position capture'ı geciktir
        setTimeout(() => {
            this.captureInitialPosition();
        }, 2000); // 2 saniye bekle

        // Position tracking'i de geciktir
        setTimeout(() => {
            this.startPositionTracking();
        }, 3000); // 3 saniye bekle

        console.log('📍 Position Validation ACTIVE (delayed start)');
        console.log(`🏃 Max movement speed: ${this.maxMovementSpeed} px/s`);
        console.log(`📡 Teleport threshold: ${this.teleportThreshold} px`);
        console.log(`🔲 Boundary tolerance: ${this.boundaryTolerance} px`);
    }

    stop() {
        this.isActive = false;
        console.log('📍 Position Validation STOPPED');
    }

    captureInitialPosition() {
        if (!this.scene.player) {
            // Player henüz yok, 1 saniye sonra tekrar dene
            setTimeout(() => this.captureInitialPosition(), 1000);
            return;
        }

        const position = {
            x: this.scene.player.x,
            y: this.scene.player.y,
            timestamp: Date.now()
        };

        this.lastValidPosition = position;
        this.currentPosition = { x: position.x, y: position.y };
        this.positionHistory.push(position);

        console.log('📍 Initial position captured:', position);
    }

    // Position tracking loop
    startPositionTracking() {
        if (!this.isActive) return;

        this.trackCurrentPosition();

        setTimeout(() => {
            this.startPositionTracking();
        }, this.trackingInterval);
    }

    // Mevcut pozisyonu track et
    trackCurrentPosition() {
        if (!this.scene.player || !this.scene.gameActive) return;

        const timestamp = Date.now();
        const newPosition = {
            x: this.scene.player.x,
            y: this.scene.player.y,
            timestamp: timestamp
        };

        // Position validation
        const validationResult = this.validatePosition(newPosition);

        if (validationResult.isValid) {
            // Valid position - kaydet
            this.updateValidPosition(newPosition);
        } else {
            // Invalid position - handle violation
            this.handlePositionViolation(newPosition, validationResult);
        }

        // History cleanup
        this.cleanupPositionHistory();
    }

    // Position validation
    validatePosition(newPosition) {
        const timeDiff = newPosition.timestamp - this.lastValidPosition.timestamp;
        const distanceX = Math.abs(newPosition.x - this.lastValidPosition.x);
        const distanceY = Math.abs(newPosition.y - this.lastValidPosition.y);
        const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Teleportation check (instant large movement)
        if (totalDistance > this.teleportThreshold && timeDiff < 200) {
            return {
                isValid: false,
                reason: 'teleportation',
                details: `Moved ${totalDistance.toFixed(2)}px in ${timeDiff}ms (threshold: ${this.teleportThreshold}px)`,
                severity: 9,
                distance: totalDistance,
                time: timeDiff
            };
        }

        // Speed check (movement too fast)
        if (timeDiff > 0) {
            const speed = (totalDistance / timeDiff) * 1000; // pixels per second
            if (speed > this.maxMovementSpeed) {
                return {
                    isValid: false,
                    reason: 'impossible_speed',
                    details: `Speed: ${speed.toFixed(2)} px/s (max: ${this.maxMovementSpeed} px/s)`,
                    severity: 8,
                    speed: speed,
                    distance: totalDistance
                };
            }
        }

        // Boundary check
        const boundaryResult = this.checkBoundaries(newPosition);
        if (!boundaryResult.isValid) {
            return {
                isValid: false,
                reason: 'boundary_violation',
                details: boundaryResult.details,
                severity: 7,
                boundary: boundaryResult.boundary
            };
        }

        // Player immobility check - daha toleranslı
        if (this.scene.player.body && this.scene.player.body.immovable) {
            const minMovement = 50; // 5'den 50'ye çıkar
            if (totalDistance > minMovement) {
                return {
                    isValid: false,
                    reason: 'immovable_player_moved',
                    details: `Immovable player moved ${totalDistance.toFixed(2)}px`,
                    severity: 8, // 10'dan 8'e düşür
                    distance: totalDistance
                };
            }
        }

        return { isValid: true };
    }

    // Boundary kontrolü
    checkBoundaries(position) {
        const tolerance = this.boundaryTolerance;

        if (position.x < this.boundaries.minX - tolerance) {
            return {
                isValid: false,
                details: `X position ${position.x} below minimum ${this.boundaries.minX}`,
                boundary: 'left'
            };
        }

        if (position.x > this.boundaries.maxX + tolerance) {
            return {
                isValid: false,
                details: `X position ${position.x} above maximum ${this.boundaries.maxX}`,
                boundary: 'right'
            };
        }

        if (position.y < this.boundaries.minY - tolerance) {
            return {
                isValid: false,
                details: `Y position ${position.y} below minimum ${this.boundaries.minY}`,
                boundary: 'top'
            };
        }

        if (position.y > this.boundaries.maxY + tolerance) {
            return {
                isValid: false,
                details: `Y position ${position.y} above maximum ${this.boundaries.maxY}`,
                boundary: 'bottom'
            };
        }

        return { isValid: true };
    }

    // Valid position güncelle
    updateValidPosition(newPosition) {
        this.lastValidPosition = newPosition;
        this.currentPosition = { x: newPosition.x, y: newPosition.y };
        this.positionHistory.push(newPosition);
    }

    // Position violation işle
    async handlePositionViolation(invalidPosition, validationResult) {
        console.log(`🚨 POSITION VALIDATION VIOLATION!`);
        console.log(`Reason: ${validationResult.reason}`);
        console.log(`Details: ${validationResult.details}`);
        console.log(`Severity: ${validationResult.severity}/10`);
        console.log(`Invalid position:`, invalidPosition);
        console.log(`Last valid position:`, this.lastValidPosition);

        // Trust score düşür
        const scoreDecrease = validationResult.severity * 4;
        this.trustScore = Math.max(0, this.trustScore - scoreDecrease);
        console.log(`📊 Trust Score decreased to: ${this.trustScore}%`);

        // Violation sayacları
        switch (validationResult.reason) {
            case 'teleportation':
                this.teleportCount++;
                break;
            case 'boundary_violation':
                this.boundaryViolations++;
                break;
            default:
                this.suspiciousMovements.push(validationResult);
        }

        // Violation kaydet
        const violation = {
            type: validationResult.reason,
            details: validationResult.details,
            severity: validationResult.severity,
            timestamp: Date.now(),
            invalidPosition: invalidPosition,
            lastValidPosition: this.lastValidPosition,
            trustScore: this.trustScore
        };

        this.violations.push(violation);

        // Backend'e rapor et
        if (this.scene.api && this.scene.api.reportSuspiciousActivity) {
            try {
                await this.scene.api.reportSuspiciousActivity({
                    sessionId: this.scene.api.sessionId,
                    activityType: 'position_violation',
                    details: `${validationResult.reason}: ${validationResult.details}`,
                    severityLevel: validationResult.severity,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('❌ Failed to report position violation:', error);
            }
        }

        // Severity'ye göre action al
        if (validationResult.severity >= 9) {
            this.handleCriticalViolation(violation);
        } else if (validationResult.severity >= 7) {
            this.showWarning(violation);
            // Position'ı force reset et
            this.forcePositionReset();
        }
    }

    // Kritik violation işle
    handleCriticalViolation(violation) {
        console.log('💀 CRITICAL POSITION VIOLATION - TERMINATING GAME');

        this.stop();
        this.scene.gameActive = false;

        // Violation mesajı göster
        const violationText = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            `🚨 POSITION VIOLATION DETECTED 🚨\n\n${violation.type.toUpperCase()}\n\n${violation.details}\n\nGame Terminated`,
            {
                fontSize: '24px',
                fill: '#ff0000',
                align: 'center',
                fontFamily: 'monospace',
                stroke: '#ffffff',
                strokeThickness: 2
            }
        );
        violationText.setOrigin(0.5);
        violationText.setDepth(10000);

        // 3 saniye sonra game over
        setTimeout(() => {
            this.scene.handleGameOver();
        }, 3000);
    }

    // Warning göster
    showWarning(violation) {
        const warningText = this.scene.add.text(
            this.scene.scale.width / 2,
            140,
            `⚠️ POSITION WARNING: ${violation.type}\nPosition has been reset!`,
            {
                fontSize: '18px',
                fill: '#ffaa00',
                align: 'center',
                fontFamily: 'monospace',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        warningText.setOrigin(0.5);
        warningText.setDepth(9999);

        // 3 saniye sonra kaybolsun
        setTimeout(() => {
            if (warningText && warningText.destroy) {
                warningText.destroy();
            }
        }, 3000);
    }

    // Position force reset
    forcePositionReset() {
        if (!this.scene.player) return;

        console.log('🔄 Force resetting player position to last valid position');

        this.scene.player.setPosition(this.lastValidPosition.x, this.lastValidPosition.y);
        this.currentPosition = {
            x: this.lastValidPosition.x,
            y: this.lastValidPosition.y
        };

        // Reset physics velocity if any
        if (this.scene.player.body) {
            this.scene.player.body.setVelocity(0, 0);
        }
    }

    // Position history cleanup
    cleanupPositionHistory() {
        const cutoff = Date.now() - this.historyWindow;
        this.positionHistory = this.positionHistory.filter(pos => pos.timestamp > cutoff);
        this.violations = this.violations.filter(violation => violation.timestamp > cutoff);
    }

    // Movement pattern analizi
    analyzeMovementPatterns() {
        if (this.positionHistory.length < 10) return;

        const recent = this.positionHistory.slice(-10);
        const movements = [];

        for (let i = 1; i < recent.length; i++) {
            const prev = recent[i - 1];
            const curr = recent[i];
            const timeDiff = curr.timestamp - prev.timestamp;
            const distance = Math.sqrt(
                Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
            );

            if (timeDiff > 0) {
                movements.push({
                    distance: distance,
                    time: timeDiff,
                    speed: (distance / timeDiff) * 1000
                });
            }
        }

        if (movements.length === 0) return;

        // Average speed analizi
        const avgSpeed = movements.reduce((sum, m) => sum + m.speed, 0) / movements.length;

        // Pattern detection - sürekli yüksek hız
        const highSpeedCount = movements.filter(m => m.speed > this.maxMovementSpeed * 0.8).length;

        if (highSpeedCount >= 5) {
            console.log('🚨 Suspicious movement pattern: sustained high speed');
            console.log(`Average speed: ${avgSpeed.toFixed(2)} px/s`);
        }
    }

    // Manual position check (debug için)
    checkCurrentPosition() {
        if (!this.scene.player) return;

        const currentPos = {
            x: this.scene.player.x,
            y: this.scene.player.y,
            timestamp: Date.now()
        };

        const validation = this.validatePosition(currentPos);

        console.log('📍 POSITION CHECK:');
        console.log('Current position:', currentPos);
        console.log('Last valid position:', this.lastValidPosition);
        console.log('Validation result:', validation);
        console.log('Trust score:', this.trustScore + '%');
    }

    // Status bilgisi
    getStatus() {
        return {
            isActive: this.isActive,
            trustScore: this.trustScore,
            currentPosition: this.currentPosition,
            lastValidPosition: this.lastValidPosition,
            positionHistoryLength: this.positionHistory.length,
            violationCount: this.violations.length,
            teleportCount: this.teleportCount,
            boundaryViolations: this.boundaryViolations,
            suspiciousMovements: this.suspiciousMovements.length,
            trackingInterval: this.trackingInterval + 'ms'
        };
    }

    // Son violationları göster
    getRecentViolations(count = 3) {
        return this.violations.slice(-count);
    }

    // Position history göster
    getPositionHistory(count = 10) {
        return this.positionHistory.slice(-count);
    }
}

// Global access
window.WizardPositionValidation = WizardPositionValidation;

console.log('📍 Position Validation System loaded and ready!');

// ------------------- Start Scene -------------------

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }



    preload() {
        this.load.image('start-button', 'assets_w/ui/start-button.png');
        this.load.image('sound-on', 'assets_w/ui/sound-on-white.png');    // Ses açık ikonu
        this.load.image('sound-off', 'assets_w/ui/sound-off-white.png');  // Ses kapalı ikonu
        this.load.image('start', 'assets_w/ui/start.png');
        this.load.image('howToButton', 'assets_w/ui/howToBtn.png')

        this.load.audio('background-music', 'assets_w/audio/background-music.mp3');
        this.load.audio('button-click', 'assets_w/audio/button-click.mp3');
    }

    create() {
        this.background = this.add.image(config.width / 2, config.height / 2, 'start')

        // 🌐 API'yi test et - BURAYA EKLE
        window.wizardAPI.getStatus().then(statusData => {
            if (statusData) {
                console.log('🎮 Backend bağlantısı başarılı!', statusData.message);
            } else {
                console.log('❌ Backend bağlantısı başarısız!');
            }
        });

        // Arkaplan müziği başlat
        this.backgroundMusic = this.sound.add('background-music', {
            volume: 0.3,
            loop: true
        });
        this.backgroundMusic.play();

        // Button click sesi
        this.buttonClickSound = this.sound.add('button-click', { volume: 0.7 });

        // SES BUTONU
        this.isSoundOn = true;
        this.soundButton = this.add.image(config.width - 50, 50, 'sound-on');
        this.soundButton.setDepth(10); // Ses butonunu öne al
        this.soundButton.setOrigin(0.5);
        this.soundButton.setScale(0.15);
        this.soundButton.setInteractive({ useHandCursor: true });

        this.soundButton.on('pointerdown', () => {
            this.isSoundOn = !this.isSoundOn;

            if (this.isSoundOn) {
                this.soundButton.setTexture('sound-on');
                this.sound.mute = false;
            } else {
                this.soundButton.setTexture('sound-off');
                this.sound.mute = true;
            }
        });

        // Parlayan efekt - arka plan için overlay
        let glowGraphics = this.add.graphics();
        glowGraphics.fillStyle(0xffff00, 0.1);
        glowGraphics.fillRect(0, 0, 1000, 600);

        // Glow efekti animasyonu
        this.tweens.add({
            targets: glowGraphics,
            alpha: { from: 0.1, to: 0.2 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Buton
        this.startButton = this.add.image(config.width / 2, config.height / 2 + 150, 'start-button');
        this.startButton.setScale(0.4);
        this.startButton.setInteractive({ useHandCursor: true });
        this.startButton.setDepth(2);


        // Buton için pulse efekti
        let buttonTween = this.tweens.add({
            targets: [this.startButton],
            scaleX: { from: this.startButton.scaleX, to: this.startButton.scaleX * 1.1 },
            scaleY: { from: this.startButton.scaleY, to: this.startButton.scaleY * 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Buton efektleri
        this.startButton.on('pointerover', () => {
            this.startButton.setScale(0.45);
            buttonTween.pause();
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setScale(0.4);
            buttonTween.resume();
        });

        this.startButton.on('pointerdown', () => {
            // Button click sesi çal
            this.buttonClickSound.play();
            this.startButton.disableInteractive();
            this.startButton.setVisible(false);
            // Menü müziğini durdur
            this.backgroundMusic.stop();
            this.scene.start('GameScene');

        });

        this.isPopupOpen = false;
        this.howToPlayBtn = this.add.image(config.width / 2, config.height - 100, 'howToButton')
        this.howToPlayBtn.setScale(0.4)
        this.howToPlayBtn.setInteractive({ useHandCursor: true });

        // Buton efektleri
        this.howToPlayBtn.on('pointerover', () => {
            this.howToPlayBtn.setScale(0.45);
        });

        this.howToPlayBtn.on('pointerout', () => {
            this.howToPlayBtn.setScale(0.4);
        });

        this.howToPlayBtn.on('pointerdown', () => {
            this.openHowToPlayPopup();
        });
    }

    openHowToPlayPopup() {
        this.howToPlayBtn.disableInteractive();
        this.startButton.disableInteractive();
        const popupBg = this.add.rectangle(
            config.width / 2, config.height / 2,
            config.width * 0.9, config.height * 0.6,
            0x000000, 0.85
        ).setScrollFactor(0).setDepth(2000);

        const howToPlayText = this.add.text(
            config.width / 2, config.height / 2,
            '→ Fareyi sürükleyip nişan al:\n→ Büyü topunu fırlat\n→Hedefleri vurarak skor topla, zehir şişelerini vurmaktan kaçın!',
            {
                fontSize: '40px',
                fontFamily: 'monospace',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: config.width * 0.8 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

        const closeText = this.add.text(
            config.width / 2, config.height / 2 + 180,
            'Kapat', {
            fontSize: '35px',
            fontFamily: 'monospace',
            fill: '#ff6666',
            backgroundColor: '#ffffff',
            padding: { x: 12, y: 5 }
        }
        ).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(2002);

        closeText.on('pointerup', () => {
            this.isPopupOpen = false;
            popupBg.destroy();
            howToPlayText.destroy();
            closeText.destroy();
            this.howToPlayBtn.setInteractive();
            this.startButton.setInteractive();
        });
    }

}

// ------------------- GameScene -------------------
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('cloud', 'assets_w/background/cloud.png');
        this.load.image('background', 'assets_w/background/wizard-castle.png');
        this.load.image('moon', 'assets_w/background/moon.png');
        this.load.image('raindrop', 'assets_w/background/raindrop.png');
        this.load.image('fog', 'assets_w/background/fog.png');
        this.load.image('background-space', 'assets_w/background/background-space.png')

        this.load.image('item', 'assets_w/coin.png');
        this.load.image('bomb', 'assets_w/poison.png');
        this.load.image('fireball-b', 'assets_w/fireball-b.png');
        this.load.image('fireball-r', 'assets_w/fireball-r.png');
        this.load.image('fireball-g', 'assets_w/fireball-g.png');
        this.load.image('player', 'assets_w/wizard.png');
        this.load.image('explosion', 'assets_w/explosion.png');
        this.load.image('sound-on', 'assets_w/ui/sound-on-white.png');    // Ses açık ikonu
        this.load.image('sound-off', 'assets_w/ui/sound-off-white.png');  // Ses kapalı ikonu
        this.load.image('skor-panel', 'assets_w/ui/score-image.png');
        this.load.image('heart', 'assets_w/ui/heart.png');
        this.load.image('trophy', 'assets_w/trophy.png')

        // Tüm ses dosyaları
        this.load.audio('background-music', 'assets_w/audio/background-music.mp3');
        this.load.audio('coin-sound', 'assets_w/audio/coin.mp3');
        this.load.audio('bomb-sound', 'assets_w/audio/explosion.mp3');
        this.load.audio('shoot-sound', 'assets_w/audio/shoot.mp3');
        this.load.audio('level-complete', 'assets_w/audio/level-complete.mp3');
        this.load.audio('lightning-sound', 'assets_w/audio/lightning.mp3');
    }

    create() {
        this.gameActive = true;

        // 🌐 API client'i sahiple - BURAYA EKLE
        this.api = window.wizardAPI;
        this.gameStartTime = Date.now(); // ⏰ Oyun başlangıç zamanı
        console.log('🎮 GameScene API client hazır');

        // API'den config al
        this.api.getGameConfig().then(config => {
            if (config) {
                console.log('📡 Backend config alındı:', config);
                this.backendConfig = config; // Sakla
            }
        });

        // 📸 Snapshot Protection sistemi başlat - BURAYA EKLE
        this.snapshotProtection = new WizardSnapshotProtection(this);
        this.snapshotProtection.setAPIClient(this.api);
        this.snapshotProtection.start();

        // Global access
        window.wizardGameScene = this;


        // 🍯 Honeypot Detection sistemi başlat - BURAYA EKLE
        this.honeypot = new WizardHoneypot(this);
        this.honeypot.setSessionId(this.api.sessionId);

        console.log('🛡️ All security systems initialized');

        console.log('🛡️ All security systems initialized');

        // 🔥 Real-Time Monitoring sistemi başlat - YENİ!
        this.realTimeMonitor = new WizardRealTimeMonitor(this);
        this.realTimeMonitor.setAPIClient(this.api);
        this.realTimeMonitor.start();

        // 🛡️ Variable Protection sistemi başlat - YENİ!
        this.variableProtection = new WizardVariableProtection(this);
        this.variableProtection.start();

        // 📊 Rate Limiting sistemi başlat - YENİ!
        this.rateLimiting = new WizardRateLimiting(this);
        this.rateLimiting.start();

        //📍 Position Validation sistemi başlat - YENİ!
        this.positionValidation = new WizardPositionValidation(this);
        this.positionValidation.start();


        console.log('🛡️ All security systems initialized');
        console.log('🔥 Real-Time Monitoring: ACTIVE');
        console.log('📸 Snapshot Protection: ACTIVE');
        console.log('🍯 Honeypot Detection: ACTIVE');
        console.log('🛡️ Variable Protection: ACTIVE'); // YENİ!
        console.log('📊 Rate Limiting: ACTIVE'); // YENİ!
        console.log('📍 Position Validation: ACTIVE'); // YENİ!

        // Arkaplan müziği başlat
        this.backgroundMusic = this.sound.add('background-music', {
            volume: 0.2,
            loop: true
        });
        this.backgroundMusic.play();

        // Ses efektlerini yükle
        this.coinSound = this.sound.add('coin-sound', { volume: 0.1 });
        this.bombSound = this.sound.add('bomb-sound', { volume: 0.6 });
        this.shootSound = this.sound.add('shoot-sound', { volume: 0.4 });
        this.levelCompleteSound = this.sound.add('level-complete', { volume: 0.6 });
        this.lightningSound = this.sound.add('lightning-sound', { volume: 0.7 });

        this.input.keyboard.on('keydown-J', () => {
            this.handleGameWin();
        });

        this.input.keyboard.on('keydown-K', () => {
            this.scene.start('WinScene');
            this.backgroundMusic.stop();
        });

        this.input.keyboard.on('keydown-L', () => {
            this.handleGameOver();
        });

        this.input.keyboard.on('keydown-M', () => {
            console.log('🛡️ SECURITY SYSTEMS STATUS:');
            console.log('📊 Real-Time Monitor:', this.realTimeMonitor.getStatus());
            console.log('📸 Snapshot Protection:', this.snapshotProtection.getStatus());
            console.log('🍯 Honeypot System:', this.honeypot.getStatus());
            console.log('🛡️ Variable Protection:', this.variableProtection.getStatus());
            console.log('📊 Rate Limiting:', this.rateLimiting.getStatus()); // YENİ!
            console.log('📍 Position Validation:', this.positionValidation.getStatus()); // YENİ!
        });

        this.input.keyboard.on('keydown-V', () => {
            console.log('🧪 VARIABLE PROTECTION SAFE TEST');
            console.log('Eski skor:', wizardGameScene.score);

            // Küçük, güvenli artış (timing kontrolünü tetiklemeyen)
            wizardGameScene.score += 30;
            wizardGameScene.itemScoreText.setText(wizardGameScene.score);

            console.log('Yeni skor:', wizardGameScene.score);
            console.log('⏰ Variable Protection validation çalışacak ama game over OLMAYACAK...');
        });

        this.input.keyboard.on('keydown-R', () => {
            console.log('🧪 RATE LIMITING SAFE TEST');
            for (let i = 0; i < 8; i++) { // 20'den 8'e düşür
                setTimeout(() => {
                    this.shootArrow(300, -100);
                }, i * 150); // 50ms'den 150ms'ye çıkar
            }
            console.log('⏰ Rate limiting warning vermeli ama game over OLMAMALI...');
        });

        // Position Validation test tuşu
        this.input.keyboard.on('keydown-P', () => {
            console.log('🧪 POSITION VALIDATION TEST');

            // Player'ı teleport et
            const oldX = this.player.x;
            const oldY = this.player.y;

            this.player.setPosition(oldX + 200, oldY + 200); // 200px teleport

            console.log(`Player teleported from (${oldX}, ${oldY}) to (${this.player.x}, ${this.player.y})`);
            console.log('⏰ Position validation bunu tespit etmeli...');
        });

        // Position check tuşu
        this.input.keyboard.on('keydown-O', () => {
            this.positionValidation.checkCurrentPosition();
        });

        this.itemSpawnInterval; // item spawn aralığı
        this.itemSpawnTimer = 0;
        this.bombSpawnInterval; // 2 saniyede bir bomba spawn etme
        this.bombSpawnTimer = 0;

        this.score = 0;
        this.initialTime = 15;  // saniye cinsinden başlangıç süresi
        this.hearts = 3; // Oyuncunun canı
        this.arrowsFired = 0;
        this.itemsSpawned = 0;
        this.bombsSpawned = 0;
        this.itemsHit = 0;
        this.bombsHit = 0;
        this.startTime = Date.now();
        this.durationMs;
        this.didWin = false


        this.physics.world.setBounds(0, 0, config.width, config.height); // Oyun alanının sınırlarını ayarla

        // SES BUTONU
        this.isSoundOn = true;
        this.soundButton = this.add.image(config.width - 50, 50, 'sound-on');
        this.soundButton.setDepth(10); // Ses butonunu öne al
        this.soundButton.setOrigin(0.5);
        this.soundButton.setScale(0.15);
        this.soundButton.setInteractive({ useHandCursor: true });

        this.soundButton.on('pointerdown', () => {
            this.isSoundOn = !this.isSoundOn;

            if (this.isSoundOn) {
                this.soundButton.setTexture('sound-on');
                this.sound.mute = false;
            } else {
                this.soundButton.setTexture('sound-off');
                this.sound.mute = true;
            }
        });



        // Arka plan resmi
        this.background = this.add.image(config.width / 2, config.height / 2, 'background');
        this.background.setDisplaySize(config.width, config.height); // Arka planın boyutunu ayarla

        this.backgroundSpace = this.add.image(config.width / 2, config.height / 2, 'background-space');
        this.backgroundSpace.setDisplaySize(config.width, config.height); // Arka planın boyutunu ayarla
        this.backgroundSpace.setDepth(-1);

        // tam ekran beyaz rectangle (fade için)
        this.fadeRect = this.add
            .rectangle(0, 0, config.width, config.height, 0xffffff)
            .setOrigin(0)
            .setDepth(200);
        this.fadeRect.alpha = 0;

        //Player oluşturma
        this.player = this.physics.add.sprite(250, config.height / 2, 'player');
        this.player.setDisplaySize(300, 300); // Oyuncunun boyutunu ayarla
        this.player.setCollideWorldBounds(true); // Oyuncu dünya sınırlarına çarptığında duracak
        this.player.body.setAllowGravity(false); // Oyuncunun yerçekimi etkisi
        this.player.body.setImmovable(true); // Oyuncu hareket edemeyecek
        this.tweens.add({
            targets: this.player,
            y: this.player.y - 10,        // 10px yukarı çık
            duration: 2000,
            ease: 'Sine.easeInOut', // yumuşak geçiş
            yoyo: true,
            repeat: -1              // sonsuz tekrar
        });

        //gruplar
        this.arrows = this.physics.add.group();
        this.bombs = this.physics.add.group();
        this.items = this.physics.add.group();

        //overlaplar
        this.physics.add.overlap(this.arrows, this.items, this.hitItem, null, this);
        this.physics.add.overlap(this.arrows, this.bombs, this.hitBomb, null, this);

        this.timerText = this.add.text(300, 60, this.initialTime, {
            fontSize: '30px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fill: '#ffffff',
            stroke: '#00ff00',
            strokeThickness: 4,
        })
        this.timerText.setDepth(15)

        // Her saniye bir kere çalışacak bir event oluştur
        this.countdownTimer = this.time.addEvent({
            delay: 1000,                // ms cinsinden: 1 saniye
            callback: () => {
                this.initialTime--;
                this.timerText.setText(this.initialTime);

                if (this.initialTime <= 0) {
                    // Süre bitti: oyun bitti sahnesine ge
                    this.handleGameOver();

                }
            },
            callbackScope: this,
            loop: true
        });

        this.addUIElements(); // UI elementlerini ekle

        this.addBackgroundElements();

        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.power = 10;


        this.trajectoryLine = this.add.graphics();
        this.trajectoryLine.setDepth(5); // Çizgiyi öne al


        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.isDragging = true;
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                let dragOffsetX = this.dragStartX - pointer.x;
                let dragOffsetY = this.dragStartY - pointer.y;

                let velocityX = dragOffsetX * this.power;
                let velocityY = dragOffsetY * this.power;

                this.drawTrajectory(355, this.game.config.height / 2 - 120, velocityX, velocityY);
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.trajectoryLine.clear();

                let dragStopX = pointer.x;
                let dragStopY = pointer.y;

                let dragOffsetX = this.dragStartX - dragStopX;
                let dragOffsetY = this.dragStartY - dragStopY;

                if (dragOffsetX !== 0 && dragOffsetY !== 0) {
                    this.shootArrow(dragOffsetX * this.power, dragOffsetY * this.power);
                }
            }
        });
        // 📊 Click tracking ekle - YENİ!
        this.input.on('pointerdown', (pointer) => {
            if (this.rateLimiting) {
                this.rateLimiting.recordClick(pointer.x, pointer.y, pointer.leftButtonDown() ? 'left' : 'right');
            }
        });
    }

    update(time, delta) {
        this.items.children.each((item) => {
            if (item.from == 'top' && item.y > config.height + 50) {
                item.destroy();
            } else if (item.from == 'bottom' && item.y < -50) {
                item.destroy();
            }
        });

        this.bombs.children.each((bomb) => {
            if (bomb.from == 'top' && bomb.y > config.height + 50) {
                bomb.destroy();
            } else if (bomb.from == 'bottom' && bomb.y < -50) {
                bomb.destroy();
            }
        });

        //oku gittiği yöne göre döndürme ve kaçan okları silme
        this.arrows.children.each((arrow) => {
            if (arrow.y < -50 || arrow.y > config.height + 50) {
                arrow.destroy();
            }
        });

        switch (this.score) {
            case 0:
                this.setDifficulty('easy');
                break;
            case 100:
                this.setDifficulty('medium');
                break;
            case 200:
                this.setDifficulty('hard');
                break;
            case 300:
                this.setDifficulty('very-hard');
                break;
            default:
                // Diğer durumlar için hiçbir şey yapma
                break;
        }

        // Item spawn etme
        this.itemSpawnTimer += delta;
        if (this.itemSpawnTimer >= this.itemSpawnInterval) {
            if (Phaser.Math.Between(0, 1) === 0) {
                this.addItem("top");
            } else {
                this.addItem("bottom");
            }
            this.itemSpawnTimer = 0;
        }

        // Bomba spawn etme
        this.bombSpawnTimer += delta;
        if (this.bombSpawnTimer >= this.bombSpawnInterval) {
            if (Phaser.Math.Between(0, 1) === 0) {
                this.addBomb("top");
            } else {
                this.addBomb("bottom");
            }
            this.bombSpawnTimer = 0;
        }

        this.clouds.children.iterate((cloud) => {
            cloud.x += 0.2;
            if (cloud.x > config.width + 50) {
                cloud.x = -50;
                cloud.y = Phaser.Math.Between(50, 200);
            }
        });

        this.fogs.children.iterate((fog) => {
            fog.x += 0.2;
            if (fog.x > config.width + 50) {
                fog.x = -50;
                fog.y = Phaser.Math.Between(config.height - 100, config.height);

            }
        });
        if (this.honeypot) {
            this.honeypot.trackPlayerArrows();
        }
    }

    addUIElements() {
        // Score image
        this.skor = this.add.image(150, 80, 'skor-panel');
        this.skor.setScale(0.2); // Adjust scale as needed
        this.skor.setOrigin(0.5);
        this.skor.setDepth(15)

        // Score value text
        this.itemScoreText = this.add.text(190, 80, '0', {
            fontSize: '30px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fill: '#d6eaf8',
            stroke: '#5DADE2',
            strokeThickness: 4
        });
        this.itemScoreText.setOrigin(0, 0.5);
        this.itemScoreText.setScrollFactor(0);
        this.itemScoreText.setDepth(15)

        this.heartIcons = [];
        for (let i = 0; i < this.hearts; i++) {
            let heart = this.add.image(120 + i * 30, 160, 'heart');
            heart.setScale(0.1); // İsteğe göre ayarla
            heart.setScrollFactor(0); // Kamerayla sabit kalsın
            heart.setDepth(15)
            this.heartIcons.push(heart);
        }
    }

    addBackgroundElements() {
        //bulutlar
        this.clouds = this.add.group();
        for (let i = 0; i < 3; i++) {
            let cloud = this.add.image(
                Phaser.Math.Between(0, config.width),
                Phaser.Math.Between(0, 75),
                'cloud'
            );
            cloud.setAlpha(0.6);
            cloud.setScale(Phaser.Math.FloatBetween(0.2, 0.6));
            cloud.setDepth(10)
            this.clouds.add(cloud);
        }

        //yıldırım
        this.lightningTimer = this.time.addEvent({
            delay: 10000, // 10 saniye (ms cinsinden)
            callback: this.autoLightning,
            callbackScope: this,
            loop: true
        });

        //sis
        this.fogs = this.add.group();
        for (let i = 0; i < 10; i++) {
            let fog = this.add.image(
                Phaser.Math.Between(0, config.width),
                Phaser.Math.Between(config.height - 50, config.height),
                'fog'
            );
            fog.setAlpha(0.1);
            fog.setScale(Phaser.Math.FloatBetween(0.8, 1.2));
            fog.setDepth(10)
            this.fogs.add(fog);
        }

        //yağmur
        let rainParticles = this.add.particles('raindrop');

        rainParticles.createEmitter({
            x: { min: 0, max: config.width },
            y: 0,
            lifespan: 6000,
            speedX: { min: 0, max: -100 },
            speedY: { min: 500, max: 800 },
            scale: { start: 0.05, end: 0.05 },
            quantity: 1,
            frequency: 500, // Milisaniye cinsinden damla sıklığı (300ms'de bir damla)
            alpha: 0.5,
            blendMode: 'ADD'
        });

        //dolunay
        let moon = this.add.image(config.width - 100, 100, 'moon');
        moon.setScale(0.2);
        moon.setAlpha(0.4);
        moon.setScrollFactor(0); // Kamera hareket ederse sabit kalır
        moon.setDepth(5)
    }

    autoLightning() {
        // Yıldırım sesi çal
        this.lightningSound.play();
        const x = Phaser.Math.Between(50, config.width - 50);
        const y = Phaser.Math.Between(0, 200);
        this.drawLightning(x, y);
    }

    drawLightning(x) {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff); // Beyaz çizgi
        let startX = x;
        let startY = 0;

        for (let i = 0; i < 20; i++) {
            let endX = startX + Phaser.Math.Between(-20, 20);
            let endY = startY + Phaser.Math.Between(10, 30);

            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, endY);
            graphics.strokePath();

            startX = endX;
            startY = endY;
        }

        // Kısa süre sonra yok et (efekt gibi görünmesi için)
        this.time.delayedCall(100, () => {
            graphics.destroy();
        });
    }

    // Okun gideceği yöne göre çizgi çizme
    drawTrajectory(startX, startY, velocityX, velocityY) {
        this.trajectoryLine.clear();

        const gravity = this.physics.world.gravity.y;
        const timeStep = 0.05;
        const totalTime = 1.5;

        // Güce göre renk hesapla
        let power = Math.sqrt(velocityX ** 2 + velocityY ** 2);
        let color = Phaser.Display.Color.Interpolate.ColorWithColor(
            new Phaser.Display.Color(181, 80, 156), // açık mor
            new Phaser.Display.Color(102, 1, 152),   // koyu mor
            1000,
            Math.min(power, 1000)
        );
        let hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

        this.trajectoryLine.lineStyle(2, 0xffffff, 1);

        // Nokta çizimi
        for (let t = 0; t < totalTime; t += timeStep) {
            let dx = velocityX * t;
            let dy = velocityY * t + 0.5 * gravity * t * t;

            let pointX = startX + dx;
            let pointY = startY + dy;

            // Ekran dışına taşmasın
            if (
                pointX < 0 || pointX > this.game.config.width ||
                pointY < 0 || pointY > this.game.config.height
            ) {
                break;
            }

            this.trajectoryLine.strokeCircle(pointX, pointY, 5); // 2px yarıçaplı nokta
        }
    }

    async shootArrow(x, y) {
        // 🌐 API'ye ok atışını bildir - BURAYA EKLE
        if (this.api) {
            await this.api.recordArrowShot(x, y);
        }

        // 🔥 Real-time monitoring'e action kaydet
        if (this.realTimeMonitor) {
            this.realTimeMonitor.recordAction('arrow_shot', {
                velocityX: x,
                velocityY: y,
                playerPosition: { x: this.player.x, y: this.player.y }
            });
        }

        // 📊 Rate limiting'e arrow shot kaydet
        if (this.rateLimiting) {
            this.rateLimiting.recordArrowShot(x, y);
        }
        // Ateş etme sesi çal
        this.shootSound.play();
        let fireballTexture;
        let rnd = Phaser.Math.Between(1, 3)
        switch (rnd) {
            case 1:
                fireballTexture = 'fireball-g'
                break;
            case 2:
                fireballTexture = 'fireball-b'
                break;
            case 3:
                fireballTexture = 'fireball-r'
                break;

        }
        let arrow = this.arrows.create(355, this.game.config.height / 2 - 120, fireballTexture);
        arrow.setScale(0.1);
        arrow.setDepth(101);
        arrow.body.setCircle(275, 275);
        arrow.body.setOffset(0, 0); // Görselin içine göre konumu ayarla
        arrow.setVelocity(x, y);
        arrow.setAngularVelocity(Phaser.Math.Between(-300, 300))


        // SOPA GERİ GİTME ANİMASYONU:
        let originalX = this.player.x;
        this.tweens.add({
            targets: this.player,
            x: originalX - 15,  // 15 piksel geri git
            duration: 80,       // 80ms'de geri git
            ease: 'Power2',
            yoyo: true,         // geri dön
            onComplete: () => {
                this.player.x = originalX; // Orijinal pozisyona kesinlikle dön
            }
        });

        // ATEŞ EFEKTİ EKLE:
        let muzzleFlash = this.add.circle(355, this.game.config.height / 2 - 120, 30, 0xffffff);
        muzzleFlash.setDepth(102);
        muzzleFlash.setAlpha(0.8);

        this.tweens.add({
            targets: muzzleFlash,
            scaleX: { from: 0.5, to: 2 },
            scaleY: { from: 0.5, to: 2 },
            alpha: { from: 0.8, to: 0 },
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                muzzleFlash.destroy();
            }
        });

        this.arrowsFired++;
    }

    // Item ekleme
    addItem(locY) {
        if (!this.gameActive) return;

        let xArray = []; // X koordinatları için bir dizi oluştur
        let y;
        let velocity;
        for (let index = config.width / 2 + 100; index < config.width; index += 100) { // 100 piksel aralıklarla X koordinatlarını ekle
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        if (locY == 'top') { //yukarıda spawn olsun ve aşağı doğru gitsin
            y = Phaser.Math.Between(-100, -300);
            velocity = Phaser.Math.Between(100, 300);
        }
        else if (locY == 'bottom') { //aşağıda spawn olsun ve yukarı doğru gitsin
            y = Phaser.Math.Between(config.height + 100, config.height + 300);
            velocity = Phaser.Math.Between(-100, -300);
        }
        else {
            console.error('Geçersiz konum: ' + locY);
            return;
        }
        let item = this.items.create(x, y, 'item');
        item.from = locY; // Itemin konumunu kaydet
        item.scale = 0.2; // Item boyutunu ayarla
        item.setDepth(20);
        item.body.setAllowGravity(false); // Itemlerin yerçekimi etkisi olmasın
        item.setVelocityY(velocity)
        this.itemsSpawned++;
    }

    //bomba ekleme
    addBomb(locY) {
        if (!this.gameActive) return;

        let xArray = []; // X koordinatları için bir dizi oluştur
        let y;
        let velocity;
        for (let index = config.width / 2 + 100; index < config.width; index += 100) { // 100 piksel aralıklarla X koordinatlarını ekle
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        if (locY == 'top') { //yukarıda spawn olsun ve aşağı doğru gitsin
            y = Phaser.Math.Between(-100, -300);
            velocity = Phaser.Math.Between(100, 300);
        }
        else if (locY == 'bottom') { //aşağıda spawn olsun ve yukarı doğru gitsin
            y = Phaser.Math.Between(config.height + 100, config.height + 300);
            velocity = Phaser.Math.Between(-100, -300);
        }
        else {
            console.error('Geçersiz konum: ' + locY);
            return;
        }
        let bomb = this.bombs.create(x, y, 'bomb');
        bomb.from = locY; // Bombanın konumunu kaydet
        bomb.setScale(0.15); // Bomba boyutunu ayarla
        bomb.setAngularVelocity(Phaser.Math.Between(-100, 100)); // Bombanın rastgele dönmesini sağla
        bomb.body.setAllowGravity(false); // Bombaların yerçekimi etkisi olmasın
        bomb.setVelocityY(velocity);
        this.bombsSpawned++;
    }

    // Iteme vurma işlemi
    async hitItem(arrow, item) {
        // Coin toplama sesi çal
        this.coinSound.play();
        // 1) Varolan skor mantığı
        this.itemsHit++;
        item.destroy();
        arrow.destroy();
        this.score += 10;
        this.itemScoreText.setText(this.score);

        // 🔥 Real-time monitoring'e action kaydet
        if (this.realTimeMonitor) {
            this.realTimeMonitor.recordAction('item_hit', {
                score: this.score,
                itemPosition: { x: item.x, y: item.y },
                arrowPosition: { x: arrow.x, y: arrow.y }
            });
        }

        // 🌐 API'ye item hit bildir - BURAYA EKLE
        if (this.api) {
            const result = await this.api.recordItemHit(this.score);
            if (result && result.isVictory) {
                console.log('🏆 Backend victory onayladı!');
            }
        }

        // 2) Zaman bonusu
        const bonus = 3;
        this.initialTime += bonus;

        // 3) Timer metnine pulse & renk animasyonu
        this.tweens.add({
            targets: this.timerText,
            scale: 1.4,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });

        // Renk geçişi
        this.tweens.addCounter({
            from: 0, to: 100,
            duration: 400,
            onUpdate: tween => {
                const v = tween.getValue();
                const c = Phaser.Display.Color.Interpolate.ColorWithColor(
                    new Phaser.Display.Color(255, 255, 0),  // sarı
                    new Phaser.Display.Color(0, 255, 0),    // yeşil
                    100, v
                );
                const hex = Phaser.Display.Color.GetColor(c.r, c.g, c.b);
                this.timerText.setStyle({ color: '#' + hex.toString(16).padStart(6, '0') });
            },
            onComplete: () => {
                this.timerText.setStyle({ color: '#ffffff' }); // orijinal yeşile dönüş
            }
        });

        // 4) Floating “+Xs” text efekti
        const fx = this.add.text(
            this.timerText.x + this.timerText.width + 8,
            this.timerText.y,
            `+${bonus}s`,
            {
                fontSize: '24px',
                fontFamily: 'monospace',
                fill: '#ffffff',
                stroke: '#00ff00',
                strokeThickness: 3
            }
        )
            .setDepth(20)
            .setOrigin(0, 0.5);

        this.tweens.add({
            targets: fx,
            y: fx.y - 30,    // yukarıya kaydır
            alpha: 0,        // şeffaflaştır
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => fx.destroy()
        });


        if (this.score >= 500) {
            this.handleGameWin();
        }
    }

    //bomba vurma işlemi
    async hitBomb(arrow, bomb) {
        // Bomba patlaması sesi çal
        this.bombSound.play();
        bomb.destroy(); // Bombayı yok et
        arrow.destroy(); // Okun kendisini yok et
        this.bombsHit++;

        if (this.hearts > 0) {
            this.hearts--; // Canı azalt

            // 🔥 Real-time monitoring'e action kaydet
            if (this.realTimeMonitor) {
                this.realTimeMonitor.recordAction('bomb_hit', {
                    hearts: this.hearts,
                    bombPosition: { x: bomb.x, y: bomb.y },
                    arrowPosition: { x: arrow.x, y: arrow.y }
                });
            }

            // 🌐 API'ye bomb hit bildir - BURAYA EKLE
            if (this.api) {
                const result = await this.api.recordBombHit(this.hearts);
                if (result && result.isGameOver) {
                    console.log('💀 Backend game over onayladı!');
                }
            }

            const heartToRemove = this.heartIcons[this.hearts];

            // Fade-out efekti ile kalbi yok et
            this.tweens.add({
                targets: heartToRemove,
                alpha: 0,
                duration: 300,
                ease: 'Linear',
                onComplete: () => {
                    heartToRemove.destroy();
                }
            });

            // Diziden de çıkar
            this.heartIcons.splice(this.hearts, 1);
        }

        // Patlama efekti oluştur
        let explosion = this.add.image(bomb.x, bomb.y, 'explosion');
        explosion.setScale(0.1);
        explosion.setDepth(10);

        // Patlamayı yavaşça kaybolacak şekilde animasyonla yok et
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            onComplete: () => {
                explosion.destroy();
            }
        });

        // Can 0'a düşerse oyunu bitir
        if (this.hearts <= 0) {
            this.handleGameOver();
        }
    }

    clearScreen() {
        this.items.clear(true, true);
        this.bombs.clear(true, true);
        this.arrows.clear(true, true);
    }

    handleGameOver() {
        this.gameActive = false;
        // 🛡️ Güvenlik sistemlerini durdur
        if (this.realTimeMonitor) {
            this.realTimeMonitor.stop();
        }

        if (this.snapshotProtection) {
            this.snapshotProtection.stop();
        }

        if (this.honeypot) {
            this.honeypot.cleanup();
        }
        if (this.variableProtection) {
            this.variableProtection.stop();
        }
        if (this.rateLimiting) {
            this.rateLimiting.stop();
        }
        if (this.positionValidation) {
            this.positionValidation.stop();
        }

        console.log('🛡️ All security systems stopped');
        this.clearScreen();
        this.sound.stopAll();
        this.lightningTimer.remove();
        this.scene.start('GameOverScene', {
            finalScore: this.score,
            heartsLeft: this.hearts,
            arrowsFired: this.arrowsFired,
            itemsSpawned: this.itemsSpawned,
            bombsSpawned: this.bombsSpawned,
            itemsHit: this.itemsHit,
            bombsHit: this.bombsHit,
            durationMs: this.durationMs,
            didWin: this.didWin,
        });
    }

    handleGameWin() {
        // Seviye tamamlama sesi çal
        this.levelCompleteSound.play();
        this.backgroundMusic.stop();
        this.lightningTimer.remove();
        this.countdownTimer.remove();

        // 🛡️ Güvenlik sistemlerini durdur
        if (this.realTimeMonitor) {
            this.realTimeMonitor.stop();
        }

        if (this.snapshotProtection) {
            this.snapshotProtection.stop();
        }

        if (this.honeypot) {
            this.honeypot.cleanup();
        }
        if (this.variableProtection) {
            this.variableProtection.stop();
        }
        if (this.rateLimiting) {
            this.rateLimiting.stop();
        }
        if (this.positionValidation) {
            this.positionValidation.stop();
        }


        console.log('🛡️ All security systems stopped - GAME WON');

        // 1) Anında beyazı “yak”
        this.fadeRect.alpha = 1;
        // 2) Arkaplanları değiştir
        this.backgroundSpace.setDepth(100);
        this.player.setDepth(100);
        this.trajectoryLine.setDepth(100);

        // 3) 1 saniyede beyazı fade-out yap
        this.tweens.add({
            targets: this.fadeRect,
            alpha: 0,
            duration: 3000,
            ease: 'Linear'
        });


        this.gameActive = false;
        this.didWin = true;

        this.clearScreen();
        this.trophy = this.physics.add.sprite(config.width / 2 + 200, config.height / 2, 'trophy');
        this.trophy.setDepth(100);
        this.trophy.setScale(0.5)
        this.trophy.body.setAllowGravity(false);

        this.tweens.add({
            targets: this.trophy,
            y: this.trophy.y - 10,         // yukarı ne kadar çıkacağı
            duration: 1000,
            ease: 'Sine.easeInOut',     // yumuşak geçiş eğrisi
            yoyo: true,                 // geri dönsün
            repeat: -1                  // sonsuza kadar
        });

        this.physics.add.overlap(this.arrows, this.trophy, () => {
            this.scene.start('WinScene', {
                finalScore: this.score,
                heartsLeft: this.hearts,
                arrowsFired: this.arrowsFired,
                itemsSpawned: this.itemsSpawned,
                bombsSpawned: this.bombsSpawned,
                itemsHit: this.itemsHit,
                bombsHit: this.bombsHit,
                durationMs: this.durationMs,
                didWin: this.didWin,
            });
        });

    }

    setDifficulty(level) {
        switch (level) {
            case 'easy':
                this.itemSpawnInterval = 2000;
                this.bombSpawnInterval = 5000;
                break;
            case 'medium':
                this.itemSpawnInterval = 1500;
                this.bombSpawnInterval = 3000;
                break;
            case 'hard':
                this.itemSpawnInterval = 1500;
                this.bombSpawnInterval = 1500;
                break;
            case 'very-hard':
                this.itemSpawnInterval = 1200;
                this.bombSpawnInterval = 800;
                break;
            default:
                console.error('Geçersiz zorluk seviyesi: ' + level);
        }
    }
}

// ------------------- GameOverScene -------------------
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.load.image('game-over', 'assets_w/ui/gameover-screen.png');
        this.load.image('restart-button', 'assets_w/ui/restart-red.png');
        this.load.image('score-image', 'assets_w/ui/score-image.png');    // Ses açık ikonu

        // Ses dosyası
        this.load.audio('game-over-sound', 'assets_w/audio/game-over.mp3');
        this.load.audio('button-click', 'assets_w/audio/button-click.mp3');
    }

    init(data) {
        this.finalScore = data.finalScore;
        this.heartsLeft = data.heartsLeft;
        this.arrowsFired = data.arrowsFired;
        this.itemsSpawned = data.itemsSpawned;
        this.bombsSpawned = data.bombsSpawned;
        this.itemsHit = data.itemsHit;
        this.bombsHit = data.bombsHit;
        this.durationMs = data.durationMs;
        this.didWin = data.didWin;
    }

    create() {
        // Game over sesi çal
        this.gameOverSound = this.sound.add('game-over-sound', { volume: 0.5 });
        this.gameOverSound.play();

        this.buttonClickSound = this.sound.add('button-click', { volume: 0.7 });
        // "Game Over" Yazısı
        this.gameOverText = this.add.image(config.width / 2, config.height / 2, 'game-over')
        this.gameOverText.setOrigin(0.5, 0.5);

        //skor yazısı
        this.FinalScoreText = this.add.text(config.width / 2, config.height / 2 + 220, 'Score : ' + this.finalScore, {
            fontSize: '50px',
            fontWeight: 'bold',
            fill: '#fe3a29',
            stroke: '#fe3a29',
            strokeThickness: 4
        });
        this.FinalScoreText.setOrigin(0.5, 0.5);
        this.FinalScoreText.setScrollFactor(0);
        this.FinalScoreText.setDepth(1);

        // tekrar-oyna button
        const restartButton = this.add.image(config.width / 2, config.height - 200, 'restart-button');
        restartButton.setScale(0.3);
        restartButton.setInteractive({ useHandCursor: true });

        // Buton için pulse efekti
        let buttonTween = this.tweens.add({
            targets: [restartButton],
            scaleX: { from: restartButton.scaleX, to: restartButton.scaleX * 1.1 },
            scaleY: { from: restartButton.scaleY, to: restartButton.scaleY * 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Buton efektleri
        restartButton.on('pointerover', () => {
            restartButton.setScale(restartButton.scaleX * 1.1);
            buttonTween.pause();
        });

        restartButton.on('pointerout', () => {
            restartButton.setScale(restartButton.scaleX * 1.1);
            buttonTween.resume();
        });

        restartButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.buttonClickSound.play();
            restartButton.disableInteractive();
            restartButton.setVisible(false);
            this.scene.start('GameScene');

        });
    }
}


class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    preload() {
        this.load.image('win', 'assets_w/ui/win-screen.png');
        this.load.image('restart', 'assets_w/ui/restart-green.png')

        // Ses dosyası
        this.load.audio('win-sound', 'assets_w/audio/victory.mp3');
        this.load.audio('button-click', 'assets_w/audio/button-click.mp3');
    }

    init(data) {
        this.finalScore = data.finalScore;
        this.heartsLeft = data.heartsLeft;
        this.arrowsFired = data.arrowsFired;
        this.itemsSpawned = data.itemsSpawned;
        this.bombsSpawned = data.bombsSpawned;
        this.itemsHit = data.itemsHit;
        this.bombsHit = data.bombsHit;
        this.durationMs = data.durationMs;
        this.didWin = data.didWin;
    }




    create() {
        // Kazanma sesi çal
        this.winSound = this.sound.add('win-sound', { volume: 0.6 });
        this.winSound.play();

        this.buttonClickSound = this.sound.add('button-click', { volume: 0.7 });

        //kazandınız yazısı
        this.winText = this.add.image(config.width / 2, config.height / 2, 'win');

        // tekrar-oyna button
        const restartButton = this.add.image(config.width / 2, config.height - 200, 'restart');
        restartButton.setScale(0.3);
        restartButton.setInteractive({ useHandCursor: true });

        // Buton için pulse efekti
        let buttonTween = this.tweens.add({
            targets: [restartButton],
            scaleX: { from: restartButton.scaleX, to: restartButton.scaleX * 1.1 },
            scaleY: { from: restartButton.scaleY, to: restartButton.scaleY * 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Buton efektleri
        restartButton.on('pointerover', () => {
            restartButton.setScale(0.4);
            buttonTween.pause();
        });

        restartButton.on('pointerout', () => {
            restartButton.setScale(0.4);
            buttonTween.resume();
        });

        restartButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.buttonClickSound.play();
            restartButton.disableInteractive();
            restartButton.setVisible(false);
            this.scene.start('GameScene');

        });
    }
}

// ------------------- Config -------------------
const config = {
    type: Phaser.AUTO,
    width: 1536,
    height: 1024,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }, //item düşme hızını değiştirir
            debug: false
        }
    },
    scene: [StartScene, GameScene, GameOverScene, WinScene]
};

const game = new Phaser.Game(config);
