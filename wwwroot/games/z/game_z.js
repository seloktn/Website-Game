// 🔐 DEVICE FINGERPRINTING SYSTEM 
// Bu kodu game_z.js dosyanızın EN BAŞINA ekleyin (diğer kodlardan önce)

console.log('🔐 Loading Device Fingerprinting System...');

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
            ctx.fillText('Device fingerprint test 🔒', 15, 15);
            
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

    getBackendCompatibleFingerprint() {
    // ✅ Null/undefined kontrolü ekle
    if (!this.fingerprint) {
        console.error('❌ Fingerprint not generated yet');
        return null;
    }
    
    return {
        UserAgent: this.fingerprint.userAgent,
        ScreenResolution: {
            Width: this.fingerprint.screenResolution.width,    // ✅ Büyük W
            Height: this.fingerprint.screenResolution.height   // ✅ Büyük H
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
        
        // Unique device ID oluştur
        const deviceString = `${this.fingerprint.userAgent}:${this.fingerprint.screenResolution.width}x${this.fingerprint.screenResolution.height}:${this.fingerprint.canvasFingerprint}`;
        console.log('🆔 Device string length:', deviceString.length);
        
        return true;
    }
}

// Global olarak kullanılabilir hale getir
window.DeviceFingerprintManager = DeviceFingerprintManager;

// Test için global fonksiyon
window.testDeviceFingerprint = function() {
    const manager = new DeviceFingerprintManager();
    manager.testFingerprint();
    return manager.getFingerprint();
};

console.log('✅ Device Fingerprinting System loaded successfully!');
console.log('🧪 Test için console\'da: testDeviceFingerprint()');


console.log('🔐 Loading Enhanced Secure API Client...');

class EnhancedSecureAPIClient {
    constructor() {
        this.deviceFingerprint = null;
        this.sessionId = this.generateSessionId();
        this.apiBase = '/api/game';
        this.currentToken = null;
        this.deviceChallenge = null;
        this.requestCount = 0;
          this.isValidatingAction = false;
        
        console.log('🔐 Enhanced Secure API Client initialized');
        console.log('🆔 Session ID:', this.sessionId);
        
        // Device fingerprint'i al
        this.initializeDeviceFingerprint();
    }

    setSessionId(newSessionId) {
    console.log(`🔄 API Client session changed: ${this.sessionId} → ${newSessionId}`);
    this.sessionId = newSessionId;
    
    // Token'ları da resetle (eski session'a ait)
    this.currentToken = null;
    this.deviceChallenge = null;
    this.requestCount = 0;
}

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    
    async sha256(message) {
    try {
        // Metni Uint8Array'e çevir
        const msgUint8 = new TextEncoder().encode(message);
        
        // Browser'ın built-in SHA-256 fonksiyonunu kullan
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        
        // Hash'i hex string'e çevir
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        console.log('🔍 SHA256 Debug:');
        console.log('   Input (first 100 chars):', message.substring(0, 100));
        console.log('   Output hash:', hashHex);
        
        return hashHex;
    } catch (error) {
        console.error('❌ SHA256 error:', error);
        // Fallback: basit hash alternatifi
        return 'fallback_hash_' + Math.random().toString(36).substring(7);
    }
}

    // Device fingerprint'i başlat
    initializeDeviceFingerprint() {
        try {
            if (window.DeviceFingerprintManager) {
                this.deviceFingerprint = new DeviceFingerprintManager();
                console.log('✅ Device fingerprint integrated with API client');
            } else {
                console.warn('⚠️ DeviceFingerprintManager not found - creating new instance');
                // Fallback: kendi fingerprint'imizi oluştur
                this.createFallbackFingerprint();
            }
        } catch (error) {
            console.error('❌ Device fingerprint initialization failed:', error);
            this.createFallbackFingerprint();
        }
    }

    // Fallback fingerprint (DeviceFingerprintManager yoksa)
    createFallbackFingerprint() {
        this.deviceFingerprint = {
            getBackendCompatibleFingerprint: () => ({
                UserAgent: navigator.userAgent,
                ScreenResolution: { width: screen.width, height: screen.height },
                TimezoneOffset: new Date().getTimezoneOffset(),
                CanvasFingerprint: 'fallback_canvas_' + Date.now(),
                WebGLFingerprint: 'fallback_webgl_' + Date.now()
            })
        };
        console.log('⚠️ Using fallback device fingerprint');
    }


    // Device-bound permission isteme (Backend'inizdeki endpoint ile uyumlu)
    async requestDeviceBoundPermission(gameData, scene) {
        console.log('🔐 Requesting device-bound permission...');
        this.requestCount++;
        
        const requestData = {
            sessionId: this.sessionId,
            gameData: gameData,
            deviceFingerprint: this.deviceFingerprint.getBackendCompatibleFingerprint(),
            timestamp: Date.now()
        };

        console.log("📦 Final JSON to backend:");
        console.log(JSON.stringify(requestData, null, 2));
        console.log('📤 Sending permission request with device fingerprint');
        console.log('🎮 Game data:', gameData);

        try {
            const response = await fetch(`${this.apiBase}/request-device-bound-permission`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin,
                    'Referer': window.location.href,
                    'X-Request-Count': this.requestCount.toString()
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.currentToken = data.permissionToken;
                this.deviceChallenge = data.deviceChallenge;
                  this.gameStartTime = Date.now();

                scene.time.addEvent({
    delay: 5000,
    callback: () => {
        if (this.unifiedProtection && this.unifiedProtection.captureAndValidateSnapshot) {
            this.unifiedProtection.captureAndValidateSnapshot();
        }
    },
    callbackScope: this
});
                
                console.log('✅ Device-bound permission granted');
                console.log('🕒 Token expires in:', data.expiresIn, 'seconds');
                console.log('🛡️ Device trust score:', data.deviceTrustScore + '%');
                console.log('🔑 Server timestamp:', data.serverTimestamp);
                
                return data;
            } else {
                console.error('❌ Permission denied:', data.reason || 'Unknown error');
                throw new Error(data.reason || 'Permission request failed');
            }
        } catch (error) {
            console.error('🚨 Permission request failed:', error);
            
            // Network error vs server error
            if (error.message.includes('fetch')) {
                console.log('🌐 Network error - backend might be offline');
            }
            
            throw error;
        }
    }

   // 🔧 solveDeviceChallenge metodunu tamamen değiştir:

async solveDeviceChallenge(deviceChallenge, sessionId, deviceFingerprint) {
    try {
        // ✅ Backend'deki CreateDeviceId metoduyla AYNI logic
        const deviceString = `${deviceFingerprint.UserAgent}:${deviceFingerprint.ScreenResolution.Width}x${deviceFingerprint.ScreenResolution.Height}:${deviceFingerprint.TimezoneOffset}:${deviceFingerprint.CanvasFingerprint}:${deviceFingerprint.WebGLFingerprint}`;
        
        const deviceIdHash = await this.sha256(deviceString);
        const deviceId = deviceIdHash.substring(0, 32).toUpperCase(); // ✅ Backend uppercase kullanıyor
        
        console.log('🔍 Device challenge debug:');
        console.log('   Device string:', deviceString);
        console.log('   Device ID:', deviceId);
        console.log('   Session ID:', this.sessionId);
        console.log('   Canvas FP:', deviceFingerprint.CanvasFingerprint?.substring(0, 50) + '...');
        console.log('   Timezone:', deviceFingerprint.TimezoneOffset);
        
        // ✅ Backend'deki SolveDeviceChallenge metoduyla AYNI format
        // Backend: $"{deviceId}:{sessionId}:{fingerprint.CanvasFingerprint}:{fingerprint.TimezoneOffset}:{GAMEPLAY_SECRET}";
        const solution = `${deviceId}:${this.sessionId}:${deviceFingerprint.CanvasFingerprint}:${deviceFingerprint.TimezoneOffset}:gameplay-validation-secret-2024-CHANGE-IN-PRODUCTION-def456`;
        
        console.log('🔍 Challenge solution input (first 100 chars):', solution.substring(0, 100) + '...');
        
        const hash = await this.sha256(solution);
        const challengeResponse = hash.substring(0, 8).toLowerCase(); // ✅ Backend lowercase return ediyor
        
        console.log('✅ Challenge response:', challengeResponse);
        return challengeResponse;
        
    } catch (error) {
        console.error('❌ Challenge solving error:', error);
        return '';
    }
}

    // 🔧 validateDeviceBoundAction metodundaki Device ID oluşturma kısmını düzelt:

async validateDeviceBoundAction(gameState) {
    // 🔧 GUARD EKLEYİN (en başa):
    if (this.isValidatingAction) {
        console.log("⚠️ Action validation already in progress, skipping...");
        return { success: false, reason: 'Validation in progress' };
    }
    
    this.isValidatingAction = true; // 🔧 Flag set et
    
    try {
        // ✅ MEVCUT DeviceFingerprintManager'ı kullan
        let deviceFingerprint;
        
        if (this.deviceFingerprint && this.deviceFingerprint.getBackendCompatibleFingerprint) {
            // DeviceFingerprintManager varsa onu kullan
            deviceFingerprint = this.deviceFingerprint.getBackendCompatibleFingerprint();
            console.log('🔐 Using DeviceFingerprintManager fingerprint');
        } else {
            // Fallback fingerprint
            deviceFingerprint = await this.getDeviceFingerprint();
            console.log('⚠️ Using fallback fingerprint');
        }
        
        // 🔧 GÜVENLİK KONTROLÜ:
        if (!deviceFingerprint || !deviceFingerprint.ScreenResolution && !deviceFingerprint.screenResolution) {
            console.error('❌ Invalid device fingerprint:', deviceFingerprint);
            return { success: false, reason: 'Invalid device fingerprint' };
        }
        
        // ✅ Backend format'ına normalize et
        const normalizedFingerprint = {
            UserAgent: deviceFingerprint.UserAgent || deviceFingerprint.userAgent,
            ScreenResolution: deviceFingerprint.ScreenResolution || deviceFingerprint.screenResolution,
            TimezoneOffset: deviceFingerprint.TimezoneOffset || deviceFingerprint.timezoneOffset,
            CanvasFingerprint: deviceFingerprint.CanvasFingerprint || deviceFingerprint.canvasFingerprint,
            WebGLFingerprint: deviceFingerprint.WebGLFingerprint || deviceFingerprint.webglFingerprint
        };
        
        console.log('🔍 Normalized fingerprint for backend:', normalizedFingerprint);
        
        // ✅ Device challenge çöz
        const challengeResponse = await this.solveDeviceChallenge(
            this.deviceChallenge,
            this.sessionId, 
            normalizedFingerprint
        );
        
        // 🔧 API CALL:
        const requestData = {
            sessionId: this.sessionId,
            permissionToken: this.currentToken,
            deviceChallengeResponse: challengeResponse,
            gameData: gameState,
            deviceFingerprint: normalizedFingerprint, // Backend'in beklediği format
            timestamp: Date.now()
        };

        console.log('📤 Sending validation request...');
        console.log('🔍 Request data:', requestData);
        
        const response = await fetch(`${this.apiBase}/validate-device-bound-action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': window.location.origin,
                'Referer': window.location.href
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Validation response:', data);
        
        return data;
        
    } catch (error) {
        console.error('❌ Validation error:', error);
        return { success: false, reason: 'Validation failed', error: error.message };
    } finally {
        this.isValidatingAction = false; // 🔧 Flag temizle
    }
}


    // Yüksek cheat probability handling
    handleHighCheatProbability(data) {
        console.log('🔨 HIGH CHEAT PROBABILITY DETECTED!');
        console.log('🚨 Reason:', data.reason);
        console.log('📊 Probability:', data.cheatProbability + '%');
        
        // Oyunu durdur
        if (window.gameScene && !window.gameScene.CONFIG.gameOver) {
            window.gameScene.CONFIG.gameOver = true;
            
            if (window.gameScene.physics) {
                window.gameScene.physics.pause();
            }
            
            // Cheat detection mesajı göster
            const cheatText = window.gameScene.add.text(
                window.gameScene.scale.width / 2,
                window.gameScene.scale.height / 2,
                `🚨 CHEAT DETECTED 🚨\n\nDevice-bound validation failed\n\n${data.reason}\n\nProbability: ${data.cheatProbability}%\n\nGame terminated.`,
                {
                    fontSize: '20px',
                    fill: '#ff0000',
                    align: 'center',
                    fontFamily: 'monospace',
                    stroke: '#ffffff',
                    strokeThickness: 2,
                    padding: { x: 20, y: 10 }
                }
            );
            cheatText.setOrigin(0.5);
            cheatText.setDepth(10000);
            
            // 3 saniye sonra ana ekrana dön
            setTimeout(() => {
                window.gameScene.scene.start('GameStartScene');
            }, 3000);
        }
    }

    // 🔧 getDeviceFingerprint metodunu düzelt:

async getDeviceFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint test', 2, 2);
        const canvasFingerprint = canvas.toDataURL();

        let webglFingerprint = 'unknown';
        try {
            const webglCanvas = document.createElement('canvas');
            const gl = webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    webglFingerprint = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
                }
            }
        } catch (webglError) {
            console.warn('⚠️ WebGL fingerprint failed:', webglError);
            webglFingerprint = 'webgl_error';
        }

        const fingerprint = {
            userAgent: navigator.userAgent,
            screenResolution: {
                width: screen.width,
                height: screen.height
            },
            timezoneOffset: new Date().getTimezoneOffset(),
            canvasFingerprint: canvasFingerprint,
            webglFingerprint: webglFingerprint // ✅ Tutarlı isim kullan
        };
        
        console.log('🔍 Generated device fingerprint:', fingerprint);
        return fingerprint;
        
    } catch (error) {
        console.error('❌ Device fingerprint error:', error);
        return {
            userAgent: navigator.userAgent,
            screenResolution: { width: 1920, height: 1080 },
            timezoneOffset: 0,
            canvasFingerprint: 'fallback_canvas',
            webglFingerprint: 'fallback_webgl' // ✅ Tutarlı isim kullan
        };
    }
}

    // Secure score submission
    async submitSecureScore(scoreData) {
        console.log('🔒 Submitting secure score...');
        this.requestCount++;
        
        const secureData = {
            sessionId: this.sessionId,
            score: scoreData.score,
            coins: scoreData.coins,
            playTime: scoreData.playTime,
            gameEndReason: scoreData.gameEndReason || 'completed',
            submissionTime: Date.now()
        };

        console.log('📤 Secure score submission');
        console.log('🎯 Score:', secureData.score);
        console.log('🪙 Coins:', secureData.coins);

        try {
            const response = await fetch(`${this.apiBase}/score/secure-submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin,
                    'Referer': window.location.href,
                    'X-Session-ID': this.sessionId,
                    'X-Request-Count': this.requestCount.toString()
                },
                body: JSON.stringify(secureData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('✅ Secure score submitted successfully');
                console.log('🏆 Final score:', data.finalScore);
                console.log('🥇 Ranking:', data.ranking);
                console.log('⭐ Personal best:', data.isPersonalBest ? 'Yes' : 'No');
                return data;
            } else {
                console.error('❌ Score submission failed:', data.reason);
                throw new Error(data.reason || 'Score submission failed');
            }
        } catch (error) {
            console.error('🚨 Score submission error:', error);
            throw error;
        }
    }

    // Tamper reporting (Gelişmiş)
    async reportTamperAttempt(type, details) {
        console.log('🚨 Reporting tamper attempt:', type);
        this.requestCount++;
        
        try {
            const response = await fetch(`${this.apiBase}/tamper-report`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Session-ID': this.sessionId,
                    'X-Request-Count': this.requestCount.toString()
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    type: type,
                    details: typeof details === 'string' ? details : JSON.stringify(details),
                    timestamp: Date.now(),
                    deviceFingerprint: this.deviceFingerprint.getBackendCompatibleFingerprint()
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log('📡 Tamper attempt reported successfully');
                
                if (!data.success && data.action === 'terminate_session') {
                    console.log('🔨 Session terminated by server due to tampering');
                    this.handleSessionTermination(data.reason);
                }
                
                return data;
            } else {
                console.warn('⚠️ Tamper report failed:', data);
            }
        } catch (error) {
            console.error('❌ Failed to report tamper:', error);
        }
    }

    // Session termination handler
    handleSessionTermination(reason) {
        console.log('🔒 Session terminated by server:', reason);
        
        if (window.gameScene && !window.gameScene.CONFIG.gameOver) {
            window.gameScene.CONFIG.gameOver = true;
            
            if (window.gameScene.physics) {
                window.gameScene.physics.pause();
            }
            
            // Termination mesajı göster
            const terminationText = window.gameScene.add.text(
                window.gameScene.scale.width / 2,
                window.gameScene.scale.height / 2,
                `🚨 SESSION TERMINATED 🚨\n\n${reason}\n\nPlease refresh and try again.`,
                {
                    fontSize: '22px',
                    fill: '#ff0000',
                    align: 'center',
                    fontFamily: 'monospace',
                    stroke: '#ffffff',
                    strokeThickness: 2
                }
            );
            terminationText.setOrigin(0.5);
            terminationText.setDepth(10000);
        }
    }

    // Test metodu
    testSecuritySystem() {
        console.log('🧪 Testing Enhanced Secure API Client...');
        console.log('🆔 Session ID:', this.sessionId);
        console.log('📱 Device fingerprint available:', !!this.deviceFingerprint);
        console.log('🔑 Current token:', this.currentToken ? 'Available' : 'None');
        console.log('📊 Request count:', this.requestCount);
        
        if (this.deviceFingerprint) {
            console.log('🔐 Device fingerprint test:', this.deviceFingerprint.getBackendCompatibleFingerprint());
        }
        
        return true;
    }

    // Status getter
    getStatus() {
        return {
            sessionId: this.sessionId,
            hasDeviceFingerprint: !!this.deviceFingerprint,
            hasToken: !!this.currentToken,
            requestCount: this.requestCount,
            apiBase: this.apiBase
        };
    }
}

// Global olarak kullanılabilir hale getir
window.EnhancedSecureAPIClient = EnhancedSecureAPIClient;

// Test fonksiyonu
window.testSecureAPIClient = function() {
    const client = new EnhancedSecureAPIClient();
    client.testSecuritySystem();
    return client;
};

console.log('✅ Enhanced Secure API Client loaded successfully!');
console.log('🧪 Test için console\'da: testSecureAPIClient()');

// BURADAN SONRA MEVCUT KODLARINIZ DEVAM EDECEK (UnifiedSnapshotProtection vs.)


// 🛡️ UNIFIED SNAPSHOT PROTECTION SYSTEM
// Bu kodu GameAPI tanımından ÖNCE, dosyanızın en başına ekleyin

class UnifiedSnapshotProtection {
     constructor(gameScene) {
        this.scene = gameScene;
        this.interval = 8000;
        this.snapshotCounter = 0;
        this.isActive = false;
        this.sessionId = null;
         this.isValidating = false; 
        
        // Metrics tracking
        this.metrics = {
            obstaclesPassed: 0,
            jumpCount: 0,
            suspiciousEvents: 0,
            lastObstacleCount: 0,
            coinCollectCount: 0,
            lastPlayerX: 0
        };
        
        this.patternHistory = [];
        this.maxHistorySize = 10;
        
        console.log("🛡️ Unified Snapshot Protection initialized");
    }

    resetAfterGameOver() {
    console.log("🔄 Resetting snapshot protection after game over");
    
    this.snapshotCounter = 0;
    this.gameStartTime = Date.now();
    
    // Metrics sıfırla
    this.metrics = {
        obstaclesPassed: 0,
        jumpCount: 0,
        suspiciousEvents: 0,
        lastObstacleCount: 0,
        coinCollectCount: 0,
        lastPlayerX: 0
    };
    
    // Pattern history temizle
    this.patternHistory = [];
    
    console.log("✅ Snapshot protection reset complete - fresh start");
}
    
    // 🔧 Yeni metod ekleyin:
    setSecureAPIClient(apiClient) {
        this.enhancedSecureAPIClient = apiClient;
        this.sessionId = apiClient.sessionId;
        console.log(`🔗 Using shared session ID: ${this.sessionId}`);
    }

    
    generateSessionId() {
        // ✅ Tek bir format kullan
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    start() {
    if (this.isActive) return;
    this.isActive = true;
    
    // 🎯 GAME START TIME'I SET ET (eğer yoksa)
    if (!this.gameStartTime && this.scene.masterGameStartTime) {
        this.gameStartTime = this.scene.masterGameStartTime;
        console.log('🛡️ Protection using scene start time:', this.gameStartTime);
    }
    
    // İlk snapshot
    setTimeout(() => {
    this.startSnapshotLoop();
}, 1000); // 1 saniye sonra gönder
    
    this.setupEventTracking();
    this.setupSuspiciousEventMonitoring();
    
    console.log(`🛡️ Protection started - First snapshot in ${this.interval}ms`);
}
    
    startSnapshotLoop() {
        if (!this.isActive) return;
        
        this.captureAndValidateSnapshot();
        
        // Schedule next snapshot
        setTimeout(() => {
            this.startSnapshotLoop();
        }, this.interval);
    }
    
    async captureAndValidateSnapshot() {
    if (this.scene.CONFIG.gameOver || !this.isActive) return;
    
    // 🔧 Çift çağrıyı önlemek için guard ekle
    if (this.isValidating) {
        console.log("⚠️ Validation already in progress, skipping...");
        return;
    }
    
    this.isValidating = true; // 🔧 Flag set et
    
    try {
        this.snapshotCounter++;
        const currentTime = Date.now();
        
        const masterStartTime = window.masterGameStartTime || this.scene.masterGameStartTime;
        const gameTime = Math.floor((currentTime - masterStartTime) / 1000); // Saniye cinsinden
        
        console.log('🕒 Calculated gameTime:', gameTime, 'seconds');
        console.log('🕒 Master start time:', masterStartTime);
        console.log('🕒 Current time:', currentTime);
        
        // Update metrics before snapshot
        this.updateMetrics();
        
        const snapshot = this.captureGameState(gameTime * 1000, currentTime);
        
        // Add to pattern history for analysis
        this.updatePatternHistory(snapshot);

       console.log(`📸 Sending unified snapshot #${this.snapshotCounter}...`);
        console.log(`Game time: ${gameTime}s, Physics: gravity=${snapshot.physics.gravity}, jump=${snapshot.physics.jumpForce}`);
        
        // Enhanced Secure API Client kullan:
        if (!this.enhancedSecureAPIClient) {
            this.enhancedSecureAPIClient = new EnhancedSecureAPIClient();
            console.log('🔐 Enhanced Secure API Client initialized for snapshot validation');
        }

       const gameData = {
    score: snapshot.progress.currentScore,
    coinsCollected: snapshot.progress.coinsCollected,
    gameTime: gameTime,
    distance: snapshot.progress.totalDistance,
    playerPosition: {
        x: snapshot.player.x,
        y: snapshot.player.y
    },
    physics: snapshot.physics
};


        console.log('🔐 Requesting device-bound validation for snapshot...');
        
        // İlk olarak permission al
        await this.enhancedSecureAPIClient.requestDeviceBoundPermission(gameData, this.scene);

        
        // Sonra action validate et  
        const response = await this.enhancedSecureAPIClient.validateDeviceBoundAction(gameData);
            
        if (!response.success) {
            console.log("🚨 CHEAT DETECTED by unified snapshot validation!");
            console.log(`Reason: ${response.reason}`);
            console.log(`Probability: ${response.cheatProbability}%`);
            this.handleCheatDetection(response);
        } else {
            console.log(`✅ Unified snapshot #${this.snapshotCounter} validated successfully`);
            
            // Apply server corrections if any
            if (response.corrections) {
                this.applyServerCorrections(response.corrections);
            }
        }
        
    } catch (error) {
        console.error("❌ Snapshot validation error:", error);
        this.handleValidationError(error);
        
        // Report API error as potential tampering
        if (this.enhancedSecureAPIClient) {
            this.enhancedSecureAPIClient.reportTamperAttempt('api_validation_error', error.message);
        }
    } finally {
        this.isValidating = false; // 🔧 Her durumda flag temizle
    }
}
    
    captureGameState(gameTime, currentTime) {
        const player = this.scene.player;
        const physics = this.scene.physics.world;
        
        return {
            // Session & timing info
            sessionId: this.sessionId,
            snapshotId: this.snapshotCounter,
            gameTime: gameTime,
            timestamp: currentTime,
            
            // Critical physics data (cheat detection)
            physics: {
                gravity: physics.gravity.y,
                jumpForce: this.scene.jumpForce || 950,
                playerScale: player?.scaleX || 0.32,
                playerGravityEnabled: player?.body?.allowGravity !== false,
                gameSpeed: this.scene.CONFIG?.scrollSpeed || 11
            },
            
            // Player state & position
            player: {
                x: Math.round(player?.x || 0),
                y: Math.round(player?.y || 0),
                velocityX: Math.round(player?.body?.velocity?.x || 0),
                velocityY: Math.round(player?.body?.velocity?.y || 0),
                isOnGround: this.scene.isPlayerOnGround ? this.scene.isPlayerOnGround() : false,
                isVisible: player?.visible !== false,
                alpha: player?.alpha || 1.0
            },
            
            // Game progress & metrics
            progress: {
                obstaclesPassed: this.metrics.obstaclesPassed,
                coinsCollected: this.scene.coinsCollected || 0,
                currentScore: this.scene.state?.score || 0,
                totalDistance: Math.round(this.scene.state?.distance || 0),
                jumpCount: this.metrics.jumpCount,
                coinCollectCount: this.metrics.coinCollectCount
            },
            
            // Game environment state
            environment: {
                activeObstacles: this.scene.groundObstacles?.children?.size || 0,
                activeCoins: this.scene.coins?.children?.size || 0,
                cameraX: Math.round(this.scene.cameras?.main?.scrollX || 0),
                cameraZoom: this.scene.cameras?.main?.zoom || 1.0
            },
            
            // Security metrics
            security: {
                suspiciousEvents: this.metrics.suspiciousEvents,
                patternAnomalies: this.detectPatternAnomalies(),
                timingConsistency: this.checkTimingConsistency(),
                movementPattern: this.analyzeMovementPattern()
            }
        };
    }
    
    updateMetrics() {
        // Update obstacle pass count
        const currentObstacleCount = this.scene.groundObstacles?.children?.size || 0;
        if (currentObstacleCount < this.metrics.lastObstacleCount) {
            const passedCount = this.metrics.lastObstacleCount - currentObstacleCount;
            this.metrics.obstaclesPassed += passedCount;
            console.log(`🎯 ${passedCount} obstacles passed, total: ${this.metrics.obstaclesPassed}`);
        }
        this.metrics.lastObstacleCount = currentObstacleCount;
        
        // Update coin collect count
        this.metrics.coinCollectCount = this.scene.coinsCollected || 0;
        
        // Track player movement
        const currentX = this.scene.player?.x || 0;
        this.metrics.lastPlayerX = currentX;
    }
    
    // 🔧 DÜZELTME: UnifiedSnapshotProtection class'ındaki setupEventTracking() metodunu bununla değiştirin

setupEventTracking() {
    // Jump tracking - debounced version
    this.lastJumpTime = 0;
    this.jumpCooldown = 500; // 500ms cooldown between jumps
    
    if (this.scene.handlePlayerJump) {
        const originalHandleJump = this.scene.handlePlayerJump.bind(this.scene);
        this.scene.handlePlayerJump = () => {
            const currentTime = Date.now();
            const wasGrounded = this.scene.isPlayerOnGround();
            
            // Execute original jump
            originalHandleJump();
            
            // Only count if grounded AND cooldown passed
            if (wasGrounded && (currentTime - this.lastJumpTime) > this.jumpCooldown) {
                // Check if player actually jumped (has upward velocity)
                setTimeout(() => {
                    if (this.scene.player?.body?.velocity?.y < -200) {
                        this.metrics.jumpCount++;
                        this.lastJumpTime = currentTime;
                        console.log(`🦘 Valid jump #${this.metrics.jumpCount} detected`);
                    }
                }, 50); // 50ms delay to check velocity
            }
        };
    }
    
    // Coin collection tracking - mevcut collectCoin metodunu wrap edelim
    if (this.scene.collectCoin) {
        const originalCollectCoin = this.scene.collectCoin.bind(this.scene);
        this.scene.collectCoin = (player, coin) => {
            originalCollectCoin(player, coin);
            this.metrics.coinCollectCount++;
            console.log(`🪙 Coin collected, total: ${this.metrics.coinCollectCount}`);
        };
    }
}
    setupSuspiciousEventMonitoring() {
        // Monitor for suspicious physics changes
        this.physicsMonitor = setInterval(() => {
            this.checkSuspiciousPhysics();
        }, 2000); // Every 2 seconds
        
        // Monitor for impossible positions
        this.positionMonitor = setInterval(() => {
            this.checkSuspiciousPositions();
        }, 1000); // Every 1 second - more frequent for critical checks
    }
    
    checkSuspiciousPhysics() {
        if (this.scene.CONFIG.gameOver) return;
        
        const issues = [];
        
        // Gravity check
        const gravity = this.scene.physics?.world?.gravity?.y;
        if (gravity !== undefined && Math.abs(gravity - 2000) > 100) {
            issues.push(`gravity=${gravity}`);
        }
        
        // Jump force check
        const jumpForce = this.scene.jumpForce;
        if (jumpForce !== undefined && Math.abs(jumpForce - 900) > 50) {
            issues.push(`jumpForce=${jumpForce}`);
        }
        
        // Player scale check
        const scale = this.scene.player?.scaleX;
        if (scale !== undefined && (scale < 0.1 || scale > 1.5)) {
            issues.push(`scale=${scale}`);
        }
        
        // Player gravity check
        if (this.scene.player?.body?.allowGravity === false) {
            issues.push("gravity_disabled");
        }
        
        // Game speed check
        const gameSpeed = this.scene.CONFIG?.scrollSpeed;
        if (gameSpeed !== undefined && (gameSpeed < 5 || gameSpeed > 20)) {
            issues.push(`gameSpeed=${gameSpeed}`);
        }
        
        if (issues.length > 0) {
            this.metrics.suspiciousEvents++;
            console.log(`🚨 Suspicious physics detected: ${issues.join(', ')} (Event #${this.metrics.suspiciousEvents})`);
        }
    }
    
    checkSuspiciousPositions() {
        if (this.scene.CONFIG.gameOver || !this.scene.player) return;
        
        const player = this.scene.player;
        const issues = [];
        
        // Impossible height check
        if (player.y < -200) {
            issues.push(`impossible_height=${player.y}`);
        }
        
        // Below ground check (ground level around 500-600)
        if (player.y > 700) {
            issues.push(`below_ground=${player.y}`);
        }
        
        // Extreme horizontal position
        if (player.x < -100 || player.x > 2000) {
            issues.push(`extreme_x=${player.x}`);
        }
        
        // Invisibility check
        if (player.visible === false || player.alpha < 0.1) {
            issues.push(`invisible=${player.visible},alpha=${player.alpha}`);
        }
        
        if (issues.length > 0) {
            this.metrics.suspiciousEvents++;
            console.log(`🚨 Suspicious position detected: ${issues.join(', ')} (Event #${this.metrics.suspiciousEvents})`);
        }
    }
    
    updatePatternHistory(snapshot) {
        this.patternHistory.push({
            time: snapshot.gameTime,
            playerX: snapshot.player.x,
            playerY: snapshot.player.y,
            obstaclesPassed: snapshot.progress.obstaclesPassed,
            coinsCollected: snapshot.progress.coinsCollected,
            jumpCount: snapshot.progress.jumpCount
        });
        
        // Keep only recent history
        if (this.patternHistory.length > this.maxHistorySize) {
            this.patternHistory.shift();
        }
    }
    
    detectPatternAnomalies() {
        if (this.patternHistory.length < 2) return 0;
        
        let anomalies = 0;
        const current = this.patternHistory[this.patternHistory.length - 1];
        const previous = this.patternHistory[this.patternHistory.length - 2];
        
        // Check for impossible progress jumps
        const timeDiff = (current.time - previous.time) / 1000; // seconds
        const coinDiff = current.coinsCollected - previous.coinsCollected;
        const obstaclesDiff = current.obstaclesPassed - previous.obstaclesPassed;
        
        // Too many coins in short time
        if (timeDiff > 0 && coinDiff > (timeDiff / 1.5)) {
            anomalies++;
        }
        
        // Too many obstacles in short time  
        if (timeDiff > 0 && obstaclesDiff > (timeDiff / 2.0)) {
            anomalies++;
        }
        
        // Negative progress (impossible)
        if (coinDiff < 0 || obstaclesDiff < 0) {
            anomalies += 2;
        }
        
        return anomalies;
    }
    
    checkTimingConsistency() {
        if (this.patternHistory.length < 3) return 100;
        
        const intervals = [];
        for (let i = 1; i < this.patternHistory.length; i++) {
            intervals.push(this.patternHistory[i].time - this.patternHistory[i-1].time);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const expectedInterval = this.interval;
        
        const consistency = Math.max(0, 100 - Math.abs(avgInterval - expectedInterval) / expectedInterval * 100);
        return Math.round(consistency);
    }
    
    analyzeMovementPattern() {
        if (this.patternHistory.length < 2) return "normal";
        
        const current = this.patternHistory[this.patternHistory.length - 1];
        const previous = this.patternHistory[this.patternHistory.length - 2];
        
        const timeDiff = (current.time - previous.time) / 1000;
        const distanceDiff = Math.abs(current.playerX - previous.playerX);
        const speed = timeDiff > 0 ? distanceDiff / timeDiff : 0;
        
        if (speed > 300) return "teleport_suspected";
        if (speed > 200) return "very_fast";
        if (speed > 100) return "fast";
        return "normal";
    }
    
    applyServerCorrections(corrections) {
        console.log("🔄 Applying server corrections:", corrections);
        
        if (corrections.physics) {
            if (corrections.physics.gravity !== undefined) {
                this.scene.physics.world.gravity.y = corrections.physics.gravity;
                console.log(`🔄 Gravity corrected to: ${corrections.physics.gravity}`);
            }
            
            if (corrections.physics.jumpForce !== undefined) {
                this.scene.jumpForce = corrections.physics.jumpForce;
                console.log(`🔄 Jump force corrected to: ${corrections.physics.jumpForce}`);
            }
        }
        
        if (corrections.player) {
            if (corrections.player.x !== undefined) {
                this.scene.player.x = corrections.player.x;
                console.log(`🔄 Player X corrected to: ${corrections.player.x}`);
            }
            
            if (corrections.player.y !== undefined) {
                this.scene.player.y = corrections.player.y;
                console.log(`🔄 Player Y corrected to: ${corrections.player.y}`);
            }
        }
    }
    
    handleCheatDetection(response) {
        console.log("🔨 UNIFIED CHEAT DETECTION TRIGGERED");
        console.log(`Snapshot ID: #${this.snapshotCounter}`);
        console.log(`Reason: ${response.reason}`);
        console.log(`Cheat Probability: ${response.cheatProbability}%`);
        console.log(`Game Time: ${((Date.now() - this.gameStartTime) / 1000).toFixed(1)}s`);
        
        this.stop();
        
        // Terminate game
        this.scene.CONFIG.gameOver = true;
        this.scene.physics.pause();
        
        // Show cheat detection message
        const cheatText = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            `🚨 CHEAT DETECTED 🚨\n\nUnified Validation Failed\n\n${response.reason}\n\nProbability: ${response.cheatProbability}%`,
            {
                fontSize: '24px',
                fill: '#ff0000',
                align: 'center',
                fontFamily: 'monospace',
                stroke: '#ffffff',
                strokeThickness: 2,
                padding: { x: 20, y: 10 }
            }
        );
        cheatText.setOrigin(0.5);
        cheatText.setDepth(10000);
        
        // Auto redirect after 4 seconds
        setTimeout(() => {
            this.scene.scene.start('GameOverScene', {
                score: 0,
                distance: 0,
                isMuted: this.scene.isMuted,
                reason: 'cheat_detected',
                cheatDetails: response.reason
            });
        }, 4000);
    }
    
    handleValidationError(error) {
    console.log('❌ Validation error - possible network/server issue');
    console.log('🚨 API validation failed, but player should stay normal');
    
    // ✅ Güvenli tamper reporting:
    if (this.tamperProtection && typeof this.tamperProtection.reportTamperAttempt === 'function') {
        this.tamperProtection.reportTamperAttempt('api_validation_error');
    } else {
        console.log('⚠️ Tamper protection not available, skipping report');
    }
}
    
    stop() {
        this.isActive = false;
        
        if (this.physicsMonitor) {
            clearInterval(this.physicsMonitor);
            this.physicsMonitor = null;
        }
        
        if (this.positionMonitor) {
            clearInterval(this.positionMonitor);
            this.positionMonitor = null;
        }
        
        console.log("🛡️ Unified Snapshot Protection stopped");
    }
    
    // Debug methods
    getStatus() {
        return {
            isActive: this.isActive,
            snapshotCount: this.snapshotCounter,
            sessionId: this.sessionId,
            gameTime: (Date.now() - this.gameStartTime) / 1000,
            metrics: this.metrics,
            patternHistorySize: this.patternHistory.length,
            lastMovementPattern: this.analyzeMovementPattern()
        };
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            gameTime: (Date.now() - this.gameStartTime) / 1000,
            snapshotsSent: this.snapshotCounter,
            avgInterval: this.interval / 1000
        };
    }

    // UnifiedSnapshotProtection sınıfında:
expectPlayerCreation() {
    this.playerSetupInProgress = true;
    console.log("🛡️ Player creation expected - ignoring next changes");
}

playerSetupComplete() {
    this.playerSetupInProgress = false;
    console.log("🛡️ Player setup complete - protection resumed");
}

}

// 🛡️ VARIABLE PROTECTION SYSTEM
class VariableProtectionSystem {
    constructor(gameScene) {
        this.scene = gameScene;
        this.protectedValues = new Map();
        this.isActive = true;
        this.lastKnownPosition = { x: 0, y: 0, timestamp: Date.now() };
        this.positionHistory = [];
        this.tamperCount = 0;
        
        console.log("🛡️ Variable Protection System initializing...");
        this.setupProtection();
        this.startContinuousMonitoring();
    }
    
    setupProtection() {
        // Jump Force Protection
        this.protectVariable('jumpForce', 350, (value) => {
            return typeof value === 'number' && value >= 300 && value <= 400;
        });
        
        // CONFIG object protection için
        if (this.scene.CONFIG) {
            this.protectConfigVariable('scrollSpeed', 11, (value) => {
                return typeof value === 'number' && value >= 5 && value <= 20;
            });
        }
        
        this.startPositionMonitoring();
        this.startPhysicsMonitoring();
        
        console.log("🔒 Critical variables protected");
    }
    
    protectVariable(varName, expectedValue, validator) {
        const protection = {
            expectedValue: expectedValue,
            validator: validator,
            lastValidValue: expectedValue,
            tamperCount: 0
        };
        
        this.protectedValues.set(varName, protection);
        
        let internalValue = this.scene[varName] || expectedValue;
        
        try {
            Object.defineProperty(this.scene, varName, {
                get: () => {
                    return internalValue;
                },
                set: (newValue) => {
                    const protection = this.protectedValues.get(varName);
                    
                    if (protection.validator(newValue)) {
                        internalValue = newValue;
                        protection.lastValidValue = newValue;
                        console.log(`✅ ${varName} legitimately updated to ${newValue}`);
                    } else {
                        protection.tamperCount++;
                        this.tamperCount++;
                        console.log(`🚨 TAMPER BLOCKED: ${varName} = ${newValue} (attempt #${protection.tamperCount})`);
                        
                        this.reportTamperAttempt(varName, newValue, internalValue);
                        return false;
                    }
                },
                enumerable: true,
                configurable: false
            });
        } catch (error) {
            console.warn(`⚠️ Could not protect ${varName}:`, error.message);
        }
    }
    
    protectConfigVariable(varName, expectedValue, validator) {
        if (!this.scene.CONFIG) return;
        
        let internalValue = this.scene.CONFIG[varName] || expectedValue;
        
        try {
            Object.defineProperty(this.scene.CONFIG, varName, {
                get: () => {
                    return internalValue;
                },
                set: (newValue) => {
                    if (validator(newValue)) {
                        internalValue = newValue;
                        console.log(`✅ CONFIG.${varName} legitimately updated to ${newValue}`);
                    } else {
                        this.tamperCount++;
                        console.log(`🚨 CONFIG TAMPER BLOCKED: ${varName} = ${newValue}`);
                        this.reportTamperAttempt(`CONFIG.${varName}`, newValue, internalValue);
                        return false;
                    }
                },
                enumerable: true,
                configurable: false
            });
        } catch (error) {
            console.warn(`⚠️ Could not protect CONFIG.${varName}:`, error.message);
        }
    }
    
    startPositionMonitoring() {
        setInterval(() => {
            if (!this.scene.player || this.scene.CONFIG.gameOver || !this.isActive) return;
            
            const currentPos = {
                x: this.scene.player.x,
                y: this.scene.player.y,
                timestamp: Date.now()
            };
            
            if (this.lastKnownPosition.x > 0) {
                const distance = Math.abs(currentPos.x - this.lastKnownPosition.x);
                const timeDiff = (currentPos.timestamp - this.lastKnownPosition.timestamp) / 1000;
                const speed = timeDiff > 0 ? distance / timeDiff : 0;
                
                if (speed > 400) {
                    console.log(`🚨 TELEPORTATION DETECTED: Speed ${speed.toFixed(1)}px/s`);
                    this.handleTeleportation(currentPos, this.lastKnownPosition);
                    return;
                }
            }
            
            this.lastKnownPosition = { ...currentPos };
            
        }, 100);
    }
    
    startPhysicsMonitoring() {
        setInterval(() => {
            if (!this.scene.physics || this.scene.CONFIG.gameOver || !this.isActive) return;
            
            const currentGravity = this.scene.physics.world.gravity.y;
            const expectedGravity = 2000;
            
            if (Math.abs(currentGravity - expectedGravity) > 100) {
                console.log(`🚨 GRAVITY TAMPER: ${currentGravity} (expected: ${expectedGravity})`);
                this.scene.physics.world.gravity.y = expectedGravity;
                this.reportTamperAttempt('gravity', currentGravity, expectedGravity);
            }
            
        }, 500);
    }
    
    startContinuousMonitoring() {
        setInterval(() => {
            if (!this.isActive) return;
            this.performIntegrityCheck();
        }, 2000);
    }
    
    performIntegrityCheck() {
        let currentTamperCount = 0;
        
        this.protectedValues.forEach((protection, varName) => {
            const currentValue = this.scene[varName];
            
            if (!protection.validator(currentValue)) {
                currentTamperCount++;
                console.log(`🚨 INTEGRITY FAIL: ${varName} = ${currentValue}`);
                
                try {
                    this.scene[varName] = protection.lastValidValue;
                    console.log(`🔄 ${varName} reset to ${protection.lastValidValue}`);
                } catch (e) {
                    console.warn(`⚠️ Cannot reset ${varName}`);
                }
            }
        });
        
        if (currentTamperCount > 0) {
            this.reportMultipleTampers(currentTamperCount);
        }
    }
    
    handleTeleportation(currentPos, lastPos) {
        console.log(`🎯 Teleport: (${lastPos.x}, ${lastPos.y}) → (${currentPos.x}, ${currentPos.y})`);
        
        // Force player back
        this.scene.player.setPosition(lastPos.x, lastPos.y);
        
        this.reportTeleportation(currentPos, lastPos);
    }
    
    async reportTamperAttempt(varName, attemptedValue, currentValue) {
        try {
            await fetch('/api/game/tamper-detection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'variable_tamper',
                    variable: varName,
                    attemptedValue: attemptedValue,
                    currentValue: currentValue,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('❌ Failed to report tamper:', error);
        }
    }
    
    async reportTeleportation(currentPos, lastPos) {
        try {
            await fetch('/api/game/teleport-detection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'teleportation',
                    fromPosition: lastPos,
                    toPosition: currentPos,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('❌ Failed to report teleportation:', error);
        }
    }
    
    async reportMultipleTampers(count) {
        try {
            await fetch('/api/game/multiple-tamper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'multiple_tamper',
                    tamperCount: count,
                    totalTampers: this.tamperCount,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('❌ Failed to report multiple tampers:', error);
        }
    }
    
    stop() {
        this.isActive = false;
        console.log("🛡️ Variable Protection stopped");
    }
    
    getStatus() {
        return {
            isActive: this.isActive,
            totalTamperAttempts: this.tamperCount,
            protectedVariables: Array.from(this.protectedValues.keys())
        };
    }
}

// Global debug access
window.getVariableProtectionStatus = function() {
    if (window.gameScene && window.gameScene.variableProtection) {
        console.log("🛡️ Variable Protection Status:", window.gameScene.variableProtection.getStatus());
    } else {
        console.log("❌ Variable protection not found");
    }
};

// Global debug access
window.getProtectionStatus = function() {
    if (window.gameScene && window.gameScene.unifiedProtection) {
        console.log("🛡️ Protection Status:", window.gameScene.unifiedProtection.getStatus());
    } else {
        console.log("❌ Unified protection system not found");
    }
};

window.getProtectionMetrics = function() {
    if (window.gameScene && window.gameScene.unifiedProtection) {
        console.log("📊 Protection Metrics:", window.gameScene.unifiedProtection.getMetrics());
    } else {
        console.log("❌ Unified protection system not found");
    }
};

// URL Configuration System
const GameAPI = {
    // 🔧 Şimdilik localhost ileride değişecek
    BASE_URL: 'http://localhost:5080/api',
    
    // Tüm endpoint'ler
    ENDPOINTS: {
        OBSTACLES_BATCH: '/game/obstacles-batch',
        COINS_BATCH: '/game/coins-batch', 
        OBSTACLE_RESET: '/game/obstacle/reset',
        COIN_RESET: '/game/coin/reset',
        CONFIG: '/game/config',
        PHYSICS: '/game/physics',
        JUMP: '/game/jump',
        COIN_INTERVAL: '/game/coin/interval',
        COIN_DIFFICULTY: '/game/coin/difficulty',
        DIFFICULTY: '/game/obstacle/difficulty',
        SESSION_RESET: '/game/session/reset',
        COIN_COLLECT_BATCH: '/game/coin/collect-batch'
    },
    
    // Güvenli API çağrı fonksiyonu
    async call(endpoint, options = {}) {
        const url = this.BASE_URL + endpoint;
        
        try {
            console.log(`API Call: ${endpoint}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response.json();
        } catch (error) {
            console.error(`❌ API Error [${endpoint}]:`, error.message);
            throw error;
        }
    },
    
    // POST istekleri için kısayol
    async post(endpoint, data = {}) {
        return this.call(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};

// 🔒 SIMPLE BATCH VALIDATION SYSTEM
const SimpleBatch = {
    coins: [],           // Bekleyen coin'ler
    maxCoins: 3,         // 3 coin birikince gönder
    maxWaitTime: 2000,   // 2 saniye sonra gönder (3 coin olmasa bile)
    timer: null,
    isProcessing: false,
    
    // 🪙 Coin ekle
    addCoin(coinData) {
        this.coins.push(coinData);
        console.log(`🪙 Added coin to batch. Waiting: ${this.coins.length}/${this.maxCoins}`);
        
        // 3 coin oldu mu hemen gönder
        if (this.coins.length >= this.maxCoins) {
            this.sendBatch();
        } else {
            // Yoksa timer başlat
            this.startTimer();
        }
    },
    
    // ⏰ Timer başlat (2 saniye sonra gönder)
    startTimer() {
        if (this.timer || this.isProcessing) return; // Zaten var veya processing
        
        this.timer = setTimeout(() => {
            this.sendBatch();
        }, this.maxWaitTime);
        
        console.log(`⏰ Batch timer started (${this.maxWaitTime}ms)`);
    },
    
    // 📦 Batch gönder
    async sendBatch() {
        if (this.isProcessing || this.coins.length === 0) return;
        
        this.isProcessing = true;
        
        // Timer'ı temizle
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        // Coin'leri al ve pending'i temizle
        const batch = this.coins.splice(0); // Tümünü al
        
        console.log(`📦 Sending batch of ${batch.length} coins to server...`);
        
        try {
            // Sunucuya gönder
            const response = await GameAPI.post('/game/coin/collect-batch', {
                coins: batch
            });
            
            if (response.success) {
                // ✅ Sunucu onayladı - skorları güncelle
                if (window.gameScene && !window.gameScene.CONFIG.gameOver) {
                    window.gameScene.state.score = response.totalScore;
                    window.gameScene.coinsCollected = response.totalCoins;
                    window.gameScene.scoreText.setText(response.totalScore);
                    
                    console.log(`✅ Batch validated! New score: ${response.totalScore} (${response.totalCoins} coins)`);
                    
                    // Victory kontrolü
                    if (response.totalScore >= 300) {
                        window.gameScene.triggerVictory();
                    }
                }
            } else {
                console.warn('❌ Batch rejected by server:', response.error);
            }
            
        } catch (error) {
            console.error('❌ Batch validation failed:', error);
        
        } finally {
            this.isProcessing = false;
        }
    },
    
    // 🧹 Temizle
    cleanup() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.coins = [];
        this.isProcessing = false;
        console.log('🧹 SimpleBatch cleaned up');
    },
    
    // 📊 Debug bilgisi
    getStatus() {
        return {
            pendingCoins: this.coins.length,
            isProcessing: this.isProcessing,
            hasTimer: !!this.timer
        };
    }
};

// 🌍 Global erişim için
window.SimpleBatch = SimpleBatch;


// ✅ Queue'lar ve değişkenler
let obstacleQueue = [];
let coinQueue = [];
const MIN_QUEUE_SIZE = 15;
const INITIAL_BATCH_SIZE = 100; // İlk yükleme
const REFILL_BATCH_SIZE = 50;   // Refill size
let isRefilling = false;
let gameStartTime = 0;

// ✅ Pre-load fonksiyonu
async function preloadGameData() {
    console.log("🔄 Full Queue System: Pre-loading game data...");
    
    try {
        // Parallel batch loading
        const [obstacleData, coinData] = await Promise.all([
            GameAPI.call(`${GameAPI.ENDPOINTS.OBSTACLES_BATCH}?count=${INITIAL_BATCH_SIZE}`),
            GameAPI.call(`${GameAPI.ENDPOINTS.COINS_BATCH}?count=80`)
        ]);
        
        obstacleQueue = obstacleData.obstacles;
        coinQueue = coinData.coins;
        
        console.log(`✅ Full Queue Loaded: ${obstacleQueue.length} obstacles, ${coinQueue.length} coins`);
        console.log(`🎯 Queue thresholds: MIN=${MIN_QUEUE_SIZE}, REFILL=${REFILL_BATCH_SIZE}`);
        
        return true;
    } catch (error) {
        console.error("❌ Full Queue pre-load failed:", error);
        // Fallback: Empty queues, spawn sistem devam etsin
        obstacleQueue = [];
        coinQueue = [];
        return false;
    }
}

    function spawnObstacleFromQueue() {
    if (obstacleQueue.length > 0) {
        const obstacle = obstacleQueue.shift();
        console.log(`📦 Queue spawn: ${obstacle.type} at x:${obstacle.x} (${obstacleQueue.length} left)`);
        
        // ✅ TİP KONTROLÜ EKLE:
        if (obstacle.type === 'pigeon') {
            // Sky obstacle olarak spawn et
            window.gameScene.spawnSkyObstacle(obstacle.x);
            console.log(`🐦 Sky obstacle spawned: ${obstacle.type} at x:${obstacle.x}`);
        } else {
            // Ground obstacle olarak spawn et
            window.gameScene.spawnGroundObstacle(obstacle.x, obstacle.type);
            console.log(`🚧 Ground obstacle spawned: ${obstacle.type} at x:${obstacle.x}`);
        }
        
        // Auto-refill check
        checkAndRefillQueues('obstacles');
        
        return true;
    }
    
    console.warn("⚠️ Obstacle queue empty!");
    return false;
}

function spawnCoinFromQueue() {
    if (coinQueue.length > 0) {
        const coinData = coinQueue.shift(); // SERVER verisi
        console.log(`🪙 Server coin spawn: (${coinData.x}, ${coinData.y}) - ${coinQueue.length} left`);
        
        // ✅ Sadece görsel oluştur - veri sunucudan geldi
        createCoinFromData(coinData.x, coinData.y);
        
        // Auto-refill check
        checkAndRefillQueues('coins');
        
        return true;
    }
    
    console.warn("⚠️ Server coin queue empty!");
    return false;
}

// ✅ Coin oluşturma fonksiyonu
function createCoinFromData(x, y) {
    if (!window.gameScene || window.gameScene.CONFIG.gameOver) return;
    
    const coin = window.gameScene.physics.add.sprite(x, y, 'coin');
    coin.setOrigin(0.5, 0.5);
    coin.setScale(0.12);
    coin.body.allowGravity = false;
    
    window.gameScene.coins.add(coin);
}

function checkAndRefillQueues(type) {
    if (isRefilling) return;
    
    const needsObstacleRefill = type === 'obstacles' && obstacleQueue.length <= MIN_QUEUE_SIZE;
    const needsCoinRefill = type === 'coins' && coinQueue.length <= MIN_QUEUE_SIZE;
    
    if (needsObstacleRefill) {
        console.log(`🔄 Obstacle queue low (${obstacleQueue.length}), refilling...`);
        refillObstacles();
    }
    
    if (needsCoinRefill) {
        console.log(`🔄 Coin queue low (${coinQueue.length}), refilling...`);
        refillCoins();
    }
}

// ✅ Queue yenileme fonksiyonları
async function refillObstacles() {
    if (isRefilling) return;
    
    isRefilling = true;
    try {
        console.log(`🔄 Refilling obstacles (current: ${obstacleQueue.length})...`);
        
        const data = await GameAPI.call(`${GameAPI.ENDPOINTS.OBSTACLES_BATCH}?count=${REFILL_BATCH_SIZE}`);
        obstacleQueue.push(...data.obstacles);
        
        console.log(`✅ Obstacles refilled! Total: ${obstacleQueue.length}`);
    } catch (error) {
        console.error("❌ Obstacle refill failed:", error);
    } finally {
        isRefilling = false;
    }
}

async function refillCoins() {
    try {
        console.log(`🔄 Refilling coins (current: ${coinQueue.length})...`);
        
        const data = await GameAPI.call(`${GameAPI.ENDPOINTS.COINS_BATCH}?count=${REFILL_BATCH_SIZE}`);
        coinQueue.push(...data.coins);
        
        console.log(`✅ Coins refilled! Total: ${coinQueue.length}`);
    } catch (error) {
        console.error("❌ Coin refill failed:", error);
    }
}

function getQueueStatus() {
    return {
        obstacles: {
            count: obstacleQueue.length,
            needsRefill: obstacleQueue.length <= MIN_QUEUE_SIZE
        },
        coins: {
            count: coinQueue.length,
            needsRefill: coinQueue.length <= MIN_QUEUE_SIZE
        },
        isRefilling: isRefilling,
        minThreshold: MIN_QUEUE_SIZE
    };
}




// Mobile Orientation Manager 
class OrientationManager {
    static init() {
        //  cihazın mobil olduğunu kontrol et
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
        
            this.createOrientationOverlay();
            
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.checkOrientation();
                }, 100);
            });
            
            this.checkOrientation();
        }
    }
    
    static createOrientationOverlay() {
       
        this.overlay = document.createElement('div');
        this.overlay.id = 'orientation-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            flex-direction: column;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
        `;
        

        this.overlay.innerHTML = `
            <div style="transform: rotate(90deg); font-size: 48px; margin-bottom: 20px;">📱</div>
            <h2 style="margin: 20px; font-size: 24px;">Cihazınızı Çevirin</h2>

        `;
        
        document.body.appendChild(this.overlay);
    }
    
    static checkOrientation() {
    if (!this.overlay) return;
    
    const isPortrait = window.innerHeight > window.innerWidth;
    
    if (isPortrait) {
        this.overlay.style.display = 'flex';
        // güvenlik kontrolleri
        if (window.game && window.game.scene && window.game.scene.isActive('GameScene')) {
            const gameScene = window.game.scene.getScene('GameScene');
            if (gameScene && gameScene.physics) {
                gameScene.physics.pause();
            }
        }
    } else {
        this.overlay.style.display = 'none';
        //güvenlik kontrolleri
        if (window.game && window.game.scene && window.game.scene.isActive('GameScene')) {
            const gameScene = window.game.scene.getScene('GameScene');
            if (gameScene && gameScene.physics && gameScene.CONFIG && !gameScene.CONFIG.gameOver) {
                gameScene.physics.resume();
            }
        }
    }
}
}

const DEBUG_COLLISIONS = false; 

class GameStartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameStartScene' });
    }

    preload() {
        this.load.image('layer1', 'assets_z/parallax/layer1.png');
        this.load.image('layer2', 'assets_z/parallax/layer2.png');
        this.load.image('layer3', 'assets_z/parallax/layer3.png');
        this.load.image('player', 'assets_z/player.png');
        this.load.image('oyna', 'assets_z/ui/oyna.png');
        this.load.audio('buttonClick', 'assets_z/sounds/buttonClick.mp3');
        this.load.audio('backgroundMusic', 'assets_z/sounds/backgroundMusic.mp3');
    }

    create() {
        this.activeTweens = [];
this.activeTimers = [];
        this.gameStarting = false;

        this.backgroundLayers = {
            layer1: this.add.tileSprite(0, -100, this.scale.width, this.scale.height + 100, 'layer1').setOrigin(0, 0),
            layer2: this.add.tileSprite(0, -110, this.scale.width, this.scale.height + 110, 'layer2').setOrigin(0, 0),
            layer3: this.add.tileSprite(0, -0, this.scale.width, this.scale.height + 0, 'layer3').setOrigin(0, 0)
        };

        this.backgroundLayers.layer1.setDepth(-6);
        this.backgroundLayers.layer2.setDepth(-5);
        this.backgroundLayers.layer3.setDepth(-4);

        const gameTitle = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2 - 120, 
            'OYUN ADI', 
            {
                fontSize: '72px',
                fontFamily: 'monospace',
                fill: '#87937f',
                stroke: '#1b1628',
                strokeThickness: 6,
                fontStyle: 'bold'
            }
        );
        gameTitle.setOrigin(0.5);
        gameTitle.setDepth(100);
        gameTitle.setAlpha(0);

        const playerPreview = this.add.sprite(-100, this.scale.height - 120, 'player');
        playerPreview.setScale(0.5);
        playerPreview.setDepth(100);

        const startButton = this.add.image(this.scale.width / 2, this.scale.height / 2 + 80, 'oyna');
        startButton.setScale(0.15); 
        startButton.setInteractive();
        startButton.setDepth(100);
        startButton.setAlpha(0);

        const tween1 = this.tweens.add({
        targets: playerPreview,
        x: this.scale.width + 100,
        duration: 4000,
        ease: 'Power2.easeInOut',
        delay: 500
    });
    this.activeTweens.push(tween1);

            const tween2 = this.tweens.add({
        targets: playerPreview,
        y: playerPreview.y - 10,
        duration: 300,
        ease: 'Power2',
        yoyo: true,
        repeat: 12,
        delay: 500
    });
    this.activeTweens.push(tween2);

         const tween3 = this.tweens.add({
        targets: gameTitle,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 800,
        ease: 'Power2.easeOut',
        delay: 1000
    });
    this.activeTweens.push(tween3);

        const tween4 = this.tweens.add({
        targets: startButton,
        alpha: 1,
        scaleX: 0.15,
        scaleY: 0.15,
        duration: 500,
        ease: 'Back.easeOut',
        delay: 1800
    });
    this.activeTweens.push(tween4);

       const timer1 = this.time.delayedCall(2500, () => {
        const tween5 = this.tweens.add({
            targets: gameTitle,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });
        this.activeTweens.push(tween5);
    });
    this.activeTimers.push(timer1);

        startButton.on('pointerdown', () => {
            this.startGame();
        });

        startButton.on('pointerover', () => {
            startButton.setScale(0.18);
            startButton.setTint(0xdddddd); 
        });
        
        startButton.on('pointerout', () => {
            startButton.setScale(0.15);
            startButton.clearTint(); 
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            
            const spaceTimer = this.time.delayedCall(100, () => {
        if (gameTitle.alpha > 0.8) {
            this.startGame();
        }
    });
    this.activeTimers.push(spaceTimer);
        });

        this.input.keyboard.on('keydown-UP', () => {
            const upTimer = this.time.delayedCall(100, () => {
        if (gameTitle.alpha > 0.8) {
            this.startGame();
        }
    });
    this.activeTimers.push(upTimer);

        });

        this.backgroundScrollSpeed = 0.5;
        this.buttonSound = this.sound.add('buttonClick');
    }

    update() {
        this.backgroundLayers.layer1.tilePositionX += this.backgroundScrollSpeed * 0.05;
        this.backgroundLayers.layer2.tilePositionX += this.backgroundScrollSpeed * 0.2;
        this.backgroundLayers.layer3.tilePositionX += this.backgroundScrollSpeed * 0.6;
    }

    startGame() {
        this.gameStartTime = Date.now();
        if (this.gameStarting) return; 
        this.gameStarting = true;

        if (window.SimpleBatch) {
        SimpleBatch.cleanup();
    }
        this.buttonSound.play();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    shutdown() {
    this.activeTweens.forEach(tween => {
        if (tween && !tween.hasDispatched) {
            tween.destroy();
        }
    });
    this.activeTweens = [];

    this.activeTimers.forEach(timer => {
        if (timer) {
            timer.destroy();
        }
    });
    this.activeTimers = [];

    this.input.keyboard.removeAllListeners();
}

}

// 🍯 INVISIBLE HONEYPOT CLASS - Dosyanın EN BAŞINA koy
class InvisibleHoneypot {
    constructor(scene) {
        this.scene = scene;
        this.invisibleObstacles = new Set();
        this.expectedCollisions = new Set();
        this.actualCollisions = new Set();
        this.suspiciousActivity = [];
        this.collisionlessCount = 0;
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log("🍯 Invisible Honeypot system initialized with session:", this.sessionId);
    }
    
    // Görünmez engel oluştur (strategic placement için)
    createInvisibleObstacle(x, y, type = 'invisible') {
    const obstacleId = `honeypot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    console.log(`🍯 Creating invisible obstacle: ${obstacleId} at (${x}, ${y})`);
    
    // Düzeltilmiş invisible obstacle oluşturma
    const invisible = this.scene.add.rectangle(x, y, 40, 60, 0x000000, 0);
    this.scene.physics.add.existing(invisible);
    invisible.body.setImmovable(true);
    invisible.body.allowGravity = false;
    invisible.setVisible(false);
    
    invisible.honeypotId = obstacleId;
    invisible.honeypotType = type;
    invisible.expectedHit = true;
    invisible.hasPassed = false;
    
    // Collision handler
    this.scene.physics.add.overlap(this.scene.player, invisible, (player, obstacle) => {
        console.log(`💥 Honeypot collision: ${obstacle.honeypotId}`);
        this.onHoneypotCollision(obstacle.honeypotId, obstacle.honeypotType);
    });
    
    this.invisibleObstacles.add(invisible);
    this.expectedCollisions.add(obstacleId);
    
    console.log(`🍯 Invisible obstacle created successfully: ${obstacleId} at (${x}, ${y})`);
    console.log(`🍯 Total invisible obstacles: ${this.invisibleObstacles.size}`);
    
    return invisible;
}
    
    // Ana strateji: Görünür engeller arasına honeypot yerleştir
    placeStrategicHoneypots() {
    console.log("🔍 placeStrategicHoneypots() called");
    
    if (!this.scene.groundObstacles) {
        console.log("❌ groundObstacles not found");
        return;
    }
    
    const groundObstacles = this.scene.groundObstacles.children.entries || [];
    console.log(`🔍 Found ${groundObstacles.length} ground obstacles`);
    
    if (groundObstacles.length < 2) {
        console.log("⚠️ Not enough obstacles for honeypot placement");
        return;
    }
    
    const sorted = groundObstacles.sort((a, b) => a.x - b.x);
    console.log(`🔍 Sorted obstacles from x:${sorted[0]?.x} to x:${sorted[sorted.length-1]?.x}`);
    
    let honeypotCount = 0;
    
    for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        
        const gap = next.x - current.x;
        console.log(`🔍 Gap between obstacles: ${gap}px (${current.x} -> ${next.x})`);
        
        // Jump edilebilir gap varsa (80-200px arası)
        if (gap > 50) {
            const honeypotX = current.x + (gap * 0.6); // Gap'in %60'ında
            const honeypotY = current.y; // Aynı Y pozisyonu
            
            // Bu pozisyonda zaten honeypot var mı kontrol et
            let alreadyExists = false;
            this.invisibleObstacles.forEach(existing => {
                if (Math.abs(existing.x - honeypotX) < 50) {
                    alreadyExists = true;
                }
            });
            
            if (!alreadyExists) {
                this.createInvisibleObstacle(honeypotX, honeypotY, 'strategic');
                honeypotCount++;
                console.log(`🎯 Strategic honeypot #${honeypotCount} placed at gap of ${gap}px`);
            } else {
                console.log(`⚠️ Honeypot already exists near x:${honeypotX}`);
            }
        } else {
            console.log(`⚠️ Gap ${gap}px not suitable for honeypot (need 80-200px)`);
        }
    }
    
    console.log(`✅ Placed ${honeypotCount} new honeypots. Total: ${this.invisibleObstacles.size}`);
}

// onHoneypotCollision metodunu ekle
onHoneypotCollision(obstacleId, type) {
    console.log(`💥 Honeypot collision detected: ${obstacleId} (${type})`);
    
    this.actualCollisions.add(obstacleId);
    this.collisionlessCount = 0;
    
    this.reportCollisionToServer(obstacleId, 'honeypot_hit');
    
    this.invisibleObstacles.forEach(obstacle => {
        if (obstacle.honeypotId === obstacleId) {
            obstacle.destroy();
            this.invisibleObstacles.delete(obstacle);
            console.log(`🧹 Honeypot ${obstacleId} cleaned up after collision`);
        }
    });
}
    
    // Görünmez engelle collision
    onInvisibleCollision(obstacle) {
        const collisionId = obstacle.honeypotId;
        
        console.log(`💥 Invisible collision detected: ${collisionId}`);
        
        this.actualCollisions.add(collisionId);
        this.collisionlessCount = 0; // Reset counter
        
        // Server'a normal collision gibi rapor et
        this.reportCollisionToServer(collisionId, 'invisible_hit');
    }
    
    // Player tracking - update() metodu içinde çağrılacak
    trackPlayerMovement() {
        if (!this.scene.player) return;
        
        this.invisibleObstacles.forEach(obstacle => {
            // Player engeli geçti mi kontrol et
            if (this.scene.player.x > obstacle.x + 50 && !obstacle.hasPassed) {
                obstacle.hasPassed = true;
                
                // Eğer bu engele çarpması bekleniyorsa
                if (obstacle.expectedHit && !this.actualCollisions.has(obstacle.honeypotId)) {
                    this.onSuspiciousBypass(obstacle);
                }
            }
        });
    }
    
    // Şüpheli bypass tespit edildi
    onSuspiciousBypass(obstacle) {
        this.collisionlessCount++;
        
        console.log(`🚨 Suspicious bypass detected: ${obstacle.honeypotId} (${this.collisionlessCount} times)`);
        
        this.suspiciousActivity.push({
            type: 'invisible_bypass',
            obstacleId: obstacle.honeypotId,
            timestamp: Date.now(),
            playerPosition: {x: this.scene.player.x, y: this.scene.player.y}
        });
        
        // Threshold kontrolü
        if (this.collisionlessCount >= 3) {
            this.flagCheatSuspicion();
        }
    }
    
    // Cheat şüphesi flag
    flagCheatSuspicion() {
        console.log("🚨 CHEAT SUSPICION FLAGGED: Multiple collision bypasses detected!");
        
        this.suspiciousActivity.push({
            type: 'cheat_flag',
            reason: 'Multiple collision bypasses',
            count: this.collisionlessCount,
            timestamp: Date.now()
        });
        
        this.reportSuspiciousActivity();
    }
    
    // Server'a collision rapor et
    async reportCollisionToServer(obstacleId, type) {
        try {
            // C# ASP.NET Core API endpoint'i
            const response = await fetch('/api/game/honeypot-collision', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    obstacleId: obstacleId,
                    collisionType: type,
                    playerPosition: {x: this.scene.player.x, y: this.scene.player.y},
                    timestamp: Date.now()
                })
            });
            
            console.log(`📡 Honeypot collision reported: ${type}`);
        } catch (error) {
            console.error("❌ Failed to report honeypot collision:", error);
        }
    }
    
    // Şüpheli aktiviteyi server'a bildir
    async reportSuspiciousActivity() {
        try {
            const response = await fetch('/api/game/cheat-detection', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    suspiciousActivity: this.suspiciousActivity,
                    collisionlessCount: this.collisionlessCount,
                    timestamp: Date.now()
                })
            });
            
            const result = await response.json();
            
            if (result && !result.success) {
                console.log("🔨 SERVER FLAGGED PLAYER AS CHEATER!");
                this.scene.triggerGameOver(); // Mevcut game over sistemini kullan
            }
        } catch (error) {
            console.error("❌ Failed to report suspicious activity:", error);
        }
    }
    
    // Cleanup
    cleanup() {
        this.invisibleObstacles.forEach(obstacle => {
            if (obstacle && obstacle.destroy) {
                obstacle.destroy();
            }
        });
        this.invisibleObstacles = [];
        console.log("🧹 Honeypot obstacles cleaned up");
    }
    
    // Debug info
    showDebugInfo() {
        console.log("🔍 HONEYPOT DEBUG INFO:");
        console.log(`- Session ID: ${this.sessionId}`);
        console.log(`- Total invisible obstacles: ${this.invisibleObstacles.length}`);
        console.log(`- Expected collisions: ${this.expectedCollisions.size}`);
        console.log(`- Actual collisions: ${this.actualCollisions.size}`);
        console.log(`- Collisionless count: ${this.collisionlessCount}`);
        console.log(`- Suspicious activities: ${this.suspiciousActivity.length}`);
    }
}

