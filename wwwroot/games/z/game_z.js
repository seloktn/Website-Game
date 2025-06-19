class BaseScene extends Phaser.Scene {
    handleResize(gameSize) {
        console.log(`=== RESIZE START: ${gameSize.width}x${gameSize.height} ===`);
        this.responsive = new ResponsiveManager(this);
        
        // yok et ve yeniden oluştur 
        if (this.backgroundLayers) {
            
            Object.values(this.backgroundLayers).forEach(layer => {
                if (layer && layer.destroy) {
                    layer.destroy();
                }
            });
            this.backgroundLayers = null;
            
            // yeniden oluştur
            if (this.setupBackground) {
                this.setupBackground();
            }
        }
        
        // gamescene için ground u güncelle
        if (this.groundLevel !== undefined) {
            const canvasHeight = this.sys.game.canvas.height;
            this.groundLevel = canvasHeight * 0.9;
            this.obstacleGroundLevel = canvasHeight * 0.95;
            this.physics.world.setBounds(0, -200, gameSize.width, this.groundLevel + 200);
        }
        
        // player güncelle
        if (this.player) {
            const canvasWidth = this.sys.game.canvas.width;
            const canvasHeight = this.sys.game.canvas.height;
            const playerX = canvasWidth * 0.15;
            const playerY = canvasHeight * 0.8;
            
            let baseScale;
            if (canvasWidth <= 480) {
                baseScale = 0.6;
            } else if (canvasWidth <= 768) {
                baseScale = 0.5;
            } else if (canvasWidth <= 1024) {
                baseScale = 0.4;
            } else if (canvasWidth <= 1440) {
                baseScale = 0.35;
            } else {
                baseScale = 0.3;
            }

            const newScale = this.responsive.scaleValue(baseScale);
            this.player.setScale(newScale);
            this.originalPlayerScale = newScale;
            
            if (this.player.body.blocked.down) {
                this.player.setPosition(playerX, playerY);
            }
        }
        
        // gamestart için ui güncelle
if (this.uiElements && this.uiElements.gameTitle) {
    this.uiElements.gameTitle.setPosition(
        gameSize.width / 2,
        gameSize.height / 2 - this.responsive.scaleValue(120)
    );
    this.uiElements.gameTitle.setFontSize(this.responsive.getFontSize(72));
    
    // player animasyonunu düzelt
    if (this.uiElements.playerPreview) {

        this.tweens.killTweensOf(this.uiElements.playerPreview);
        
        this.uiElements.playerPreview.setPosition(
            -150,
            gameSize.height - this.responsive.scaleValue(120)
        );
        this.uiElements.playerPreview.setScale(this.responsive.scaleValue(0.5));
        
        this.tweens.add({
            targets: this.uiElements.playerPreview,
            x: gameSize.width + 150,
            duration: 4000,
            ease: 'Power2.easeInOut'
        });
        
        this.tweens.add({
            targets: this.uiElements.playerPreview,
            y: this.uiElements.playerPreview.y - 10,
            duration: 300,
            ease: 'Power2',
            yoyo: true,
            repeat: 12
        });
    }
    
    this.uiElements.startButton.setPosition(
        gameSize.width / 2,
        gameSize.height / 2 + this.responsive.scaleValue(80)
    );
    this.uiElements.startButton.setScale(this.responsive.scaleValue(0.15));
}
        
        // gamescene için ui güncelle
        if (this.updateUIPositions) {
            this.updateUIPositions();
        }
        
        // touch control yeniden oluştur
        if (this.responsive.isMobile && this.touchControls) {
            this.touchControls.destroy();
            this.touchControls = new TouchControlManager(this);
        }
        
    }

    setupBackground() {
    console.log("=== BACKGROUND SETUP START ===");
    
    // var olan backgroundları yok et
    if (this.backgroundLayers) {
        Object.values(this.backgroundLayers).forEach(layer => {
            if (layer && layer.destroy) {
                layer.destroy();
            }
        });
        this.backgroundLayers = null;
    }
    
    const canvasWidth = this.sys.game.canvas.width;
    const canvasHeight = this.sys.game.canvas.height;
    
    console.log(`Creating backgrounds: ${canvasWidth}x${canvasHeight}`);
    
    // 3 layer oluştur
    this.backgroundLayers = {
        layer1: this.add.tileSprite(0, 0, canvasWidth, canvasHeight, 'layer1').setOrigin(0, 0),
        layer2: this.add.tileSprite(0, -this.responsive.scaleValue(80), canvasWidth, canvasHeight, 'layer2').setOrigin(0, 0),
        layer3: this.add.tileSprite(0, 0, canvasWidth, canvasHeight, 'layer3').setOrigin(0, 0)
    };

  
    this.scaleBackgroundLayer('layer1');
    this.scaleBackgroundLayer('layer2');
    this.scaleBackgroundLayer('layer3');

    this.backgroundLayers.layer1.setDepth(-6);
    this.backgroundLayers.layer2.setDepth(-5);
    this.backgroundLayers.layer3.setDepth(-4);
    
    console.log("=== BACKGROUND SETUP COMPLETE ===");
}

scaleBackgroundLayer(layerName) {
    const texture = this.textures.get(layerName);
    const layer = this.backgroundLayers[layerName];
    
    if (texture.source[0] && layer) {
        const imageWidth = texture.source[0].width;
        const imageHeight = texture.source[0].height;
        const canvasWidth = this.sys.game.canvas.width;
        const canvasHeight = this.sys.game.canvas.height;
        
        const scaleX = canvasWidth / imageWidth;
        const scaleY = canvasHeight / imageHeight;
        const scale = Math.min(scaleX, scaleY);
        
        layer.setTileScale(scale, scale);
    }
}

}

class GameStartScene extends BaseScene  {
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
     
    this.recommendedImages = [];

fetch('/api/product/recommendedImages')
  .then(res => res.json())
  .then(images => {
    this.recommendedImages = images;
  });

    // RESPONSIVE SETUP
    this.responsive = new ResponsiveManager(this);
    this.scale.on('resize', this.handleResize, this);

    this.setupBackground(); 

    this.gameStarting = false;