// 🎮 MEVCUT GAMESCENE CLASS'INI MODİFİYE ET
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('player', 'assets_z/player.png');
        this.load.image('player2', 'assets_z/player2.png');
        this.load.image('playerDuck', 'assets_z/player_duck.png');      
        this.load.image('coin', 'assets_z/coin.png');
        this.load.image('layer1', 'assets_z/parallax/layer1.png');
        this.load.image('layer2', 'assets_z/parallax/layer2.png');
        this.load.image('layer3', 'assets_z/parallax/layer3.png');

        this.load.image('cone', 'assets_z/cone.png');
        this.load.image('cart', 'assets_z/cart.png');
        this.load.image('cart2', 'assets_z/cart2.png');
        this.load.image('cat', 'assets_z/cat.png');
        this.load.image('old', 'assets_z/old.png');
        this.load.image('pigeon', 'assets_z/pigeon.png');

        this.load.image('scorePanel', 'assets_z/ui/score_panel.png');
        this.load.image('soundOn', 'assets_z/ui/sound_on.png');
        this.load.image('soundOff', 'assets_z/ui/sound_off.png');

        this.load.audio('buttonClick', 'assets_z/sounds/buttonClick.mp3');
        this.load.audio('coinSound', 'assets_z/sounds/coin.mp3');
        this.load.audio('gameOverSound', 'assets_z/sounds/gameover.mp3');
        this.load.audio('jumpSound', 'assets_z/sounds/jump.mp3');
        this.load.audio('winSound', 'assets_z/sounds/win.mp3');
        this.load.audio('damageSound', 'assets_z/sounds/damage.mp3');
    }

    create() {
        
        this.activeTweens = [];
        this.activeTimers = [];

        // 🍯 HONEYPOT SYSTEM BAŞLAT
        this.honeypot = new InvisibleHoneypot(this);
        console.log("🍯 Honeypot system integrated successfully!");

        // 🔒 Sadece 2 API çağrısı yap (jump API'sini KALDIR):
        Promise.all([
            GameAPI.call(GameAPI.ENDPOINTS.CONFIG)

        ])
        .then(([configData]) => {
            // BU SATIRLARI EKLE:
console.log("🔍 Config data:", configData);
console.log("🔍 Config keys:", Object.keys(configData));
console.log("🔍 JumpForce value:", configData.jumpForce);
console.log("🔍 JumpForce type:", typeof configData.jumpForce);
console.log("🔍 Gravity value:", configData.gravity);
console.log("🔍 PlayerSpeed value:", configData.playerSpeed);
            
            this.CONFIG = {
                scrollSpeed: configData.scrollSpeed,
                gameOver: false
            };

            this.groundLevel = configData.groundLevel;
            this.playerStartX = configData.playerStartX;
            this.physics.world.gravity.y = configData.gravity;
            this.playerScale = configData.playerScale;
            this.jumpForce = configData.jumpForce;

            console.log(`🔒 Secure jump force loaded: ${this.jumpForce}`);
            console.log(`🔍 this.jumpForce type: ${typeof this.jumpForce}`);
            
            this.continueCreate();
        })
        .catch(error => {
            console.error("Sunucu verileri alınırken hata oluştu:", error);
            this.add.text(100, 100, 'Oyun başlatılamadı. Lütfen tekrar deneyin.', { fontSize: '24px', fill: '#f00' });
        });
    }

    continueCreate() {
    GameAPI.post('/game/session/reset')
        .then(() => {

            console.log('✅ Server session reset successful');

              const sessionResetTime = Date.now();
            this.masterGameStartTime = sessionResetTime;
            window.masterGameStartTime = sessionResetTime;
            
            console.log('⏰ Session reset completed at:', new Date(sessionResetTime).toISOString());
            console.log('⏰ Master game start time set:', sessionResetTime);

            SimpleBatch.cleanup();
            console.log('✅ SimpleBatch system ready');

            // ✅ MASTER SESSION ID OLUŞTUR:
            this.masterSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            console.log('🆔 Master session ID created:', this.masterSessionId);

            // 🔐 Device Fingerprinting başlat
            console.log('🔐 Initializing Device Fingerprinting...');
            this.deviceFingerprint = new DeviceFingerprintManager();
            window.gameDeviceFingerprint = this.deviceFingerprint;

            // Test et
            console.log('🧪 Device fingerprint test:');
            this.deviceFingerprint.testFingerprint();

            // 🔐 Enhanced Secure API Client başlat
            console.log('🔐 Initializing Enhanced Secure API Client...');
            this.enhancedSecureAPIClient = new EnhancedSecureAPIClient();
            
            // ✅ API CLIENT SESSION'I SYNC ET:
            this.enhancedSecureAPIClient.sessionId = this.masterSessionId;
            
             if (this.deviceFingerprint) {
        this.enhancedSecureAPIClient.deviceFingerprint = this.deviceFingerprint;
        console.log('🔗 Device fingerprint synced to API client');
    }

            console.log('🔗 API Client session synced:', this.enhancedSecureAPIClient.sessionId);

            // 🛡️ Unified Snapshot Protection başlat
            console.log('🛡️ Initializing Unified Snapshot Protection...');
            this.unifiedProtection = new UnifiedSnapshotProtection(this);
            this.unifiedProtection.setSecureAPIClient(this.enhancedSecureAPIClient);
            
            // ✅ PROTECTION SESSION'I SYNC ET:
            this.unifiedProtection.sessionId = this.masterSessionId;
            this.unifiedProtection.enhancedSecureAPIClient = this.enhancedSecureAPIClient;

            console.log('🔗 Protection session synced:', this.unifiedProtection.sessionId);
            
            this.unifiedProtection.start();
            this.unifiedProtection.deviceFingerprint = this.deviceFingerprint;

            window.enhancedSecureAPIClient = this.enhancedSecureAPIClient;

            // ✅ HONEYPOT SESSION'I SYNC ET:
            if (this.honeypot) {
                this.honeypot.sessionId = this.masterSessionId;
                console.log('🔗 Honeypot session synced:', this.honeypot.sessionId);
            }

            // 🛡️ Variable Protection System başlat (varsa)
            if (window.VariableProtectionSystem) {
                console.log('🛡️ Initializing Variable Protection System...');
                this.variableProtection = new VariableProtectionSystem(this);
                this.variableProtection.enhancedSecureAPIClient = this.enhancedSecureAPIClient;
            }
            
            this.cursors = this.input.keyboard.createCursorKeys();
            this.setupState();             
            this.setupBackground();        
            this.setupGround();            
            this.setupPlayer();     

            if (this.playerScale) {
                this.player.setScale(this.playerScale);
            }

            this.physics.world.setBounds(0, -200, this.scale.width, this.groundLevel + 200);
            this.player.setCollideWorldBounds(true);

            this.setupInput();             
            this.setupSimpleObstacles();  
            this.setupCoins();             

            this.sounds = {
                background: this.sound.add('backgroundMusic', { loop: true, volume: 0.5 }),
                button: this.sound.add('buttonClick'),
                coin: this.sound.add('coinSound'),
                damage: this.sound.add('damageSound'),
                gameOver: this.sound.add('gameOverSound'),
                jump: this.sound.add('jumpSound'),
                win: this.sound.add('winSound')
            };

            this.sounds.background.play(); 
            this.createUI();       
            
            window.gameScene = this;
            gameStartTime = Date.now();
            preloadGameData();
            
            // ✅ SESSION SYNC VERIFICATION:
            console.log('🔍 Verifying session synchronization...');
            const masterSession = this.masterSessionId;
            const apiSession = this.enhancedSecureAPIClient?.sessionId;
            const protectionSession = this.unifiedProtection?.sessionId;
            const honeypotSession = this.honeypot?.sessionId;
            
            console.log(`   Master:     ${masterSession}`);
            console.log(`   API Client: ${apiSession}`);
            console.log(`   Protection: ${protectionSession}`);
            console.log(`   Honeypot:   ${honeypotSession}`);
            
            const allSame = [apiSession, protectionSession, honeypotSession].every(id => id === masterSession);
            
            if (allSame) {
                console.log('✅ All sessions synchronized successfully!');
            } else {
                console.log('❌ Session mismatch detected - this may cause validation issues');
            }
            
            console.log('🎮 Game initialization completed with enhanced security systems');
            console.log('🔐 Active systems: Device Fingerprinting, Enhanced API Client, Unified Protection');
        })
        .catch(error => {
            console.error("❌ Game initialization failed:", error);
            this.add.text(100, 100, 'Session reset başarısız. Lütfen tekrar deneyin.', { 
                fontSize: '24px', 
                fill: '#f00' 
            });
        });
}

    update(time, delta) {
        if (!this.CONFIG) return;

        // 🍯 HONEYPOT TRACKING EKLE
        if (this.honeypot) {
            this.honeypot.trackPlayerMovement();
        }

        if (!this.CONFIG.gameOver) {
            this.scrollBackground(delta);    
            this.handlePlayerJump();       
            this.handlePlayerLanding();    
            this.moveObstacles(delta);
            this.moveCoins(delta);       

            this.distanceCounter += this.CONFIG.scrollSpeed * this.distanceMultiplier;
            if (this.distanceCounter >= 1) {
                this.state.distance += Math.floor(this.distanceCounter);
                this.distanceCounter = this.distanceCounter % 1;
                this.distanceText.setText(this.state.distance + ' M');
            }
        }

        this.cleanupObstacles();
        this.cleanupCoins();  

        if (this.player && this.isPlayerOnGround()) {
            if (!this.playerGroundLogged) {
                console.log("=== PLAYER ON GROUND ===");
                this.playerGroundLogged = true;
            }
        } else {
            this.playerGroundLogged = false;
        }
    }

    isPlayerOnGround() {
        return (
            this.player &&
            this.player.body &&
            this.player.body.blocked &&
            this.player.body.blocked.down
        );
    }

    // ✅ game_z.js'deki setupSimpleObstacles() metodunu bununla değiştirin