        const gameTitle = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2 - this.responsive.scaleValue(120), 
            'OYUN ADI', 
            {
                fontSize: this.responsive.getFontSize(72) + 'px',
                fontFamily: 'monospace',
                fill: '#87937f',
                stroke: '#1b1628',
                strokeThickness: this.responsive.scaleValue(6),
                fontStyle: 'bold'
            }
        );
        gameTitle.setOrigin(0.5);
        gameTitle.setDepth(100);
        gameTitle.setAlpha(0);

        const playerPreview = this.add.sprite(-100, this.scale.height - this.responsive.scaleValue(120), 'player');
        playerPreview.setScale(this.responsive.scaleValue(0.5));
        playerPreview.setDepth(100);

        const startButton = this.add.image(
            this.scale.width / 2, 
            this.scale.height / 2 + this.responsive.scaleValue(80), 
            'oyna'
        );
        startButton.setScale(this.responsive.scaleValue(0.15));
        startButton.setInteractive();
        startButton.setDepth(100);
        startButton.setAlpha(0);

        // resize için sakla
        this.uiElements = {
            gameTitle,
            playerPreview,
            startButton
        };

        // resize için animasyonları sakla
    this.playerAnimation = this.tweens.add({
    targets: playerPreview,
    x: this.scale.width + 100,
    duration: 4000,
    ease: 'Power2.easeInOut',
    delay: 500
});

        this.tweens.add({
            targets: playerPreview,
            y: playerPreview.y - 10,
            duration: 300,
            ease: 'Power2',
            yoyo: true,
            repeat: 12,
            delay: 500
        });

        this.tweens.add({
            targets: gameTitle,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: 'Power2.easeOut',
            delay: 1000
        });

        this.tweens.add({
            targets: startButton,
            alpha: 1,
            scaleX: this.responsive.scaleValue(0.15),
            scaleY: this.responsive.scaleValue(0.15),
            duration: 500,
            ease: 'Back.easeOut',
            delay: 1800
        });

        this.time.delayedCall(2500, () => {
            this.tweens.add({
                targets: gameTitle,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 2000,
                ease: 'Power2',
                yoyo: true,
                repeat: -1
            });
        });

        // buton interaksiyonları 
        startButton.on('pointerdown', () => {
            this.startGame();
        });

        startButton.on('pointerover', () => {
            startButton.setScale(this.responsive.scaleValue(0.18));
            startButton.setTint(0xdddddd); 
        });
        
        startButton.on('pointerout', () => {
            startButton.setScale(this.responsive.scaleValue(0.15));
            startButton.clearTint(); 
        });

        // klavye kontrol
        this.input.keyboard.on('keydown-SPACE', () => {
            this.time.delayedCall(100, () => {
                if (gameTitle.alpha > 0.8) {
                    this.startGame();
                }
            });
        });

        this.input.keyboard.on('keydown-UP', () => {
            this.time.delayedCall(100, () => {
                if (gameTitle.alpha > 0.8) {
                    this.startGame();
                }
            });
        });

        this.backgroundScrollSpeed = this.responsive.scaleValue(0.5);
        this.buttonSound = this.sound.add('buttonClick');
    }


    update(time, delta) {
        const deltaSeconds = delta / 1000;
        const scrollSpeedPerSecond = this.backgroundScrollSpeed * 60;
        
        this.backgroundLayers.layer1.tilePositionX += scrollSpeedPerSecond * 0.05 * deltaSeconds;
        this.backgroundLayers.layer2.tilePositionX += scrollSpeedPerSecond * 0.2 * deltaSeconds;
        this.backgroundLayers.layer3.tilePositionX += scrollSpeedPerSecond * 0.6 * deltaSeconds;
    }

    startGame() {
    if (this.gameStarting) return;
    this.gameStarting = true;

    this.buttonSound.play();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', { images: this.recommendedImages });
    });
}

}

class GameScene extends BaseScene  {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
    this.recommendedImages = data.images || [];
    this.loadedImageKeys = new Set();
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

        this.load.audio('backgroundMusic', 'assets_z/sounds/backgroundMusic.mp3');
        this.load.audio('buttonClick', 'assets_z/sounds/buttonClick.mp3');
        this.load.audio('coinSound', 'assets_z/sounds/coin.mp3');
        this.load.audio('gameOverSound', 'assets_z/sounds/gameover.mp3');
        this.load.audio('jumpSound', 'assets_z/sounds/jump.mp3');
        this.load.audio('winSound', 'assets_z/sounds/win.mp3');
        this.load.audio('damageSound', 'assets_z/sounds/damage.mp3');
    }

    create() {
        console.log("GameScene create() started");  
         // responsive setup
        this.responsive = new ResponsiveManager(this);
      
        if (this.responsive.isMobile) {
            this.touchControls = new TouchControlManager(this);
        }
        this.scale.on('resize', this.handleResize, this);

        this.setupConstants();         
        this.setupState();
        this.setupBackground();        
        this.setupGround();            
        this.setupPlayer();     
        
        this.physics.world.setBounds(0, -200, this.scale.width, this.groundLevel + 200);
        this.player.setCollideWorldBounds(true);
        
        this.setupInput();             
        this.setupObstacleTypes();     
        this.setupObstacles();
        this.increaseDifficulty();     
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
    }

    update(time, delta) {
        if (!this.CONFIG.gameOver) {
            this.scrollBackground(delta);       
            this.handlePlayerJump();       
            this.handlePlayerLanding();    
            this.moveObstacles(delta);
            this.moveCoins(delta);
        
            const deltaSeconds = delta / 1000;
            this.distanceCounter += this.CONFIG.scrollSpeed * this.distanceMultiplier * deltaSeconds * 60;
            if (this.distanceCounter >= 1) {
                this.state.distance += Math.floor(this.distanceCounter);
                this.distanceCounter = this.distanceCounter % 1;
                this.distanceText.setText(this.state.distance + ' M');
            }
        }

        this.cleanupObstacles();
        this.cleanupCoins();  
        
        if (this.player && this.player.body.blocked.down) {
            if (!this.playerGroundLogged) {
               
                this.playerGroundLogged = true;
            }
        } else {
            this.playerGroundLogged = false;
        }
    }

    setupConstants() {
    this.CONFIG = {
        scrollSpeed: this.responsive.isMobile ? 9 : 12, 
        jumpForce: this.responsive.isMobile ? 750 : 990,
        gameOver: false
    };
    
    
}

    setupState() {
        this.state = {
            score: 0,
            distance: 0
        };
        this.isMuted = false;
        this.distanceCounter = 0;
        this.distanceMultiplier = 0.1;
    }



    setupGround() {
    const canvasHeight = this.sys.game.canvas.height;
    
    this.groundLevel = canvasHeight * 0.9;
    this.groundSurface = this.groundLevel;
    this.obstacleGroundLevel = canvasHeight * 0.95;
    
    console.log(`Ground: canvas=${canvasHeight}, ground=${this.groundLevel}, obstacle=${this.obstacleGroundLevel}`);
}