setupSimpleObstacles() {
    this.groundObstacles = this.add.group();
    this.skyObstacles = this.add.group();

    this.lastObstacleX = 0;
    this.lastObstacleType = null;
    this.groundTypes = ['cone', 'cart', 'cart2', 'cat', 'old'];

    this.physics.add.overlap(this.player, this.groundObstacles, this.handleObstacleHit, null, this);
    this.physics.add.overlap(this.player, this.skyObstacles, this.handleObstacleHit, null, this);

    // ✅ FULL QUEUE SYSTEM: Sadece queue'dan spawn
    this.obstacleTimer = this.time.addEvent({
        delay: 2000,
        callback: () => {
            if (this.CONFIG.gameOver) return;

            // Sadece queue'dan spawn et - API fallback YOK
            if (spawnObstacleFromQueue()) {
                // 🍯 Honeypot placement after successful queue spawn
                if (this.honeypot) {
                    this.time.delayedCall(100, () => {
                        this.honeypot.placeStrategicHoneypots();
                    });
                }
            } else {
                console.warn("⚠️ Queue empty! No obstacles spawned. Check preload.");
            }
        },
        loop: true
    });

    this.activeTimers.push(this.obstacleTimer);
}


    spawnGroundObstacle(x, obstacleType) {
    const obstacle = this.physics.add.sprite(x, this.groundLevel + 30, obstacleType);
    obstacle.setOrigin(0.5, 1);
    obstacle.body.allowGravity = false;
    obstacle.setImmovable(true);
    obstacle.setDepth(5);

    this.groundObstacles.add(obstacle);

    console.log(`Ground obstacle spawned: ${obstacleType} at x: ${x}`);
    
    // 🔧 HER OBSTACLE SPAWN'INDAN SONRA HONEYPOT KONTROL ET
    if (this.honeypot) {
        // Kısa bir delay ile honeypot yerleştir (obstacle grup'a eklendikten sonra)
        this.time.delayedCall(100, () => {
            this.honeypot.placeStrategicHoneypots();
        });
    }
}

    spawnSkyObstacle(x, scale = 0.38) {
    const skyY = this.scale.height - 230;
    
    // 🧪 DEBUG - geçici
    console.log("🐦 Sky obstacle debug:");
    console.log("   this.scale.height:", this.scale.height);
    console.log("   this.groundSurface:", this.groundSurface);
    console.log("   Calculated skyY:", skyY);
    
    const obstacle = this.physics.add.sprite(x, skyY, 'pigeon');
    obstacle.setOrigin(0.5, 0.5);
    obstacle.body.allowGravity = false;
    obstacle.setImmovable(true);
    obstacle.setDepth(3);

    const floatTween = this.tweens.add({
        targets: obstacle,
        y: skyY + 10,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });
    this.activeTweens.push(floatTween);

    this.skyObstacles.add(obstacle);

    console.log(`🐦 Sky obstacle spawned at x: ${x}, y: ${skyY}`);
}

    moveObstacles(delta) {
        // 🛡️ Güvenlik kontrolü ekle
        if (!this.groundObstacles || !this.skyObstacles) {
            return; // Henüz hazır değilse çık
        }
        
        const deltaSeconds = delta / 1000;
        const moveSpeed = this.CONFIG.scrollSpeed * 60;
        
        this.groundObstacles.children.iterate(obstacle => {
            if (obstacle) {
                obstacle.x -= moveSpeed * deltaSeconds;
            }
        });
        
        this.skyObstacles.children.iterate(obstacle => {
            if (obstacle) {
                obstacle.x -= moveSpeed * deltaSeconds;
            }
        });
    }

    cleanupObstacles() {
        if (!this.groundObstacles || !this.skyObstacles) return;

        this.groundObstacles.children?.iterate(obstacle => {
            if (obstacle && obstacle.x < -100) {
                obstacle.destroy();
            }
        });

        this.skyObstacles.children?.iterate(obstacle => {
            if (obstacle && obstacle.x < -100) {
                obstacle.destroy();
            }
        });
    }

    triggerGameOver() {

        if (this.unifiedProtection) {
    this.unifiedProtection.resetAfterGameOver();
}

        if (this.CONFIG.gameOver || this.processingCollision) return;

        this.processingCollision = true;
        this.CONFIG.gameOver = true;
        this.physics.pause();

        this.sendGameOverSignal('collision');

        this.player.setTexture('player2');
        this.player.setVelocity(0, 0);
        if (!this.isMuted) this.sounds.gameOver.play();

        console.log('Game Over! Hit obstacle!');

        const gameOverTimer = this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', {
                score: this.state.score,
                distance: this.state.distance,
                isMuted: this.isMuted
            });
        });
        this.activeTimers.push(gameOverTimer);
    }

    handleObstacleHit(player, obstacle) {
         console.log('💥 Player hit obstacle!');
    
    // ✅ Sadece burada asset değişsin:
    this.player.setTexture('player2');
        this.triggerGameOver();
    }

    setupState() {
        this.state = {
            score: 0,
            distance: 0
        };
        this.isMuted = false;
        this.canTakeDamage = true;
        this.distanceCounter = 0;
        this.distanceMultiplier = 0.1;

        this.activeTweens = [];
        this.activeTimers = [];
        this.processingCollision = false;
        this.processingVictory = false;

        this.coinsCollected = 0;        
        this.speedIncreaseThreshold = 2; 
    }

    setupBackground() {
        this.backgroundLayers = {
            layer1: this.add.tileSprite(0, -100, this.scale.width, this.scale.height + 100, 'layer1').setOrigin(0, 0),
            layer2: this.add.tileSprite(0, -110, this.scale.width, this.scale.height + 110, 'layer2').setOrigin(0, 0),
            layer3: this.add.tileSprite(0, 0, this.scale.width, this.scale.height + 0, 'layer3').setOrigin(0, 0)
        };

        this.backgroundLayers.layer1.setDepth(-6);
        this.backgroundLayers.layer2.setDepth(-5);
        this.backgroundLayers.layer3.setDepth(-4);
    }

    setupGround() {
        this.groundLevel = this.scale.height - 60;
        this.groundSurface = this.groundLevel;
        this.obstacleGroundLevel = this.scale.height - 20;
    }

   setupPlayer() {
    const playerX = this.scale.width * 0.15; 
    const playerY = 100;
    
    if (this.unifiedProtection) {
        this.unifiedProtection.expectPlayerCreation();
    }
    
    // ✅ Backend scale'ini doğrudan kullan
    const finalScale = this.playerScale || 0.32;
    this.player = this.physics.add.sprite(playerX, playerY, 'player').setScale(finalScale);
    
    this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.8);
    this.player.body.setOffset(this.player.width * 0.15, this.player.height * 0.1);
    this.player.wasOnGround = true;
    
    // ✅ Tutarlı scale kaydet
    this.originalPlayerScale = finalScale; // 0.32 olarak kaydet
    this.player.originalScale = finalScale;
    this.player.secureSetup = true;
    
    this.player.isDucking = false;
    this.player.normalTexture = 'player';
    this.player.duckTexture = 'playerDuck';
    
    if (this.unifiedProtection) {
        this.unifiedProtection.playerSetupComplete();
    }
    
    console.log("🎮 Secure player setup completed:", this.player.x, this.player.y, "scale:", finalScale);
}

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    }

    scrollBackground(delta) {
        if (!this.backgroundLayers || !this.backgroundLayers.layer1) {
            return;
        }
        
        const deltaSeconds = delta / 1000;
        const baseSpeedPerSecond = this.CONFIG.scrollSpeed * 60; 
        
        this.backgroundLayers.layer1.tilePositionX += baseSpeedPerSecond * 0.02 * deltaSeconds;
        this.backgroundLayers.layer2.tilePositionX += baseSpeedPerSecond * 0.08 * deltaSeconds;
        this.backgroundLayers.layer3.tilePositionX += baseSpeedPerSecond * 0.25 * deltaSeconds;
    }

    handlePlayerJump() {
        if (!this.player || !this.cursors) {
            return;
        }

        if (!this.cursors) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
        
        const isUpPressed = this.cursors.up.isDown || this.cursors.space.isDown;
        const isDownPressed = this.cursors.down.isDown;

        if (isUpPressed && this.isPlayerOnGround() && !this.player.isDucking) {
            this.player.setVelocityY(-this.jumpForce);
            if (!this.isMuted) this.sounds.jump.play();
            
            console.log(`🔒 Jump: ${this.jumpForce} (speed: ${this.CONFIG.scrollSpeed.toFixed(2)})`);
            
            const jumpTween = this.tweens.add({
                targets: this.player,
                rotation: 0.2,
                duration: 300,
                ease: 'Power2'
            });
            this.activeTweens.push(jumpTween);
        }

        if (isDownPressed && this.isPlayerOnGround() && !this.player.isDucking) {
            this.startDucking();
        } else if (!isDownPressed && this.player.isDucking && this.isPlayerOnGround()) {
            this.stopDucking();
        }
    }

    startDucking() {
        if (this.player.isDucking) return;

        this.player.isDucking = true;
        this.player.setTexture(this.player.duckTexture);
        
        const duckTween = this.tweens.add({
            targets: this.player,
            scaleY: this.player.scaleY * 0.9,
            duration: 120,
            ease: 'Power2.easeOut'
        });
        this.activeTweens.push(duckTween);
            
        this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.5);
        this.player.body.setOffset(this.player.width * 0.15, this.player.height * 0.4);
    }

    stopDucking() {
        if (!this.player.isDucking) return;
        
        this.player.isDucking = false;
        this.player.setTexture(this.player.normalTexture);

        const unduckTween = this.tweens.add({
            targets: this.player,
            scaleY: this.originalPlayerScale,
            duration: 120,
            ease: 'Power2.easeOut'
        });
        this.activeTweens.push(unduckTween);

        this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.8);
        this.player.body.setOffset(this.player.width * 0.15, this.player.height * 0.1);
    }

    handlePlayerLanding() {
        if (!this.player || !this.player.body || this.CONFIG.gameOver) {
            return;
        }
        
        const isGrounded = this.isPlayerOnGround();
        const justLanded = isGrounded && !this.player.wasOnGround;
        
        if (justLanded && this.player.lastVelocityY > 200) {
            this.player.rotation = 0;
            
            if (!this.player.isDucking) {
                const landTween = this.tweens.add({
                    targets: this.player,
                    scaleY: this.originalPlayerScale * 0.92,
                    duration: 60,
                    ease: 'Power2',
                    yoyo: true,
                    onComplete: () => {
                        if (!this.player.isDucking) {
                            this.player.setScale(this.originalPlayerScale, this.originalPlayerScale);
                        }
                    }
                });
                this.activeTweens.push(landTween);
            }
        }
        
        this.player.lastVelocityY = this.player.body.velocity.y;
        this.player.wasOnGround = isGrounded;
    }
        

    async sendGameOverSignal(reason) {
    try {
        console.log('📡 Sending game over signal to server...');
        
        const signalData = {
            sessionId: this.masterSessionId || this.enhancedSecureAPIClient?.sessionId || 'unknown',
            finalScore: this.state?.score || 0,
            reason: reason,
            timestamp: Date.now()
        };
        
        const response = await fetch('http://localhost:5080/api/game/game-over-signal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            },
            body: JSON.stringify(signalData)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Game over signal sent successfully:', data);
        } else {
            console.warn('⚠️ Game over signal failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Failed to send game over signal:', error);
    }
}



    handleCoinSpeedIncrease() {
    this.coinsCollected++;
    
    console.log(`🔧 Requesting coin difficulty update for ${this.coinsCollected} coins...`);
    
    // ✅ Yeni endpoint kullanın
    GameAPI.call(`${GameAPI.ENDPOINTS.COIN_DIFFICULTY}/${this.coinsCollected}`)
    .then(data => {
        if (this.CONFIG.gameOver) return;
        
        if (data && data.success && data.newScrollSpeed !== undefined) {
            this.CONFIG.scrollSpeed = Number(data.newScrollSpeed);
            console.log(`✅ Server updated speed: ${this.CONFIG.scrollSpeed.toFixed(1)}`);
            
            // Victory kontrolü
            if (data.maxCoins && this.coinsCollected >= data.maxCoins) {
                console.log(`🏆 Maximum coins reached! Triggering victory...`);
                this.triggerVictory();
            }
        } else {
            // Fallback
            this.CONFIG.scrollSpeed += 0.5;
            console.log(`⚠️ Using fallback speed: ${this.CONFIG.scrollSpeed.toFixed(1)}`);
        }
    })
    .catch(error => {
        console.error(`❌ Coin difficulty API failed:`, error);
        // Fallback
        this.CONFIG.scrollSpeed += 0.5;
        console.log(`🔄 Fallback speed: ${this.CONFIG.scrollSpeed.toFixed(1)}`);
    });
}

    // ✅ game_z.js'deki setupCoins() metodunu bununla değiştirin
setupCoins() {
    this.coins = this.add.group();
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // ✅ SADECE Queue-based spawning - NO API fallback
    this.coinSpawnTimer = this.time.addEvent({
        delay: 2500, // Fixed interval
        callback: () => {
            if (!this.CONFIG.gameOver) {
                // Sadece queue'dan spawn - NO fallback generation
                if (!spawnCoinFromQueue()) {
                    console.warn("⚠️ Coin queue empty, waiting for server refill...");
                    // Queue boşsa sadece bekle, frontend generation yok!
                }
            }
        },
        callbackScope: this,
        loop: true
    });
    
    this.activeTimers.push(this.coinSpawnTimer);
    console.log("🪙 Secure coin system: Server-only generation active");
}



    collectCoin(player, coin) {
        if (coin.collected || this.CONFIG.gameOver) return;
        
        coin.collected = true; 
        coin.destroy();
        this.state.score += 10;
        this.scoreText.setText(this.state.score);

        if (!this.isMuted) this.sounds.coin.play();
        
        this.handleCoinSpeedIncrease();
        
        console.log(`🪙 Coin collected, added to batch (${SimpleBatch.getStatus().pendingCoins} pending)`);
    }

    moveCoins(delta) {
        // 🛡️ Güvenlik kontrolü ekle
        if (!this.coins) {
            return; // Henüz hazır değilse çık
        }
        
        const deltaSeconds = delta / 1000;
        const moveSpeedPerSecond = this.CONFIG.scrollSpeed * 60;
        
        this.coins.children.iterate(coin => {
            if (coin) {
                coin.x -= moveSpeedPerSecond * deltaSeconds;
            }
        });
    }

    cleanupCoins() {
        if (!this.coins) return;

        this.coins.children?.iterate(coin => {
            if (coin && coin.x < -100) {
                coin.destroy();
            }
        });
    }

    triggerVictory() {
        if (this.CONFIG.gameOver || this.processingVictory) return;
        
        this.processingVictory = true;

        this.CONFIG.gameOver = true;
        this.physics.pause();
        
        if (!this.isMuted) this.sounds.win.play();
        
        const victoryTimer = this.time.delayedCall(1000, () => {
            this.scene.start('VictoryScene', {
                score: this.state.score,
                distance: this.state.distance,
                isMuted: this.isMuted
            });
        });
        this.activeTimers.push(victoryTimer);
    }

    createUI() {
        const scorePanel = this.add.image(100, 60, 'scorePanel');
        scorePanel.setScale(0.25);
        scorePanel.setScrollFactor(0);
        scorePanel.setDepth(1000);

        this.scoreText = this.add.text(142, 58, this.state.score.toString(), {
            fontSize: '20px',
            fontFamily: 'monospace',
            fill: '#87937f', 
            stroke: '#1b1628', 
            strokeThickness: 3
        });
        this.scoreText.setOrigin(0.5);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1001);

        this.distanceText = this.add.text(this.scale.width - 120, 50, '0M', {
            fontSize: '26px',
            fontFamily: 'monospace',
            fill: '#87937f',
            stroke: '#1b1628',
            strokeThickness: 3,
            fontStyle: 'bold'
        });
        this.distanceText.setOrigin(0.5);
        this.distanceText.setScrollFactor(0);
        this.distanceText.setDepth(1001);

        this.soundToggleButton = this.add.image(this.scale.width - 40, 100, 'soundOn');
        this.soundToggleButton.setScale(0.1);
        this.soundToggleButton.setScrollFactor(0);
        this.soundToggleButton.setDepth(1001);
        this.soundToggleButton.setInteractive();

        this.soundToggleButton.on('pointerdown', () => {
            if (!this.isMuted) this.sounds.button.play();
            this.isMuted = !this.isMuted;
            this.sound.mute = this.isMuted;
            this.soundToggleButton.setTexture(this.isMuted ? 'soundOff' : 'soundOn');
        });
    }

    shutdown() {
        SimpleBatch.cleanup();

         // 🛡️ YENİ KOD - BU SATIRLARI EKLEYİN:
    if (this.unifiedProtection) {
        this.unifiedProtection.stop();
        this.unifiedProtection = null;
        console.log('🛡️ Unified Protection stopped');
    }
        
        // 🍯 HONEYPOT CLEANUP EKLE
        if (this.honeypot) {
            this.honeypot.cleanup();
        }

        this.activeTweens.forEach(tween => {
            if (tween && !tween.hasDispatched) {
                tween.destroy();
            }
        });
        this.activeTweens = [];

        this.activeTimers.forEach(timer => {
            if (timer) {
                timer.destroy();
            }
        });
        this.activeTimers = [];

        if (this.obstacleTimer) {
            this.obstacleTimer.destroy();
            this.obstacleTimer = null;
        }

        if (this.coinSpawnTimer) {
            this.coinSpawnTimer.destroy();
            this.coinSpawnTimer = null;
        }

        if (this.sounds && this.sounds.background) {
            this.sounds.background.stop();
        }

        if (this.groundObstacles) {
            this.groundObstacles.clear(true, true);
        }
        if (this.skyObstacles) {
            this.skyObstacles.clear(true, true);
        }
        if (this.coins) {
            this.coins.clear(true, true);
        }

        this.input.keyboard.removeAllListeners();
    }
}

// 🍯 ============================================
// 🎯 DEBUG KOMUTLARI (Test için Console'da kullan)
// ============================================

// Honeypot debug info göster
function showHoneypotDebug() {
    if (window.gameScene && window.gameScene.honeypot) {
        window.gameScene.honeypot.showDebugInfo();
    } else {
        console.log("❌ Honeypot system not found");
    }
}

// Manual honeypot yerleştir (test için)
function createTestHoneypot(x = 400, y = 500) {
    if (window.gameScene && window.gameScene.honeypot) {
        window.gameScene.honeypot.createInvisibleObstacle(x, y, true);
        console.log(`✅ Test honeypot created at x:${x}, y:${y}`);
    } else {
        console.log("❌ Honeypot system not found");
    }
}

// Collision'ı test için kapatma/açma
function toggleCollision() {
    if (window.gameScene && window.gameScene.player) {
        const isEnabled = window.gameScene.player.body.enable;
        window.gameScene.player.body.enable = !isEnabled;
        console.log(`🔧 Player collision ${!isEnabled ? 'ENABLED' : 'DISABLED'}`);
        console.log(`⚠️  ${!isEnabled ? 'Normal mode' : 'CHEAT MODE - Should be detected!'}`);
    }
}

// Global'e debug fonksiyonları ekle
window.showHoneypotDebug = showHoneypotDebug;
window.createTestHoneypot = createTestHoneypot;
window.toggleCollision = toggleCollision;