setupPlayer() {
    const canvasWidth = this.sys.game.canvas.width;
    const canvasHeight = this.sys.game.canvas.height;
    
    const playerX = canvasWidth * 0.15;
    const playerY = canvasHeight * 0.8;
    
    // boyutlara göre smart scaling
    let baseScale;
    if (canvasWidth <= 480) {
        baseScale = 0.6;      // çok küçük ekran / eski tel
    } else if (canvasWidth <= 768) {
        baseScale = 0.5;      // küçük ekran / tel
    } else if (canvasWidth <= 1024) {
        baseScale = 0.4;      // orta ekran / tablet
    } else if (canvasWidth <= 1440) { 
        baseScale = 0.35;     // büyük ekran / laptop
    } else {
        baseScale = 0.3;      // çok büyük ekran / masaüstü
    }
    
    const playerScale = this.responsive.scaleValue(baseScale);
    
    this.player = this.physics.add.sprite(playerX, playerY, 'player');
    this.player.setScale(playerScale);
    
    this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.8);
    this.player.body.setOffset(this.player.width * 0.15, this.player.height * 0.1);
    
    this.player.wasOnGround = true;
    this.originalPlayerScale = playerScale;
    this.player.isDucking = false;
    this.player.normalTexture = 'player';
    this.player.duckTexture = 'playerDuck';
    
    console.log(`Player: position=(${playerX}, ${playerY}), scale=${playerScale}, screen=${canvasWidth}x${canvasHeight}`);
}

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursors.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        // KISAYOL VICTORY BUNU SONRA SİL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        this.input.keyboard.on('keydown-V', () => {
            if (!this.CONFIG.gameOver) {
                this.triggerVictory();
            }
        });
    }

    setupObstacleTypes() {
        this.obstacleTypes = {
            cone: { type: 'ground', scale: 0.4, weight: 3, minGap: 120, name: 'Construction Cone' },
            cart: { type: 'ground', scale: 0.3, weight: 2, minGap: 140, name: 'Street Vendor Cart' },
            cart2: { type: 'ground', scale: 0.35, weight: 2, minGap: 140, name: 'Food Cart' },
            cat: { type: 'ground', scale: 0.15, weight: 1, minGap: 100, name: 'Sleeping Cat' },
            old: { type: 'ground', scale: 0.18, weight: 2, minGap: 130, name: 'Old Person' },
            pigeon: { type: 'sky', scale: 0.3, weight: 2, minGap: 150, name: 'Flying Pigeon' }
        };
    }

    setupObstacles() {
        this.groundObstacles = this.add.group();
        this.skyObstacles = this.add.group();
        this.lastSpawnedObstacles = []; // son oluşan engelli takip et

        this.physics.add.overlap(this.player, this.groundObstacles, this.handleObstacleCollision, null, this);
        this.physics.add.overlap(this.player, this.skyObstacles, this.handleObstacleCollision, null, this);
    
        const obstacleDelay = this.responsive.isMobile ? 2000 : 1500;
        
        this.obstacleTimer = this.time.addEvent({
    delay: obstacleDelay, 
    callback: () => {
        this.spawnRandomObstacle();
    
        const currentDelay = this.obstacleTimer.delay;
        const variation = Math.min(300, currentDelay * 0.3); // Max %30 varyasyon
        const randomDelay = Phaser.Math.Between(
            Math.max(200, currentDelay - variation), 
            currentDelay + variation
        );
        this.obstacleTimer.delay = randomDelay;
        
    },
    callbackScope: this,
    loop: true
});
        

    }

    scrollBackground(delta) {
        const deltaSeconds = delta / 1000;
        const baseSpeedPerSecond = this.CONFIG.scrollSpeed * 60; 
        
        this.backgroundLayers.layer1.tilePositionX += baseSpeedPerSecond * 0.05 * deltaSeconds;
        this.backgroundLayers.layer2.tilePositionX += baseSpeedPerSecond * 0.2 * deltaSeconds;
        this.backgroundLayers.layer3.tilePositionX += baseSpeedPerSecond * 0.45 * deltaSeconds;
    }

    handlePlayerJump() {
        const isUpPressed = this.cursors.up.isDown || this.cursors.space.isDown;
        const isDownPressed = this.cursors.down.isDown;
    
        if (isUpPressed && this.player.body.blocked.down && !this.player.isDucking) {
            this.player.setVelocityY(-this.CONFIG.jumpForce);
            if (!this.isMuted) this.sounds.jump.play();
            
            this.tweens.add({
                targets: this.player,
                rotation: 0.2,
                duration: 300,
                ease: 'Power2'
            });
        }

        if (isDownPressed && this.player.body.blocked.down && !this.player.isDucking) {
            this.startDucking();
        } else if (!isDownPressed && this.player.isDucking && this.player.body.blocked.down) {
            this.stopDucking();
        }
    }

    startDucking() {
        if (this.player.isDucking) return;
    
        this.player.isDucking = true;
    
        this.player.setTexture(this.player.duckTexture);
        
        this.tweens.add({
            targets: this.player,
            scaleY: this.player.scaleY * 0.9,
            duration: 120,
            ease: 'Power2.easeOut'
        });
        
        this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.5);
        this.player.body.setOffset(this.player.width * 0.15, this.player.height * 0.4);
        
        
    }

    stopDucking() {
        if (!this.player.isDucking) return;
        
        this.player.isDucking = false;
        
        this.player.setTexture(this.player.normalTexture);
    
        this.tweens.add({
            targets: this.player,
            scaleY: this.originalPlayerScale,
            duration: 120,
            ease: 'Power2.easeOut'
        });
 
        this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.8);
        this.player.body.setOffset(this.player.width * 0.15, this.player.height * 0.1);
        
        
    }

    handlePlayerLanding() {
        if (this.CONFIG.gameOver) return;
        
        const isGrounded = this.player.body.blocked.down;
        const justLanded = isGrounded && !this.player.wasOnGround;

        const velocityThreshold = this.responsive.isMobile ? 200 : 150;
if (justLanded && this.player.lastVelocityY > velocityThreshold) {
            this.player.rotation = 0;
            
            if (!this.player.isDucking) {
                this.tweens.add({
                    targets: this.player,
                    scaleY: this.originalPlayerScale * 0.95,
                    duration: 50,
                    ease: 'Power2',
                    yoyo: true,
                    onComplete: () => {
                        if (!this.player.isDucking) {
                            this.player.setScale(this.originalPlayerScale, this.originalPlayerScale);
                        }
                    }
                });
            }
        }
        
        this.player.lastVelocityY = this.player.body.velocity.y;
        this.player.wasOnGround = isGrounded;
    }

    getRandomObstacleType(obstacleGroup) {
        const availableTypes = Object.keys(this.obstacleTypes).filter(key => {
            const obstacleData = this.obstacleTypes[key];
            
            if (obstacleData.type !== obstacleGroup) return false;
            
            if (obstacleData.type === 'sky' && obstacleData.minSpeed && this.CONFIG.scrollSpeed < obstacleData.minSpeed) {
                return false;
            }
            
            return true;
        });
        
        if (availableTypes.length === 0) return null;
        
        const weights = availableTypes.map(type => this.obstacleTypes[type].weight);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < availableTypes.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return availableTypes[i];
            }
        }
        
        return availableTypes[0];
    }

   spawnRandomObstacle() {
    if (this.CONFIG.gameOver) return;

    const spawnX = this.scale.width + 50;
    
    // son spawndan sonra yeterince zaman geçti mi
const currentTime = this.time.now;
const minSpawnInterval = this.responsive.isMobile ? 1000 : 800; // iki spawn arası 

if (!this.lastSpawnTime) {
    this.lastSpawnTime = 0; 
}

if (currentTime - this.lastSpawnTime < minSpawnInterval) {
    console.log(`Skipping spawn - too soon (${(currentTime - this.lastSpawnTime).toFixed(0)}ms ago, need ${minSpawnInterval}ms)`);
    return;
}
    
    const skyObstacleChance = 0.4;
    const spawnSkyObstacle = Math.random() < skyObstacleChance;
    
    const obstacleGroup = spawnSkyObstacle ? 'sky' : 'ground';
    let obstacleType = this.getRandomObstacleType(obstacleGroup);
    
    // art arda aynı engel oluşmasını engelle
    if (obstacleType && this.lastSpawnedObstacles.length >= 1) {
        const lastObstacle = this.lastSpawnedObstacles[this.lastSpawnedObstacles.length - 1];
        
        // son engel aynı tipse farklı tip engel seç
        if (lastObstacle === obstacleType) {
            
            
            // farklı grup olması için zorla
            const oppositeGroup = obstacleGroup === 'sky' ? 'ground' : 'sky';
            const alternativeType = this.getRandomObstacleType(oppositeGroup);
            
            if (alternativeType) {
                obstacleType = alternativeType;
                
            }
        }
    }
    
    if (!obstacleType) {
        const groundType = this.getRandomObstacleType('ground');
        if (groundType) {
            obstacleType = groundType;
        }
    }
    
    if (obstacleType) {
        this.spawnObstacle(obstacleType, spawnX);
        
        // engelleri sakla (son 2)
        this.lastSpawnedObstacles.push(obstacleType);
        if (this.lastSpawnedObstacles.length > 2) {
            this.lastSpawnedObstacles.shift();
        }

        this.lastSpawnTime = this.time.now;
        
    }
}

    spawnObstacle(obstacleType, x) {
        const obstacleData = this.obstacleTypes[obstacleType];
        
        if (obstacleData.type === 'ground') {
            this.spawnGroundObstacle(obstacleType, obstacleData, x);
        } else if (obstacleData.type === 'sky') {
            this.spawnSkyObstacle(obstacleType, obstacleData, x);
        }
    }

    spawnGroundObstacle(obstacleType, obstacleData, x) {
        const obstacle = this.physics.add.sprite(x, 100, obstacleType);
        // engelleri mobilde daha büyük yap
        const scaleFactor = this.responsive.isMobile ? 1.2 : 1.0;
        obstacle.setScale(this.responsive.scaleValue(obstacleData.scale * scaleFactor));
        obstacle.setOrigin(0.5, 1);
  
        if (obstacleType === 'cat') {
            obstacle.y = this.obstacleGroundLevel - this.responsive.scaleValue(30); 
        } else {
            obstacle.y = this.obstacleGroundLevel; 
        }
        obstacle.body.allowGravity = false;
        obstacle.setImmovable(true);
        obstacle.setData('obstacleType', obstacleType);
        obstacle.setData('obstacleGroup', 'ground');
        obstacle.setDepth(5);


        this.groundObstacles.add(obstacle);
    }

    spawnSkyObstacle(obstacleType, obstacleData, x) {
        const skyY = this.groundSurface - this.responsive.scaleValue(
    this.responsive.isMobile ? 140 : 120
);
        const obstacle = this.physics.add.sprite(x, skyY, obstacleType);
        obstacle.setScale(this.responsive.scaleValue(obstacleData.scale)); 
        obstacle.setOrigin(0.5, 0.5);
        obstacle.body.allowGravity = false;
        obstacle.setImmovable(true);
        obstacle.setData('obstacleType', obstacleType);
        obstacle.setData('obstacleGroup', 'sky');
        obstacle.setDepth(3);
 
        this.tweens.add({
            targets: obstacle,
            y: skyY + Phaser.Math.Between(-4, 4),
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    
    
        this.skyObstacles.add(obstacle);
    }

    handleObstacleCollision(player, obstacle) {
        if (this.CONFIG.gameOver) return;
        
        this.CONFIG.gameOver = true;
        this.physics.pause();
        
        this.player.setTexture('player2');
        this.player.setVelocity(0, 0);
        if (!this.isMuted) this.sounds.gameOver.play();
        
        const obstacleType = obstacle.getData('obstacleType');
        const obstacleGroup = obstacle.getData('obstacleGroup');
        console.log(`Game Over! Hit by ${obstacleGroup} obstacle: ${obstacleType}`);
        
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', {
                score: this.state.score,
                distance: this.state.distance,
                isMuted: this.isMuted
            });
        });
    }

    moveObstacles(delta) {
        const deltaSeconds = delta / 1000;
        const moveSpeedPerSecond = this.CONFIG.scrollSpeed * 60;
        
        this.groundObstacles.children.iterate(obstacle => {
            if (obstacle) {
                obstacle.x -= moveSpeedPerSecond * deltaSeconds;
            }
        });
        
        this.skyObstacles.children.iterate(obstacle => {
            if (obstacle) {
                obstacle.x -= moveSpeedPerSecond * deltaSeconds;
            }
        });
    }

    cleanupObstacles() {
        this.groundObstacles.children.iterate(obstacle => {
            if (obstacle && obstacle.x < -100) {
                obstacle.destroy();
            }
        });
        
        this.skyObstacles.children.iterate(obstacle => {
            if (obstacle && obstacle.x < -100) {
                this.tweens.killTweensOf(obstacle);
                obstacle.destroy();
            }
        });
    }

    increaseDifficulty() {
    // zorluk ayarla
    this.difficultySystem = {
        baseSpeed: this.responsive.isMobile ? 9 : 12,
        currentLevel: 1,
        lastLevelUp: 0,
       
    };
    

    this.difficultyTimer = this.time.addEvent({
        delay: 2000, 
        callback: () => this.updateDynamicDifficulty(),
        loop: true
    });
    
}

    setupCoins() {
        this.coins = this.add.group();
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

        this.time.addEvent({
            delay: 3000,
            callback: this.spawnCoin,
            callbackScope: this,
            loop: true
        });
    }

    spawnCoin() {
    if (this.CONFIG.gameOver) return;
    if (!this.recommendedImages || this.recommendedImages.length === 0) return;

    const minJumpHeight = this.responsive.scaleValue(40);
    const maxJumpHeight = this.responsive.scaleValue(180);
    const coinY = Phaser.Math.Between(
        this.groundSurface - maxJumpHeight, 
        this.groundSurface - minJumpHeight
    );

    const x = this.scale.width + 50;

    let imageUrl = Phaser.Utils.Array.GetRandom(this.recommendedImages);
    let imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));

    const spawn = () => {
        const coin = this.physics.add.sprite(x, coinY, imageName);
        coin.setOrigin(0.5, 0.5);
        coin.setScale(this.responsive.scaleValue(0.1)); 
        coin.body.allowGravity = false;
        this.coins.add(coin);
    };

    if (!this.textures.exists(imageName) && !this.loadedImageKeys.has(imageName)) {
        this.load.image(imageName, imageUrl);
        this.loadedImageKeys.add(imageName);

        this.load.once('filecomplete-image-' + imageName, () => {
            spawn();
        });

        this.load.start();
    } else {
        spawn();
    }
}


    collectCoin(player, coin) {
        coin.destroy();
        this.state.score += 10;
        if (!this.isMuted) this.sounds.coin.play();
        this.scoreText.setText(this.state.score);

        // 30 coinde victory
        if (this.state.score >= 300) {
            this.triggerVictory();
        }
    }

    moveCoins(delta) {
        const deltaSeconds = delta / 1000;
        const moveSpeedPerSecond = this.CONFIG.scrollSpeed * 60; 
        
        this.coins.children.iterate(coin => {
            if (coin) {
                coin.x -= moveSpeedPerSecond * deltaSeconds;
            }
        });
    }

    cleanupCoins() {
        this.coins.children.iterate(coin => {
            if (coin && coin.x < -50) {
                coin.destroy();
            }
        });
    }

    triggerVictory() {
        this.CONFIG.gameOver = true;
        this.physics.pause();
        
        if (!this.isMuted) this.sounds.win.play();
        
        this.time.delayedCall(1000, () => {
            this.scene.start('VictoryScene', {
                score: this.state.score,
                distance: this.state.distance,
                isMuted: this.isMuted
            });
        });
    }

    createUI() {
        const safeArea = this.responsive.getSafeArea();
        
        // score panel
        const scorePanel = this.add.image(
            safeArea.left + this.responsive.scaleValue(80),
            safeArea.top + this.responsive.scaleValue(40),
            'scorePanel'
        );
        scorePanel.setScale(this.responsive.scaleValue(0.18));
        scorePanel.setScrollFactor(0);
        scorePanel.setDepth(1000);

        // score text
        this.scoreText = this.add.text(
            scorePanel.x + this.responsive.scaleValue(30),
            scorePanel.y, 
            this.state.score.toString(), 
            {
                fontSize: this.responsive.getFontSize(15) + 'px',
                fontFamily: 'monospace',
                fill: '#fffacd',
                stroke: '#888875',
                strokeThickness: this.responsive.scaleValue(3)
            }
        );
        this.scoreText.setOrigin(0.5);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1001);

        // distance text
        this.distanceText = this.add.text(
            safeArea.right - this.responsive.scaleValue(100),
            safeArea.top + this.responsive.scaleValue(50),
            '0 M', 
            {
                fontSize: this.responsive.getFontSize(22) + 'px',
                fontFamily: 'monospace',
                fill: '#2D2D2D',
                stroke: '#3c4a3c',
                strokeThickness: this.responsive.scaleValue(2),
                fontStyle: 'bold'
            }
        );
        this.distanceText.setOrigin(0.5);
        this.distanceText.setScrollFactor(0);
        this.distanceText.setDepth(1001);

        // ses butonu
        this.soundToggleButton = this.add.image(
            safeArea.right - this.responsive.scaleValue(50),
            safeArea.top + this.responsive.scaleValue(90),
            'soundOn'
        );
        this.soundToggleButton.setScale(this.responsive.scaleValue(this.responsive.isMobile ? 0.15 : 0.1));
        this.soundToggleButton.setScrollFactor(0);
        this.soundToggleButton.setDepth(1001);
        this.soundToggleButton.setInteractive();

        // ses click
        this.soundToggleButton.on('pointerdown', () => {
            if (!this.isMuted) this.sounds.button.play();
            this.isMuted = !this.isMuted;
            this.sound.mute = this.isMuted;
            this.soundToggleButton.setTexture(this.isMuted ? 'soundOff' : 'soundOn');
        });

        // ui elementlerini resize için sakla
        this.uiElements = {
            scorePanel: scorePanel,
            scoreText: this.scoreText,
            distanceText: this.distanceText,
            soundButton: this.soundToggleButton
        };

        // gerekirse mobile özel ui ekle 
        if (this.responsive.isMobile) {
            this.addMobileUIEnhancements();
        }
    }

    addMobileUIEnhancements() {
        const safeArea = this.responsive.getSafeArea();
        
        
    }

    updateUIPositions() {
        if (!this.uiElements) return;
        
        const safeArea = this.responsive.getSafeArea();
        
        // score panel güncelle
        this.uiElements.scorePanel.setPosition(
            safeArea.left + this.responsive.scaleValue(80),
            safeArea.top + this.responsive.scaleValue(40)
        );
        this.uiElements.scorePanel.setScale(this.responsive.scaleValue(0.18));
        
        // score text güncelle
        this.uiElements.scoreText.setPosition(
            this.uiElements.scorePanel.x + this.responsive.scaleValue(30),
            this.uiElements.scorePanel.y
        );
        this.uiElements.scoreText.setFontSize(this.responsive.getFontSize(15));
        this.uiElements.scoreText.setStroke('#888875', this.responsive.scaleValue(3));
        
        // distance text güncelle
        this.uiElements.distanceText.setPosition(
            safeArea.right - this.responsive.scaleValue(100),
            safeArea.top + this.responsive.scaleValue(50)
        );
        this.uiElements.distanceText.setFontSize(this.responsive.getFontSize(21));
        this.uiElements.distanceText.setStroke('#3c4a3c', this.responsive.scaleValue(3));
        
        // ses buton güncelle
        this.uiElements.soundButton.setPosition(
            safeArea.right - this.responsive.scaleValue(50),
            safeArea.top + this.responsive.scaleValue(90)
        );
        this.uiElements.soundButton.setScale(
            this.responsive.scaleValue(this.responsive.isMobile ? 0.15 : 0.1)
        );
        
        // mobil elementleri güncelle
        if (this.uiElements.scoreBg) {
            this.uiElements.scoreBg.setPosition(
                this.uiElements.scorePanel.x,
                this.uiElements.scorePanel.y
            );
            this.uiElements.scoreBg.setSize(
                this.responsive.scaleValue(120),
                this.responsive.scaleValue(40)
            );
        }
    }


 updateDynamicDifficulty() {
    if (this.CONFIG.gameOver) return;
    
    const score = this.state.score;
    
    // 2 coinde level artar
    const newLevel = Math.floor(score / 20) + 1;
    
    // level düşmez sadece artar
    if (newLevel > this.difficultySystem.currentLevel) {
        this.levelUp(newLevel);
    }
}