console.log(`
🍯 ===== HONEYPOT SYSTEM READY! =====

🧪 TEST KOMUTLARI (Console'da kullan):

1. showHoneypotDebug()     - Debug bilgilerini göster
2. createTestHoneypot()    - Test honeypot oluştur
3. toggleCollision()       - Collision kapat/aç (test için)

🎯 NASIL TEST EDİLİR:
1. Normal oyun oyna → Invisible collision'lar görmeli
2. toggleCollision() çağır → Collision kapatılır
3. Engellerden geç → Cheat detection trigger olmalı

🔒 GÜVENLIK DURUMU: ACTIVE ✅
`);

class GameOverScene extends Phaser.Scene {

    
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalDistance = data.distance || 0;
        this.isMuted = data.isMuted || false;
    }

    preload() {
        this.load.image('tekraroyna', 'assets_z/ui/tekraroyna.png');
        this.load.image('gameOverImage', 'assets_z/ui/game_over.png');
    }

    create() {

        this.activeTweens = [];
        this.activeTimers = [];
        this.isRestarting = false;

        const blackScreen = this.add.rectangle(
            this.scale.width / 2, 
            this.scale.height / 2, 
            this.scale.width, 
            this.scale.height, 
            0x000000
        );
        blackScreen.setDepth(1000);
        
         const fadeTween = this.tweens.add({
        targets: blackScreen,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => blackScreen.destroy()
    });
    this.activeTweens.push(fadeTween);

        const overlay = this.add.rectangle(
            this.scale.width / 2, 
            this.scale.height / 2, 
            this.scale.width, 
            this.scale.height, 
            0x000000, 
            0.8
        );
        overlay.setDepth(0);

        const gameOverImage = this.add.image(
            this.scale.width / 2, 
            -200, 
            'gameOverImage'
        );
        gameOverImage.setOrigin(0.5);
        gameOverImage.setDepth(100);
        gameOverImage.setScale(0.1); 
        gameOverImage.setAlpha(0); 
        
         const gameOverTween1 = this.tweens.add({
        targets: gameOverImage,
        y: this.scale.height / 2 - 100,
        scaleX: 0.4,
        scaleY: 0.4,
        alpha: 1,
        duration: 600,
        ease: 'Back.easeOut',
        delay: 200,
        onComplete: () => {
            const gameOverTween2 = this.tweens.add({
                targets: gameOverImage,
                y: gameOverImage.y - 4,
                duration: 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            this.activeTweens.push(gameOverTween2);
            
            const gameOverTween3 = this.tweens.add({
                targets: gameOverImage,
                scaleX: 0.41,
                scaleY: 0.41,
                duration: 1800,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            this.activeTweens.push(gameOverTween3);
        }
    });
    this.activeTweens.push(gameOverTween1);
        
        const distanceText = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2 + 60,
            `${this.finalDistance}M`, 
            {
                fontSize: '24px',
                fontFamily: 'monospace',
                fill: '#87937f',
                stroke: '#1b1628',
                strokeThickness: 3,
                fontStyle: 'bold'
            }
        );
        distanceText.setOrigin(0.5);
        distanceText.setDepth(100);
        distanceText.setAlpha(0);
        distanceText.setScale(0.8);
        
        const distanceTween = this.tweens.add({
        targets: distanceText,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 500,
        ease: 'Back.easeOut',
        delay: 1000
    });
    this.activeTweens.push(distanceTween);

        const restartButton = this.add.image(
            this.scale.width / 2, 
            this.scale.height + 140, 
            'tekraroyna'
        );
        restartButton.setScale(0.1); 
        restartButton.setInteractive();
        restartButton.setDepth(100);
        restartButton.setAlpha(0);

        const buttonTween1 = this.tweens.add({
        targets: restartButton,
        y: this.scale.height / 2 + 140,
        scaleX: 0.25, 
        scaleY: 0.25, 
        alpha: 1,
        duration: 600,
        ease: 'Back.easeOut',
        delay: 1200
    });
    this.activeTweens.push(buttonTween1);

        const buttonTween2 = this.tweens.add({
        targets: restartButton,
        scaleX: 0.28, 
        scaleY: 0.28,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: 1800
    });
    this.activeTweens.push(buttonTween2);

        const buttonTween3 = this.tweens.add({
        targets: restartButton,
        alpha: 0.8,
        duration: 1200,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: 1800
    });
    this.activeTweens.push(buttonTween3);

        restartButton.on('pointerover', () => {
            this.tweens.killTweensOf(restartButton);
            
            const hoverTween = this.tweens.add({
            targets: restartButton,
            scaleX: 0.28, 
            scaleY: 0.28, 
            alpha: 1,
            duration: 200,
            ease: 'Power2.easeOut'
        });
        this.activeTweens.push(hoverTween);
        });
        
        restartButton.on('pointerout', () => {
            this.tweens.killTweensOf(restartButton);
            
    const outTween = this.tweens.add({
        targets: restartButton,
        scaleX: 0.25, 
        scaleY: 0.25, 
        alpha: 1,
        duration: 300,
        ease: 'Back.easeOut'
    });
    this.activeTweens.push(outTween); 
    
    const outPulseTween = this.tweens.add({
        targets: restartButton,
        scaleX: 0.28, 
        scaleY: 0.28, 
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: 300
    });
    this.activeTweens.push(outPulseTween); 

        });

        restartButton.on('pointerdown', () => {
    this.tweens.killTweensOf(restartButton);
    
    const clickTween1 = this.tweens.add({
        targets: restartButton,
        scaleX: 0.3, 
        scaleY: 0.3, 
        duration: 100,
        ease: 'Power2.easeOut',
        onComplete: () => {
            const clickTween2 = this.tweens.add({
                targets: restartButton,
                scaleX: 0.5, 
                scaleY: 0.5, 
                alpha: 0,
                duration: 300,
                ease: 'Power2.easeIn'
            });
            this.activeTweens.push(clickTween2); 
        }
    });
    this.activeTweens.push(clickTween1); 
    // TRACK THIS TIMER:
    const restartTimer = this.time.delayedCall(100, () => {
        this.restartGame();
    });
    this.activeTimers.push(restartTimer); 
});

        this.input.keyboard.on('keydown-SPACE', () => {
            this.restartGame();
        });

        this.input.keyboard.on('keydown-UP', () => {
            this.restartGame();
        });
    }

    restartGame() {
    // ADD RESTART PROTECTION:
    if (this.isRestarting) return;
    this.isRestarting = true;

     if (window.SimpleBatch) {
        SimpleBatch.cleanup();
    }

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
    });
}

    goToMenu() {
        this.scene.stop('GameOverScene');
        this.scene.start('GameStartScene');
    }

    shutdown() {
    
    this.activeTweens.forEach(tween => {
        if (tween && !tween.hasDispatched) {
            tween.destroy();
        }
    });
    this.activeTweens = [];

    this.activeTimers.forEach(timer => {
        if (timer) {
            timer.destroy();
        }
    });
    this.activeTimers = [];

    this.input.keyboard.removeAllListeners();
}

}