levelUp(newLevel) {
    const oldLevel = this.difficultySystem.currentLevel;
    this.difficultySystem.currentLevel = newLevel;
    this.difficultySystem.lastLevelUp = this.time.now;
    
    // yeni hızı hesapla
    const speedIncrease = (newLevel - 1) * 0.5;
    this.CONFIG.scrollSpeed = this.difficultySystem.baseSpeed + speedIncrease;
    
    // sınır hız
    this.CONFIG.scrollSpeed = Math.min(this.CONFIG.scrollSpeed, 18);
    
    // rate güncelle
    this.updateObstacleSpawnRate(newLevel);
    
    
    console.log(`🔥 LEVEL UP! ${oldLevel} → ${newLevel} | Speed: ${this.CONFIG.scrollSpeed.toFixed(1)} | Distance: ${this.state.distance}m | Score: ${this.state.score}`);
}

updateObstacleSpawnRate(level) {
    if (!this.obstacleTimer) return;
    
    // zorluk artar
    const baseDelay = this.responsive.isMobile ? 1500 : 1200;
    const reduction = (level - 1) * 200;
    const minDelay = this.responsive.isMobile ? 600 : 400;
    
    const newDelay = Math.max(minDelay, baseDelay - reduction);
    this.obstacleTimer.delay = newDelay;
    
    console.log(`⚡ Level ${level}: Spawn delay ${newDelay}ms (was ${baseDelay}ms)`);
}


}

class GameOverScene extends BaseScene  {
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
        
        this.responsive = new ResponsiveManager(this);
        this.scale.on('resize', this.handleResize, this);

        const blackScreen = this.add.rectangle(
            this.scale.width / 2, 
            this.scale.height / 2, 
            this.scale.width, 
            this.scale.height, 
            0x000000
        );
        blackScreen.setDepth(1000);
        
        this.tweens.add({
            targets: blackScreen,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => blackScreen.destroy()
        });

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
        gameOverImage.setScale(this.responsive.scaleValue(0.1));
        gameOverImage.setAlpha(0); 
        
        this.tweens.add({
            targets: gameOverImage,
            y: this.scale.height / 2 - this.responsive.scaleValue(100),
            scaleX: this.responsive.scaleValue(0.4),
            scaleY: this.responsive.scaleValue(0.4),
            alpha: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 200,
            onComplete: () => {
                this.tweens.add({
                    targets: gameOverImage,
                    y: gameOverImage.y - 4,
                    duration: 2000,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
                
                this.tweens.add({
                    targets: gameOverImage,
                    scaleX: this.responsive.scaleValue(0.41),
                    scaleY: this.responsive.scaleValue(0.41),
                    duration: 1800,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
            }
        });
        
      
        const distanceText = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2 + this.responsive.scaleValue(60),
            `${this.finalDistance} M`, 
            {
                fontSize: this.responsive.getFontSize(24) + 'px',
                fontFamily: 'monospace',
                fill: '#87937f',
                stroke: '#1b1628',
                strokeThickness: this.responsive.scaleValue(3),
                fontStyle: 'bold'
            }
        );
        distanceText.setOrigin(0.5);
        distanceText.setDepth(100);
        distanceText.setAlpha(0);
        distanceText.setScale(0.8);
        
        this.tweens.add({
            targets: distanceText,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut',
            delay: 1000
        });

        
        const restartButton = this.add.image(
            this.scale.width / 2, 
            this.scale.height + 160, 
            'tekraroyna'
        );
        restartButton.setScale(this.responsive.scaleValue(0.1));
        restartButton.setInteractive();
        restartButton.setDepth(100);
        restartButton.setAlpha(0);

        this.tweens.add({
            targets: restartButton,
            y: this.scale.height / 2 + this.responsive.scaleValue(140),
            scaleX: this.responsive.scaleValue(0.25),
            scaleY: this.responsive.scaleValue(0.25),
            alpha: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 1200
        });

        this.tweens.add({
            targets: restartButton,
            scaleX: this.responsive.scaleValue(0.28),
            scaleY: this.responsive.scaleValue(0.28),
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: 1800
        });

        this.tweens.add({
            targets: restartButton,
            alpha: 0.8,
            duration: 1200,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: 1800
        });

        
        restartButton.on('pointerover', () => {
            this.tweens.killTweensOf(restartButton);
            
            this.tweens.add({
                targets: restartButton,
                scaleX: this.responsive.scaleValue(0.28),
                scaleY: this.responsive.scaleValue(0.28),
                alpha: 1,
                duration: 200,
                ease: 'Power2.easeOut'
            });
        });
        
        restartButton.on('pointerout', () => {
            this.tweens.killTweensOf(restartButton);
            
            this.tweens.add({
                targets: restartButton,
                scaleX: this.responsive.scaleValue(0.25),
                scaleY: this.responsive.scaleValue(0.25),
                alpha: 1,
                duration: 300,
                ease: 'Back.easeOut'
            });
            
            this.tweens.add({
                targets: restartButton,
                scaleX: this.responsive.scaleValue(0.28),
                scaleY: this.responsive.scaleValue(0.28),
                duration: 800,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: 300
            });
        });

        restartButton.on('pointerdown', () => {
            this.tweens.killTweensOf(restartButton);
            
            this.tweens.add({
                targets: restartButton,
                scaleX: this.responsive.scaleValue(0.3),
                scaleY: this.responsive.scaleValue(0.3),
                duration: 100,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    this.tweens.add({
                        targets: restartButton,
                        scaleX: this.responsive.scaleValue(0.5),
                        scaleY: this.responsive.scaleValue(0.5),
                        alpha: 0,
                        duration: 300,
                        ease: 'Power2.easeIn'
                    });
                }
            });
            
            this.time.delayedCall(100, () => {
                this.restartGame();
            });
        });

    
        this.uiElements = {
            gameOverImage,
            distanceText,
            restartButton,
            overlay
        };

      
        this.input.keyboard.on('keydown-SPACE', () => {
            this.restartGame();
        });

        this.input.keyboard.on('keydown-UP', () => {
            this.restartGame();
        });
    }


    restartGame() {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop('GameOverScene');
            this.scene.start('GameScene');
        });
    }
}