class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalDistance = data.distance || 0;
        this.isMuted = data.isMuted || false;
    }

    preload() {
        this.load.image('victorybuton', 'assets_z/ui/victorybuton.png');
        this.load.image('victoryImage', 'assets_z/ui/victory.png');
        this.load.image('player', 'assets_z/player.png');
        this.load.image('coin', 'assets_z/coin.png');
        this.load.audio('coinSound', 'assets_z/sounds/coin.mp3');
    }

    create() {
        this.activeTweens = [];
        this.activeTimers = [];
        this.isRestarting = false;
        this.sound.mute = this.isMuted;
        this.coinSound = this.sound.add('coinSound');

        const blackScreen = this.add.rectangle(
            this.scale.width / 2, 
            this.scale.height / 2, 
            this.scale.width, 
            this.scale.height, 
            0x000000
        );
        blackScreen.setDepth(1000);
        
        const blackFadeTween = this.tweens.add({
    targets: blackScreen,
    alpha: 0,
    duration: 800,
    ease: 'Power2',
    onComplete: () => blackScreen.destroy()
});
this.activeTweens.push(blackFadeTween); 

        // Dark overlay
        const overlay = this.add.rectangle(
            this.scale.width / 2, 
            this.scale.height / 2, 
            this.scale.width, 
            this.scale.height, 
            0x000000, 
            0.7
        );
        overlay.setDepth(0);

        // Start animasyonları
        this.startPlayerAnimation();
        this.startConfettiEffect();
        this.startCoinRain();

        // Victory image
        const victoryImage = this.add.image(
            this.scale.width / 2 + 2, 
            -120,
            'victoryImage'
        );
        victoryImage.setOrigin(0.5);
        victoryImage.setDepth(500); 
        victoryImage.setScale(0.4);
        victoryImage.setAlpha(0);
        
        // Victory image animasyon
        const victoryEntranceTween = this.tweens.add({
    targets: victoryImage,
    y: this.scale.height / 2 - 120,
    scaleX: 0.4,
    scaleY: 0.4,
    alpha: 1,
    duration: 800,
    ease: 'Back.easeOut',
    delay: 300,
    onComplete: () => {
        
        const victoryPulseTween = this.tweens.add({
            targets: victoryImage,
            scaleX: 0.42,
            scaleY: 0.42,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        this.activeTweens.push(victoryPulseTween);
        
        const victoryFloatTween = this.tweens.add({
            targets: victoryImage,
            y: victoryImage.y - 6,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        this.activeTweens.push(victoryFloatTween); 
    }
});
this.activeTweens.push(victoryEntranceTween); 

        // Restart button
        const restartButton = this.add.image(
            this.scale.width / 2, 
            this.scale.height + 130,
            'victorybuton'
        );
        restartButton.setScale(0.1);
        restartButton.setInteractive();
        restartButton.setDepth(500); 
        restartButton.setAlpha(0);

        // Button animation
        const buttonTween1 = this.tweens.add({
    targets: restartButton,
    y: this.scale.height / 2 + 130,
    scaleX: 0.3,
    scaleY: 0.3,
    alpha: 1,
    duration: 600,
    ease: 'Back.easeOut',
    delay: 1800
});
this.activeTweens.push(buttonTween1);


        // Button pulse
const buttonTween2 = this.tweens.add({
    targets: restartButton,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 800,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
    delay: 2400
});
this.activeTweens.push(buttonTween2);

        // Button interactions
        restartButton.on('pointerover', () => {
    this.tweens.killTweensOf(restartButton);
    
    const hoverTween = this.tweens.add({
        targets: restartButton,
        scaleX: 0.35,
        scaleY: 0.35,
        alpha: 1,
        duration: 200,
        ease: 'Power2.easeOut'
    });
    this.activeTweens.push(hoverTween); 
});
        
        restartButton.on('pointerout', () => {
    this.tweens.killTweensOf(restartButton);
    
    const outTween1 = this.tweens.add({
        targets: restartButton,
        scaleX: 0.3,
        scaleY: 0.3,
        alpha: 1,
        duration: 300,
        ease: 'Back.easeOut'
    });
    this.activeTweens.push(outTween1); 

    const outTween2 = this.tweens.add({
        targets: restartButton,
        scaleX: 0.32,
        scaleY: 0.32,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: 300
    });
    this.activeTweens.push(outTween2); 
});

        restartButton.on('pointerdown', () => {
    this.tweens.killTweensOf(restartButton);
    
    const clickTween1 = this.tweens.add({
        targets: restartButton,
        scaleX: 0.25,
        scaleY: 0.25,
        duration: 100,
        ease: 'Power2.easeOut',
        onComplete: () => {
            const clickTween2 = this.tweens.add({
                targets: restartButton,
                scaleX: 0.4,
                scaleY: 0.4,
                alpha: 0,
                duration: 300,
                ease: 'Power2.easeIn'
            });
            this.activeTweens.push(clickTween2); 
        }
    });
    this.activeTweens.push(clickTween1); 
    
    const restartTimer = this.time.delayedCall(100, () => {
        this.restartGame();
    });
    this.activeTimers.push(restartTimer); 
});

        // Keyboard controls
        this.input.keyboard.on('keydown-SPACE', () => {
            this.restartGame();
        });

        this.input.keyboard.on('keydown-UP', () => {
            this.restartGame();
        });
    }

    update(time, delta) {
      
        this.updateConfetti();
    }

    startPlayerAnimation() {
        
        this.victoryPlayer = this.add.sprite(
            -100,
            this.scale.height - 120,
            'player'
        );
        this.victoryPlayer.setScale(0.5);
        this.victoryPlayer.setDepth(300); 

        // player hareket animasyonu
        const playerMoveTween = this.tweens.add({
        targets: this.victoryPlayer,
        x: this.scale.width + 100,
        duration: 6000,
        ease: 'Power2.easeInOut'
    });
    this.activeTweens.push(playerMoveTween);

        // player bounce animasyonu
        const playerBounceTween = this.tweens.add({
        targets: this.victoryPlayer,
        y: this.victoryPlayer.y - 15,
        duration: 400,
        ease: 'Power2',
        yoyo: true,
        repeat: 14
    });
    this.activeTweens.push(playerBounceTween);

    }

    startConfettiEffect() {
        this.confettiParticles = [];
        const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA07A, 0x98D8C8, 0xFFD93D];

        // confetti
        for (let i = 0; i < 40; i++) {
            const confetti = this.add.rectangle(
                Phaser.Math.Between(0, this.scale.width),
                Phaser.Math.Between(-200, -50),
                8,
                8,
                colors[Math.floor(Math.random() * colors.length)]
            );
            confetti.setDepth(200); 
            confetti.rotation = Math.random() * Math.PI * 2;
            confetti.fallSpeed = Phaser.Math.Between(2, 5);
            confetti.rotationSpeed = (Math.random() - 0.5) * 0.2;
            
            this.confettiParticles.push(confetti);
        }
    }

    updateConfetti() {
        if (!this.confettiParticles) return;

        this.confettiParticles.forEach((confetti) => {
            confetti.y += confetti.fallSpeed;
            confetti.rotation += confetti.rotationSpeed;

            // Reset confetti
            if (confetti.y > this.scale.height + 50) {
                confetti.y = -50;
                confetti.x = Phaser.Math.Between(0, this.scale.width);
            }
        });
    }

    startCoinRain() {
        this.coinRainActive = true;
        this.rainCoins = [];

        // 4 sn coin rain
        const coinRainTimer = this.time.addEvent({
            delay: 150,
            callback: this.dropCoin,
            callbackScope: this,
            repeat: 26 // yaklaşık 4sn
        });
         this.activeTimers.push(coinRainTimer);

        // 4 sn sonra durdur
       const stopRainTimer = this.time.delayedCall(4000, () => {
        this.coinRainActive = false;
        coinRainTimer.destroy();
    });
    this.activeTimers.push(stopRainTimer);

    }

    dropCoin() {
        if (!this.coinRainActive) return;

        const coin = this.add.sprite(
            Phaser.Math.Between(50, this.scale.width - 50),
            -50,
            'coin'
        );
        coin.setScale(0.08);
        coin.setDepth(250); 

        this.rainCoins.push(coin);

        // coin düşüş animasyonu
         const coinFallTween = this.tweens.add({
            targets: coin,
            y: this.scale.height + 50,
            duration: Phaser.Math.Between(1500, 2500),
            ease: 'Power2.easeIn',
            onComplete: () => {
                coin.destroy();
                const index = this.rainCoins.indexOf(coin);
                if (index > -1) {
                    this.rainCoins.splice(index, 1);
                }
            }
        });
         this.activeTweens.push(coinFallTween);

        const coinRotationTween = this.tweens.add({
            targets: coin,
            rotation: Math.PI * 2,
            duration: 1000,
            repeat: -1
        });
        this.activeTweens.push(coinRotationTween);

        if (Math.random() < 0.3 && !this.isMuted) {
            this.coinSound.play({ volume: 0.3 });
        }
    }

    restartGame() {
          if (this.isRestarting) return;
    this.isRestarting = true;

     if (window.SimpleBatch) {
        SimpleBatch.cleanup();
    }

        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    shutdown() {

    this.activeTweens.forEach(tween => {
        if (tween && !tween.hasDispatched) {
            tween.destroy();
        }
    });
    this.activeTweens = [];

    this.activeTimers.forEach(timer => {
        if (timer) {
            timer.destroy();
        }
    });
    this.activeTimers = [];

    this.coinRainActive = false;

    if (this.confettiParticles) {
        this.confettiParticles.forEach(confetti => {
            if (confetti) confetti.destroy();
        });
        this.confettiParticles = [];
    }

    if (this.rainCoins) {
        this.rainCoins.forEach(coin => {
            if (coin) coin.destroy();
        });
        this.rainCoins = [];
    }

    this.input.keyboard.removeAllListeners();
}

}

function forceCreateHoneypot() {
    if (window.gameScene && window.gameScene.honeypot) {
        const playerX = window.gameScene.player.x;
        const testX = playerX + 200;
        const testY = window.gameScene.groundLevel;
        
        window.gameScene.honeypot.createInvisibleObstacle(testX, testY, 'manual_test');
        console.log(`🧪 Manual test honeypot created at x:${testX}`);
        
        setTimeout(() => {
            showHoneypotDebug();
        }, 100);
    }
}

window.forceCreateHoneypot = forceCreateHoneypot;

console.log(`
🔧 ===== HONEYPOT FIX APPLIED =====
... log mesajları ...
`);

// Step 1: Secure API Client - game_z.js'e eklenecek

class SecureAPIClient {
    constructor() {
        this.sessionSecret = null;
        this.apiBase = '/api/game';
        this.initializeSession();
    }

    // Session başlatma ve secret generation
    initializeSession() {
        // Session-specific secret oluştur
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const browserData = this.getBrowserFingerprint();
        
        // Combine session data for unique secret
        const sessionData = `${timestamp}-${random}-${browserData.userAgent.slice(0, 10)}`;
        this.sessionSecret = btoa(sessionData);
        
        console.log('🔐 Secure session initialized with secret');
    }

    // Browser fingerprint collection
    getBrowserFingerprint() {
        return {
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onlineStatus: navigator.onLine
        };
    }

    // Simple HMAC-like signing (browser-compatible)
    async createSignature(data, timestamp) {
        try {
            // Create payload to sign
            const payload = JSON.stringify(data) + ':' + timestamp + ':' + this.sessionSecret;
            
            // Use Web Crypto API if available
            if (window.crypto && window.crypto.subtle) {
                const encoder = new TextEncoder();
                const keyData = encoder.encode(this.sessionSecret);
                const messageData = encoder.encode(payload);
                
                const key = await crypto.subtle.importKey(
                    'raw', keyData,
                    { name: 'HMAC', hash: 'SHA-256' },
                    false, ['sign']
                );
                
                const signature = await crypto.subtle.sign('HMAC', key, messageData);
                return btoa(String.fromCharCode(...new Uint8Array(signature)));
            } else {
                // Fallback: Simple hash for older browsers
                return btoa(payload).replace(/[^a-zA-Z0-9]/g, '');
            }
        } catch (error) {
            console.error('🚨 Signature creation failed:', error);
            // Fallback signature
            return btoa(JSON.stringify(data) + timestamp).replace(/[^a-zA-Z0-9]/g, '');
        }
    }

    // Secure score submission
    async submitSecureScore(scoreData) {
        const timestamp = Date.now();
        
        // Add security metadata
        const secureData = {
            ...scoreData,
            timestamp: timestamp,
            browserFingerprint: this.getBrowserFingerprint(),
            sessionInfo: {
                secret: this.sessionSecret,
                startTime: Date.now() - (scoreData.playTime || 0)
            }
        };

        // Create signature
        const signature = await this.createSignature(secureData, timestamp);

        // Prepare request headers
        const headers = {
            'Content-Type': 'application/json',
            'X-Game-Signature': signature,
            'X-Game-Timestamp': timestamp.toString(),
            'X-Session-Secret': this.sessionSecret,
            'X-Request-ID': this.generateRequestId()
        };

        console.log('🔒 Submitting secure score with signature...');
        console.log('📊 Score:', scoreData.score, 'Coins:', scoreData.coins);

        try {
            const response = await fetch(`${this.apiBase}/score/secure-submit`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(secureData)
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('✅ Secure score submission successful:', responseData);
                return responseData;
            } else {
                console.error('❌ Secure score submission failed:', responseData);
                throw new Error(responseData.message || 'Submission failed');
            }
        } catch (error) {
            console.error('🚨 Network error during secure submission:', error);
            throw error;
        }
    }

    // Generate unique request ID
    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    }

    // Fallback to regular submission if secure fails
    async fallbackSubmission(scoreData) {
        console.log('⚠️ Using fallback submission method...');
        
        try {
            const response = await fetch(`${this.apiBase}/score/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scoreData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Fallback submission successful');
                return data;
            } else {
                throw new Error('Fallback submission also failed');
            }
        } catch (error) {
            console.error('❌ Both secure and fallback submissions failed:', error);
            throw error;
        }
    }
}

// Game'e integrate etmek için wrapper class
class SecureScoreManager {
    constructor() {
        this.secureClient = new SecureAPIClient();
        this.isInitialized = true;
        console.log('🛡️ Secure score manager initialized');
    }

    // Ana score submission method
    async submitGameScore(sessionId, score, coins, playTime) {
        const scoreData = {
            sessionId: sessionId,
            score: score,
            coins: coins,
            playTime: playTime,
            gameEndReason: 'collision', // veya başka sebep
            submissionTime: Date.now()
        };

        try {
            // Önce secure submission dene
            return await this.secureClient.submitSecureScore(scoreData);
        } catch (error) {
            console.warn('🔄 Secure submission failed, trying fallback...');
            try {
                return await this.secureClient.fallbackSubmission(scoreData);
            } catch (fallbackError) {
                console.error('💥 All submission methods failed:', fallbackError);
                throw fallbackError;
            }
        }
    }

    // Test method
    testSecuritySystem() {
        console.log('🧪 Testing security system...');
        console.log('Session secret length:', this.secureClient.sessionSecret?.length);
        console.log('Browser fingerprint:', this.secureClient.getBrowserFingerprint());
        console.log('✅ Security system test completed');
    }
}

// Global olarak kullanılabilir hale getir
window.SecureScoreManager = SecureScoreManager;

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
    window.secureScoreManager = new SecureScoreManager();
    console.log('🚀 Secure score manager ready for use');
}

// Global session sync verification
function verifySessionSync() {
    if (!window.gameScene) {
        console.log("❌ Game scene not found");
        return false;
    }
    
    const masterSession = window.gameScene.masterSessionId;
    const apiSession = window.gameScene.enhancedSecureAPIClient?.sessionId;
    const protectionSession = window.gameScene.unifiedProtection?.sessionId;
    const honeypotSession = window.gameScene.honeypot?.sessionId;
    
    console.log("🔍 SESSION SYNC CHECK:");
    console.log(`   Master:     ${masterSession}`);
    console.log(`   API Client: ${apiSession}`);
    console.log(`   Protection: ${protectionSession}`);
    console.log(`   Honeypot:   ${honeypotSession}`);
    
    const allSame = [apiSession, protectionSession, honeypotSession].every(id => id === masterSession);
    
    if (allSame) {
        console.log("✅ All sessions synchronized!");
        return true;
    } else {
        console.log("❌ Session mismatch detected!");
        return false;
    }
}



// Debug fonksiyonu
function debugSessionTiming() {
    console.log("🔍 FRONTEND SESSION DEBUG:");
    console.log("   masterGameStartTime:", window.masterGameStartTime);
    console.log("   masterSessionId:", window.gameScene?.masterSessionId);
    console.log("   current time:", Date.now());
    
    if (window.masterGameStartTime) {
        const gameTimeSeconds = Math.floor((Date.now() - window.masterGameStartTime) / 1000);
        console.log("   calculated game time:", gameTimeSeconds, "seconds");
        
        // Backend kontrol
        if (window.gameScene?.masterSessionId) {
            fetch(`http://localhost:5080/api/game/debug/session/${window.gameScene.masterSessionId}`)
                .then(r => r.json())
                .then(data => {
                    console.log("🔍 BACKEND SESSION DEBUG:");
                    console.log("   backend age seconds:", data.sessionAgeSeconds);
                    console.log("   time difference:", Math.abs(gameTimeSeconds - data.sessionAgeSeconds), "seconds");
                })
                .catch(e => console.log("❌ Backend debug failed:", e));
        }
    }
}

window.debugSessionTiming = debugSessionTiming;