class VictoryScene extends BaseScene  {
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
    }

    create() {
        
        this.responsive = new ResponsiveManager(this);
        this.scale.on('resize', this.handleResize, this);

        const blackScreen = this.add.rectangle(
            this.scale.width / 2, 
            this.scale.height / 2, 
            this.scale.width, 
            this.scale.height, 
            0x000000
        );
        blackScreen.setDepth(1000);
        
        this.tweens.add({
            targets: blackScreen,
            alpha: 0,
            duration: 800,
            ease: 'Power2.easeOut',
            onComplete: () => blackScreen.destroy()
        });

        const gradientBg = this.add.rectangle(
            this.scale.width / 2, 
            this.scale.height / 2, 
            this.scale.width, 
            this.scale.height, 
            0x1a0033,
            0.9
        );
        gradientBg.setDepth(0);

        this.tweens.add({
            targets: gradientBg,
            alpha: 0.7,
            duration: 3000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        const victoryPlayer = this.add.sprite(
            -150, 
            this.scale.height - this.responsive.scaleValue(120), 
            'player'
        );
        victoryPlayer.setScale(this.responsive.scaleValue(0.6));
        victoryPlayer.setDepth(200);
        
        const playerTrail = this.add.particles(0, 0, 'coin', {
            scale: { start: this.responsive.scaleValue(0.2), end: 0 },
            speed: { min: 50, max: 100 },
            lifespan: 600,
            alpha: { start: 0.8, end: 0 },
            tint: [0xffd700, 0xffaa00, 0xff6600],
            frequency: this.responsive.isMobile ? 120 : 80
        });
        playerTrail.setDepth(150);

    
        const victoryImage = this.add.image(
            this.scale.width / 2, 
            this.scale.height / 2 - this.responsive.scaleValue(50),
            'victoryImage'
        );
        victoryImage.setOrigin(0.5);
        victoryImage.setDepth(100);
        victoryImage.setScale(0);
        victoryImage.setAlpha(0);

    
        const scoreDisplay = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + this.responsive.scaleValue(80),
            `SCORE: ${this.finalScore}`,
            {
                fontSize: this.responsive.getFontSize(32) + 'px',
                fontFamily: 'monospace',
                fill: '#ffd700',
                stroke: '#000000',
                strokeThickness: this.responsive.scaleValue(4),
                fontStyle: 'bold'
            }
        );
        scoreDisplay.setOrigin(0.5);
        scoreDisplay.setDepth(100);
        scoreDisplay.setAlpha(0);

        const distanceDisplay = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + this.responsive.scaleValue(120),
            `DISTANCE: ${this.finalDistance} M`,
            {
                fontSize: this.responsive.getFontSize(28) + 'px',
                fontFamily: 'monospace',
                fill: '#ffd700',
                stroke: '#000000',
                strokeThickness: this.responsive.scaleValue(3),
                fontStyle: 'bold'
            }
        );
        distanceDisplay.setOrigin(0.5);
        distanceDisplay.setDepth(100);
        distanceDisplay.setAlpha(0);

        this.tweens.add({
            targets: victoryPlayer,
            x: this.scale.width + 150,
            duration: 2000,
            ease: 'Power2.easeInOut',
            delay: 600,
            onUpdate: () => {
                playerTrail.setPosition(victoryPlayer.x - 30, victoryPlayer.y);
        
                if (victoryPlayer.x >= this.scale.width / 2 && victoryPlayer.x <= this.scale.width / 2 + 20 && !this.effectsTriggered) {
                    this.effectsTriggered = true;
                    this.triggerVictoryEffects(victoryImage, scoreDisplay, distanceDisplay, playerTrail);
                }
            },
            onComplete: () => {
                
            }
        });

        this.effectsTriggered = false;

        const restartButton = this.add.image(
            this.scale.width / 2, 
            this.scale.height + 150,
            'victorybuton'
        );
        restartButton.setScale(this.responsive.scaleValue(0.05));
        restartButton.setInteractive();
        restartButton.setDepth(100);
        restartButton.setAlpha(0);

        this.tweens.add({
            targets: restartButton,
            y: this.scale.height / 2 + this.responsive.scaleValue(200),
            scaleX: this.responsive.scaleValue(0.3),
            scaleY: this.responsive.scaleValue(0.3),
            alpha: 1,
            duration: 600,
            ease: 'Power2.easeOut',
            delay: 3000
        });

        restartButton.on('pointerover', () => {
            this.tweens.killTweensOf(restartButton);
            
            this.tweens.add({
                targets: restartButton,
                scaleX: this.responsive.scaleValue(0.36),
                scaleY: this.responsive.scaleValue(0.36),
                duration: 200,
                ease: 'Power2.easeOut'
            });
        });
        
        restartButton.on('pointerout', () => {
            this.tweens.killTweensOf(restartButton);
            
            this.tweens.add({
                targets: restartButton,
                scaleX: this.responsive.scaleValue(0.3),
                scaleY: this.responsive.scaleValue(0.3),
                duration: 300,
                ease: 'Back.easeOut'
            });
        });

        restartButton.on('pointerdown', () => {
            this.tweens.killTweensOf(restartButton);
            
            this.tweens.add({
                targets: restartButton,
                scaleX: this.responsive.scaleValue(0.35),
                scaleY: this.responsive.scaleValue(0.35),
                rotation: 0.2,
                duration: 100,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    this.tweens.add({
                        targets: restartButton,
                        alpha: 0,
                        scaleX: this.responsive.scaleValue(0.5),
                        scaleY: this.responsive.scaleValue(0.5),
                        duration: 200,
                        ease: 'Power2.easeIn'
                    });
                }
            });
            
            this.time.delayedCall(150, () => {
                this.restartGame();
            });
        });

    
        this.uiElements = {
            gradientBg,
            victoryPlayer,
            playerTrail,
            victoryImage,
            scoreDisplay,
            distanceDisplay,
            restartButton
        };

    
        this.input.keyboard.on('keydown-SPACE', () => {
            this.restartGame();
        });

        this.input.keyboard.on('keydown-UP', () => {
            this.restartGame();
        });
    }

    triggerVictoryEffects(victoryImage, scoreDisplay, distanceDisplay, playerTrail) {
        playerTrail.setVisible(false);
        playerTrail.destroy();
        
        this.cameras.main.shake(300, 0.012);
        
        // mobilde daha sakin efekt
        if (!this.responsive.isMobile) {
            this.createFireworks();
        }

        this.tweens.add({
            targets: victoryImage,
            y: this.scale.height / 2 - this.responsive.scaleValue(120),
            scaleX: this.responsive.scaleValue(0.5),
            scaleY: this.responsive.scaleValue(0.5),
            alpha: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 150,
            onComplete: () => {
                this.tweens.add({
                    targets: victoryImage,
                    scaleX: this.responsive.scaleValue(0.52),
                    scaleY: this.responsive.scaleValue(0.52),
                    duration: 800,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });

                this.tweens.add({
                    targets: victoryImage,
                    y: victoryImage.y - 8,
                    duration: 2500,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        this.time.delayedCall(400, () => {
            this.tweens.add({
                targets: scoreDisplay,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 500,
                ease: 'Back.easeOut'
            });
            this.animateScoreCounter(scoreDisplay);
        });

        this.time.delayedCall(700, () => {
            this.tweens.add({
                targets: distanceDisplay,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 500,
                ease: 'Back.easeOut'
            });
        });

        this.time.delayedCall(1000, () => {
            this.createCoinRain();
        });
    }

    createFireworks() {
        // mobilde daha az 
        const fireworkCount = this.responsive.isMobile ? 3 : 5;
        
        for (let i = 0; i < fireworkCount; i++) {
            this.time.delayedCall(i * 200, () => {
                const x = Phaser.Math.Between(100, this.scale.width - 100);
                const y = Phaser.Math.Between(50, 200);
                
                const particleCount = this.responsive.isMobile ? 8 : 12;
                
                for (let j = 0; j < particleCount; j++) {
                    const particle = this.add.rectangle(
                        x, y, 
                        this.responsive.scaleValue(8),
                        this.responsive.scaleValue(8),
                        Phaser.Math.RND.pick([0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff])
                    );
                    particle.setDepth(300);
                    
                    const angle = (j / particleCount) * Math.PI * 2;
                    const speed = Phaser.Math.Between(100, 200);
                    
                    this.tweens.add({
                        targets: particle,
                        x: x + Math.cos(angle) * speed,
                        y: y + Math.sin(angle) * speed,
                        alpha: 0,
                        scale: 0,
                        duration: 1000,
                        ease: 'Power2.easeOut',
                        onComplete: () => particle.destroy()
                    });
                }
            });
        }
    }

    createCoinRain() {
        // mobilde daha az
        const coinCount = this.responsive.isMobile ? 10 : 20;
        
        for (let i = 0; i < coinCount; i++) {
            this.time.delayedCall(i * 200, () => {
                const coin = this.add.image(
                    Phaser.Math.Between(50, this.scale.width - 50),
                    -20,
                    'coin'
                );
                coin.setScale(this.responsive.scaleValue(0.15));
                coin.setDepth(250);
                coin.setAlpha(0.8);
                
                this.tweens.add({
                    targets: coin,
                    y: this.scale.height + 50,
                    rotation: Math.PI * 4,
                    duration: Phaser.Math.Between(2000, 3500),
                    ease: 'Power1.easeIn',
                    onComplete: () => coin.destroy()
                });
                
                this.tweens.add({
                    targets: coin,
                    alpha: 0,
                    duration: 500,
                    delay: Phaser.Math.Between(1500, 3000)
                });
            });
        }
    }

    animateScoreCounter(scoreText) {
        let currentScore = 0;
        const increment = Math.max(1, Math.floor(this.finalScore / 30));
        
        const countTimer = this.time.addEvent({
            delay: 50,
            callback: () => {
                currentScore += increment;
                if (currentScore >= this.finalScore) {
                    currentScore = this.finalScore;
                    countTimer.destroy();
                
                    this.tweens.add({
                        targets: scoreText,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 200,
                        ease: 'Power2.easeOut',
                        yoyo: true
                    });
                }
                scoreText.setText(`SCORE: ${currentScore}`);
            },
            repeat: -1
        });
    }


    restartGame() {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop('VictoryScene');
            this.scene.start('GameScene');
        });
    }
}