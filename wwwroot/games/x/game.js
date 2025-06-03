(function () {
    let triggered = false;
    let safeCheckCount = 0;
    let lastDelay = 0;

    function triggerRedirect() {
        if (triggered) return;
        triggered = true;

        document.body.innerHTML = `
            <div style="font-family: monospace; text-align: center; padding-top: 200px; font-size: 24px;">
                <strong>Çıkış yapılıyor...</strong>
            </div>
        `;

        setTimeout(() => {
            window.location.href = "/";
        }, 2000);
    }

    function checkConsoleViaGetter() {
        const el = new Image();
        Object.defineProperty(el, 'id', {
            get: function () {
                triggerRedirect();
            }
        });
        console.dir(el); // Konsol açıkken getter tetiklenir
    }

    function checkDebuggerDelay() {
        const start = performance.now();
        debugger;
        const end = performance.now();

        const delay = end - start;
        lastDelay = delay;

        if (delay > 150) {
            triggerRedirect();
        } else {
            safeCheckCount++;
        }
    }

    // Konsol tespiti
    setInterval(() => {
        checkConsoleViaGetter();
        checkDebuggerDelay();
    }, 1200);

    // Kod bozulursa veya durdurulursa yönlendir
    setInterval(() => {
        if (!triggered && safeCheckCount === 0 && lastDelay < 2) {
            triggerRedirect();
        }
    }, 3000);
})();


// Başlangıçta varsayılan ayarlar
let deviceWidth = 560;
let deviceHeight = 1050;

// Mobil kontrolü
let isMobile = window.innerWidth <= 768;

// Eğer PC ise genişlik 
if (!isMobile) {
    deviceWidth = Math.floor(window.innerWidth * 0.45);
}

const config = {
    type: Phaser.AUTO,
    width: deviceWidth,
    height: deviceHeight,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: deviceWidth,
        height: deviceHeight
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}; Object.seal(config);

let gameRules = {}; 
let recommendedImages = [];

// İlk olarak kuralları ve görselleri alır
Promise.all([
  fetch('/api/score/rules').then(res => res.json()),
  fetch('/api/product/recommendedImages').then(res => res.json())
])
.then(([rules, images]) => {
  gameRules = rules;
  recommendedImages = images;

  // Oyun başlat
  new Phaser.Game(config);
});



const DEBUG_COLLISIONS = false;

let scoreText;

const _dS1 = (() => {
    let score = 0;
    let coins = 0;
    let trophy = false;
    let _scoreText = null;

    const addScore = (amount) => {
        score += amount;
        if (_scoreText) {
            _scoreText.setText(score.toString());
        }
    };

    const addCoin = () => {
        if (coins < 40) {
            coins++;
            addScore(10);
        }
    };

    const collectTrophy = () => {
        if (!trophy) {
            trophy = true;
            addScore(50);
        }
    };

    return {
        getScore: () => score,
        getCoinCount: () => coins,
        getCollectedCoinCount: () => coins,
        hasTrophy: () => trophy,
        bindScoreText: (txt) => _scoreText = txt,
        updateScoreText: () => {
            if (_scoreText) _scoreText.setText(score.toString());
        },
        reset: () => {
            score = 0;
            coins = 0;
            trophy = false;
            if (_scoreText) _scoreText.setText("0");
        },

        // Bu ikisini sadece gerçekten gerekliyse dışarı aç
        internalAddCoin: addCoin,
        internalCollectTrophy: collectTrophy
    };
})(); Object.freeze(_dS1);

let cursors;
let touchDirection = null;
let isTouchDevice = false;
let normalPlatforms;
let movingPlatforms;
let breakingPlatforms;
// let phantomPlatforms;
let player;
let ground;
let lastPlatformY = 500;
let platformGap = 150;
let lastY = 0;
let jumpPower = 810;
let gameOverText;
let lastPlatformType = "normal";
let inSpaceStage = false;
let spaceThreshold = -(10000 * 0.39);
let gameActive = true;
let alienBullets;
let playerHealth = 5;
let healthPoints;
let healthText;
let enemies;
let cloudSpawnThreshold = -(10000 * 0.01);
let gameOverScreen;
let victoryY = spaceThreshold - 7800;
let victoryScreen;
let victoryAchieved = false;
let trophy;
let maxFallDistance = config.height * 0.8;
let highestPlayerY = 0;
let startScreenActive = true;
let startScreenElements = [];
let gameOverSoundPlayed = false;
let canPlayDamageSound = true;
let backgroundMusic;
let canPlayBirdSound = true;
let canPlayAlienSound = true;
let canPlayUfoSound = true;
let isMuted = false;
let soundToggleButton;

const GameTimer = (() => {
    let startTime = Date.now();

    return {
        reset: () => startTime = Date.now(),
        getDuration: () => Date.now() - startTime
    };
})();



function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('background5', 'assets/background/image1x5.png');
    this.load.image('background4', 'assets/background/image1x4.png');
    this.load.image('background3', 'assets/background/image1x3.png');
    this.load.image('background2', 'assets/background/image1x2.png');
    this.load.image('background1', 'assets/background/image1x1.png');

    this.load.image('platform', 'assets/platform.png');
    this.load.image('platformSpace', 'assets/platformSpace.png');
    this.load.image('movingPlatform', 'assets/movingPlatform.png');
    this.load.image('breakingPlatform', 'assets/breakingPlatform.png');
    this.load.image('player', 'assets/player.png');
    //this.load.image('coin', 'assets/coin.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('bird', 'assets/bird.png');
    this.load.image('ufo', 'assets/ufo.png');
    this.load.image('alien', 'assets/alien.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('trophy', 'assets/trophy.png');


    this.load.image('scorePanel', 'assets/ui/score_panel.png');
    this.load.image('healthBar', 'assets/ui/health_bar.png');
    this.load.image('healthPoint', 'assets/ui/health_point.png');

    this.load.image('gameOverScreenSky', 'assets/ui/game_over_screen_sky.png');
    this.load.image('gameOverScreenSpace', 'assets/ui/game_over_screen_space.png');
    this.load.image('victoryScreen', 'assets/ui/victory_screen.png');

    this.load.image('gameOverTextSky', 'assets/ui/game_over_text_sky.png');
    this.load.image('gameOverTextSpace', 'assets/ui/game_over_text_space.png');
    this.load.image('restartButton', 'assets/ui/restart_button.png');
    this.load.image('restartButtonSpace', 'assets/ui/restart_button_space.png');
    this.load.image('victoryTextSpace', 'assets/ui/victory_text_space.png');
    this.load.image('startButton', 'assets/ui/start_button.png');
    this.load.image('howToButton', 'assets/ui/howTo_button.png');
    this.load.image('title', 'assets/ui/title.png');
    this.load.image('soundOn', 'assets/ui/sound_on.png');
    this.load.image('soundOff', 'assets/ui/sound_off.png');


    //Sesler
    this.load.audio('jump', 'assets/sounds/jump.mp3');
    this.load.audio('gameOverSound', 'assets/sounds/gameover.mp3');
    this.load.audio('bulletFire', 'assets/sounds/bullet.mp3');
    this.load.audio('coinSound', 'assets/sounds/coin.mp3');
    this.load.audio('damageSound', 'assets/sounds/damage.mp3');
    this.load.audio('backgroundMusic', 'assets/sounds/backgroundMusic.mp3');
    this.load.audio('buttonClick', 'assets/sounds/buttonClick.mp3');
    this.load.audio('victorySound', 'assets/sounds/win.mp3');

    this.load.audio('alienSound', 'assets/sounds/alien.mp3');
    this.load.audio('ufoSound', 'assets/sounds/ufo.mp3');
    this.load.audio('birdSound', 'assets/sounds/bird.mp3');

    recommendedImages.forEach(imageUrl => {
        const imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));
        this.load.image(imageName, imageUrl);
    });

}

function create() {
    gameActive = false;
    this.physics.pause();
    //dünya sınırları
    this.physics.world.setBounds(0, 0, config.width, Number.MAX_SAFE_INTEGER);
    coins = this.physics.add.group({ allowGravity: false, immovable: true });

    //arka plan oluşturma
    addBackground(this, config.width / 2, config.height, 'background5');
    addBackground(this, config.width / 2, config.height - 1 * (13200 / 5), 'background4');
    addBackground(this, config.width / 2, config.height - 2 * (13200 / 5), 'background3');
    addBackground(this, config.width / 2, config.height - 3 * (13200 / 5), 'background2');
    addBackground(this, config.width / 2, config.height - 4 * (13200 / 5), 'background1');

    let groundColor = 0x3e2022;
    let groundBelowTrampoline = this.add.rectangle(
        config.width / 2,
        config.height,
        config.width,
        500,
        groundColor
    );
    groundBelowTrampoline.setOrigin(0.5, 0);
    groundBelowTrampoline.setScrollFactor(0.9);
    groundBelowTrampoline.setDepth(-1);

    if (!backgroundMusic) {
        backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
        backgroundMusic.play();
    } else {
        if (!backgroundMusic.isPlaying) {
            backgroundMusic.play();
        }
    }

    normalPlatforms = this.physics.add.staticGroup();
    movingPlatforms = this.physics.add.group();
    breakingPlatforms = this.physics.add.group();

    //debug
    enemies = this.physics.add.group();
    if (DEBUG_COLLISIONS) {
        this.physics.world.createDebugGraphic();
    }

    //karakter oluşturma
    player = this.physics.add.sprite(config.width / 2, config.height - 400, 'player');
    player.setScale(0.35);
    player.setCollideWorldBounds(false);
    player.setVelocityY(-100)

    player.body.setSize(player.width, player.height);
    player.body.setOffset(0, 0);
    player.setAngle(0);

    //başlangıç zemini oluşturma
    ground = this.physics.add.staticGroup();
    createInitialGround(this);

    player.body.world.bounds.bottom = Number.MAX_SAFE_INTEGER;
    player.body.world.bounds.top = -Number.MAX_SAFE_INTEGER;

    //kamera takip
    this.cameras.main.startFollow(player, false, 0, 0.05);
    this.cameras.main.setFollowOffset(0, -config.height * 2 / 10);


    cursors = this.input.keyboard.createCursorKeys();

    //mobil kontroller
    //mobil cihaz kontrolü
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        this.input.on('pointerdown', function (pointer) {
            if (pointer.x < config.width / 2) {
                touchDirection = 'left';
            } else {
                touchDirection = 'right';
            }
        });

        this.input.on('pointerup', function () {
            touchDirection = null;
        });
    }

    // Trophy'yi victoryY konumuna yerleştir
    trophy = this.physics.add.sprite(config.width / 2, victoryY, 'trophy');
    trophy.setScale(0.2);
    trophy.body.setSize(trophy.width * 0.2, trophy.height * 0.2);
    trophy.body.setAllowGravity(false);
    trophy.setImmovable(true);


    //colliderlar : normal
    this.physics.add.collider(player, normalPlatforms, (player, platform) => {
        let playerBottom = player.y + player.displayHeight / 2;
        let platformTop = platform.y - platform.displayHeight / 2;


        if (player.body.velocity.y >= 0 && playerBottom <= platformTop + 10) {

            handlePlatformCollision(player, platform, jumpPower);
            animatePlayerLanding(this, player);
            this.sound.play('jump');
            this.tweens.add({
                targets: platform,
                y: platform.y + 15,
                duration: 150,
                yoyo: true,
                ease: 'Bounce.easeOut'
            });


            this.tweens.add({
                targets: platform,
                scaleY: platform.scaleY * 0.7,
                duration: 150,
                yoyo: true,
                ease: 'Quad.easeOut'
            });


            let originalTint = platform.tintTopLeft;
            platform.setTint(0xffffff);
            this.time.delayedCall(150, () => {
                platform.setTint(originalTint);
            });
        } else {

            handlePlatformCollision(player, platform, jumpPower);
        }
    });

    //colliderlar : hareketliler
    this.physics.add.collider(player, movingPlatforms, (player, platform) => {
        let playerBottom = player.y + player.displayHeight / 2;
        let platformTop = platform.y - platform.displayHeight / 2;


        if (player.body.velocity.y >= 0 && playerBottom <= platformTop + 10) {

            handlePlatformCollision(player, platform, jumpPower);
            animatePlayerLanding(this, player);
            this.sound.play('jump');

            this.tweens.add({
                targets: platform,
                y: platform.y + 15,
                duration: 150,
                yoyo: true,
                ease: 'Bounce.easeOut'
            });


            this.tweens.add({
                targets: platform,
                scaleY: platform.scaleY * 0.7,
                duration: 150,
                yoyo: true,
                ease: 'Quad.easeOut'
            });


            let originalTint = platform.tintTopLeft;
            platform.setTint(0xffffff);
            this.time.delayedCall(150, () => {
                platform.setTint(originalTint);
            });
        } else {

            handlePlatformCollision(player, platform, jumpPower);
        }
    });

    //colliderlar : kırılanlar
    this.physics.add.collider(player, breakingPlatforms, (player, platform) => {
        let playerBottom = player.y + player.displayHeight / 2;
        let platformTop = platform.y - platform.displayHeight / 2;


        if (player.body.velocity.y >= 0 && playerBottom <= platformTop + 5) {
            handlePlatformCollision(player, platform, jumpPower);
            animatePlayerLanding(this, player);
            this.sound.play('jump');
            this.tweens.add({
                targets: platform,
                alpha: 0,
                y: platform.y + 20,
                duration: 300,
                delay: 50,
                onComplete: () => {
                    platform.destroy();
                }
            });
        } else {

            handlePlatformCollision(player, platform, jumpPower);
        }
    });

    createUI.call(this);

    //game over text oluşturma
    gameOverText = this.add.text(150, config.height / 2, 'Game Over!', {
        fontSize: '50px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 6
    }).setScrollFactor(0).setVisible(false);


    //ilk platformların oluşturulması
    const initialPlatformsCount = 10; // Increased from 10
    for (let index = 0; index < initialPlatformsCount; index++) {
        let platformType = Phaser.Math.Between(1, 10);
        if (platformType <= 6) {
            addNormalPlatform(this);
        } else if (platformType <= 8) {
            addMovingPlatform(this);
        } else {
            addBreakingPlatform(this);
        }
    }

    //fizik eklemeleri
    this.physics.add.overlap(player, coins, collectCoin, null, this);

   this.physics.add.overlap(player, trophy, () => {
    _dS1.internalCollectTrophy();
    _dS1.updateScoreText();
    showVictoryScreen(this);
});

    this.physics.add.overlap(player, enemies, handleEnemyCollision, null, this);

    alienBullets = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });

    // Add bullet cleanup system
    this.time.addEvent({
        delay: 1000,
        callback: cleanupBullets,
        callbackScope: this,
        loop: true
    });

    this.physics.add.overlap(player, alienBullets, handleBulletCollision, null, this);

    if (startScreenActive) {
        createStartScreen(this); // İlk açılışta çalışır
    } else {
        // Restart sonrası otomatik başlat: trambolinden zıplayarak
        gameActive = true;
        player.setVisible(true);
        player.setVelocityY(-jumpPower - 200); // Güçlü zıplatma (trambolin etkisi)
        this.physics.resume(); // Fizikleri devam ettir

        // UI elemanlarını görünür yap
        if (scoreText) scoreText.setVisible(true);
        if (healthPoints) {
            healthPoints.children.each(function (point) {
                point.setVisible(true);
            });
        }

        this.children.list.forEach(child => {
            if (child.texture &&
                (child.texture.key === 'scorePanel' ||
                    child.texture.key === 'healthBar')) {
                child.setVisible(true);
            }
        });
    }
}

function update() {
    if (startScreenActive) return;
    if (gameActive && this.physics.world.isPaused) {
        this.physics.resume();
    }
    let cameraTopY = this.cameras.main.scrollY;
    let cameraBottomY = cameraTopY + config.height;

    handlePlayerMovement();

    if (isTouchDevice) {
        handleMobileControls();
    }

    adjustCameraDeadzone.call(this);

    inSpaceStage = checkSpaceStage(player.y);

    // Platform generation
    const cameraTop = this.cameras.main.scrollY;
    const visibleHeight = this.cameras.main.height;
    const generationThreshold = cameraTop - visibleHeight * 0.5;

    if (lastPlatformY > generationThreshold && cameraTop - 200 < lastPlatformY && player.y - config.height - 200 > victoryY) {
        let platformType = Phaser.Math.Between(1, 10);
        if (platformType <= 6) {
            addNormalPlatform(this);
            lastPlatformType = "normal";
        } else if (platformType <= 8) {
            addMovingPlatform(this);
            lastPlatformType = "moving";
        } else {
            addBreakingPlatform(this);
            lastPlatformType = "breaking";
        }

        if (Phaser.Math.Between(1, 10) <= 4) {
            addCoin(this);
        }
    }

    // Camera follow logic for jumping and falling
    if (player.body.velocity.y < 0) {
        // Player is jumping upward
        const targetY = player.y - jumpPower * 9 / 10;
        this.cameras.main.scrollY = Phaser.Math.Linear(
            this.cameras.main.scrollY,
            targetY,
            0.05
        );

        // Update the highest camera position
        if (this.cameras.main.scrollY < lastY) {
            lastY = this.cameras.main.scrollY;
        }
    } else if (player.body.velocity.y > 0) {
        // Player is falling - allow some downward camera movement
        // Calculate how far down the camera can go (30% of screen height)
        const maxDownwardOffset = config.height * 0.3;
        const lowestAllowedY = lastY - maxDownwardOffset;

        // Calculate target position - keep player in upper part of screen
        const targetY = Math.max(
            lowestAllowedY,
            player.y - config.height * 0.7
        );

        // Smoothly move camera to the target position
        this.cameras.main.scrollY = Phaser.Math.Linear(
            this.cameras.main.scrollY,
            targetY,
            0.03
        );
    }

    // Fall detection - unified and reliable
    if (gameActive) {
        // Track highest point reached (only when not touching platforms)
        if (player.y < highestPlayerY || highestPlayerY === 0) {
            highestPlayerY = player.y;
        }

        // Reset highest point when player is on a platform
        if (player.body.touching.down) {
            // When player lands on any platform, reset the highest point
            highestPlayerY = player.y;
        }

        // Get current fall distance
        const currentFallDistance = player.y - highestPlayerY;

        // Check if player has fallen too far from highest point
        // Only trigger game over when player is actually falling (positive y velocity) 
        // and has exceeded the maximum fall distance
        if (currentFallDistance > maxFallDistance && player.body.velocity.y > 0) {
            // Trigger game over
            gameActive = false;
            this.physics.pause();

            this.tweens.add({
                targets: player,
                angle: 180,
                alpha: 0.7,
                duration: 300,
                onComplete: () => {
                    showGameOver(this);
                }
            });
        }

        // Check if player has fallen below the trampoline/ground
        const trampolineY = config.height - 300;
        if (player.y > trampolineY + 50) {
            // Stop camera from following player down
            this.cameras.main.stopFollow();

            // Keep camera at the ground level
            this.cameras.main.scrollY = trampolineY - config.height / 2;

            // Immediately pause physics to stop further falling
            this.physics.pause();
            gameActive = false;

            this.tweens.add({
                targets: player,
                angle: 180,
                alpha: 0.7,
                duration: 150,
                onComplete: () => {
                    showGameOver(this);
                }
            });
        }
    }


    // bird

    if (gameActive) {
        if (gameActive && !inSpaceStage && player.y < cloudSpawnThreshold && Phaser.Math.Between(1, 130) === 1) {
            spawnBird(this);
        }
    }


    // alien
    if (gameActive && inSpaceStage && player.y - config.height > victoryY) {
        if (Phaser.Math.Between(1, 200) === 1) {
            spawnAlien(this);
        }
    }

    // ufo
    if (gameActive && player.y - config.height > victoryY) {
        if (inSpaceStage && Phaser.Math.Between(1, 250) === 1) {
            spawnUFO(this);
        }
    }


}

function addBackground(scene, x, y, texture) {
    let background = scene.add.image(x, y, texture);
    background.setOrigin(0.5, 1);
    background.displayWidth = config.width;
    background.setScrollFactor(0.9);
    background.setDepth(-1);
}

function adjustCameraDeadzone() {
    if (player.body.velocity.y < 0) {
        const currentOffset = this.cameras.main.followOffset.y;
        const targetOffset = config.height * 2 / 10;

        this.cameras.main.setFollowOffset(
            0,
            Phaser.Math.Linear(currentOffset, targetOffset, 0.03)
        );
    }
}

function checkSpaceStage(playerY) {
    if (playerY < spaceThreshold && !inSpaceStage) {
        inSpaceStage = true;
        console.log("Entered space stage at Y =", playerY);
    }
    return inSpaceStage;
}

function checkPlatforms() {
    let offScreenY = this.cameras.main.scrollY + this.cameras.main.height;
    let checkInterval = 10;
    let frameCount = 0;

    enemies.children.each(function (enemy) {
        if (enemy.y > offScreenY) {
            enemy.destroy();
        }
    });

    if (frameCount % checkInterval === 0) {
        normalPlatforms.children.each(function (platform) {
            if (platform.y > offScreenY) {
                platform.setVisible(false);
                platform.body.setEnable(false);
                platform.setVelocity(0);
                platform.setPosition(platform.x, offScreenY);
            }
        });

        movingPlatforms.children.each(function (platform) {
            if (platform.y > offScreenY) {
                platform.setVisible(false);
                platform.body.setEnable(false);
                platform.setVelocity(0);
                platform.setPosition(platform.x, offScreenY);
            }
        });

        breakingPlatforms.children.each(function (platform) {
            if (platform.y > offScreenY) {
                platform.setVisible(false);
                platform.body.setEnable(false);
                platform.setVelocity(0);
                platform.setPosition(platform.x, offScreenY);
            }
        });

    }

    frameCount++;
}

this.time.addEvent({
    delay: 16,
    loop: true,
    callback: checkPlatforms
});

normalPlatforms.children.each(function (platform) {
    if (platform.y > player.y + 900) {
        platform.setVisible(false);
        platform.body.enable = false;
        platform.body.velocity.x = 0;
    }
});

movingPlatforms.children.each(function (platform) {
    if (platform.y > player.y + 900) {
        platform.setVisible(false);
        platform.body.enable = false;
        platform.body.velocity.x = 0;
    }
});

breakingPlatforms.children.each(function (platform) {
    if (platform.y > player.y + 900) {
        platform.setVisible(false);
        platform.body.enable = false;
        platform.body.velocity.x = 0;
    }
});


function handlePlayerMovement() {
    if (cursors.left.isDown) {
        player.setVelocityX(-500);
        player.flipX = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(500);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
    }

    if (player.x < 0) {
        player.x = config.width;
    } else if (player.x > config.width) {
        player.x = 0;
    }
}


function handleMobileControls() {
    if (touchDirection === 'left') {
        player.setVelocityX(-500);
        player.flipX = true;
    } else if (touchDirection === 'right') {
        player.setVelocityX(500);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
    }

    if (player.x < 0) {
        player.x = config.width;
    }
    else if (player.x > config.width) {
        player.x = 0;
    }

}


function collectCoin(player, coin) {
    coin.destroy();
    _dS1.internalAddCoin();
    _dS1.updateScoreText();

    this.sound.play('coinSound');

    console.log('Coin collected! Score: ' + _dS1.getScore());
}

function addCoin(scene) {
    if (!recommendedImages || recommendedImages.length === 0) return;

    let x = Phaser.Math.Between(0, config.width);
    let y = Phaser.Math.Between(lastPlatformY - platformGap - 100, lastPlatformY - platformGap + 100);

    let imageUrl = Phaser.Utils.Array.GetRandom(recommendedImages);
    let imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));

    let coin = scene.add.container(x, y);
    let image = scene.add.image(0, 0, imageName);

    //  Coin büyüklüğü ayarı
    let maxSize = 100;
    if (!isMobile) {
        maxSize += deviceWidth * 0.040; // PC'de %ekle
    }

    const texture = scene.textures.get(imageName).getSourceImage();
    const scale = Math.min(maxSize / texture.width, maxSize / texture.height);
    image.setScale(scale);

    coin.add(image);

    scene.physics.world.enable(coin);
    coin.body.setSize(maxSize, maxSize); // hitbox da büyüsün
    coin.body.setOffset(-maxSize / 2, -maxSize / 2);
    coin.body.setAllowGravity(false);
    coin.body.setImmovable(true);

    coins.add(coin);

    // Çakışma kontrolü
    let attempts = 0;
    let isOverlapping;

    do {
        isOverlapping = false;

        coins.children.each(existing => {
            if (coin !== existing && Phaser.Geom.Intersects.RectangleToRectangle(coin.getBounds(), existing.getBounds())) {
                isOverlapping = true;
            }
        });

        normalPlatforms.children.each(platform => {
            if (Phaser.Geom.Intersects.RectangleToRectangle(coin.getBounds(), platform.getBounds())) {
                isOverlapping = true;
            }
        });

        movingPlatforms.children.each(platform => {
            if (Phaser.Geom.Intersects.RectangleToRectangle(coin.getBounds(), platform.getBounds())) {
                isOverlapping = true;
            }
        });

        breakingPlatforms.children.each(platform => {
            if (Phaser.Geom.Intersects.RectangleToRectangle(coin.getBounds(), platform.getBounds())) {
                isOverlapping = true;
            }
        });

        if (isOverlapping) {
            coin.setPosition(
                Phaser.Math.Between(0, config.width),
                Phaser.Math.Between(lastPlatformY - platformGap - 100, lastPlatformY - platformGap + 100)
            );
            attempts++;
        }

    } while (isOverlapping && attempts < 10);

    if (isOverlapping) coin.destroy();
}


//normal platform
function addNormalPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let platformTexture = inSpaceStage ? 'platformSpace' : 'platform';
    let platform = normalPlatforms.create(x, y, platformTexture);
    platform.setScale(120 / platform.width, 42 / platform.height);

    platform.body.setSize(platform.width * 0.8, platform.height * 0.1);
    platform.body.setOffset(platform.width * 0.1, 0);



    if (inSpaceStage) {

        platform.setAlpha(0.8);

        /*
                let glow = scene.add.image(platform.x, platform.y, platformTexture);
                glow.setScale(160 / glow.width, 160 / glow.height);
                glow.setAlpha(0.3);
                glow.setDepth(platform.depth - 1);
        */

        scene.tweens.add({
            targets: platform,
            alpha: 0.7,
            duration: Phaser.Math.Between(1500, 3000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

    }


    if (Phaser.Math.Between(1, 3) === 1) {
        let extraX = Phaser.Math.Between(0, config.width);

        while (Math.abs(extraX - x) < 100) {
            extraX = Phaser.Math.Between(0, config.width);
        }
        let extraPlatform = normalPlatforms.create(extraX, y, platformTexture);
        extraPlatform.setScale(120 / extraPlatform.width, 42 / extraPlatform.height);

        extraPlatform.body.setSize(extraPlatform.width * 0.8, extraPlatform.height * 0.1);
        extraPlatform.body.setOffset(extraPlatform.width * 0.1, 0);
        extraPlatform.body.checkCollision.up = true;
        extraPlatform.body.checkCollision.down = false;
        extraPlatform.body.checkCollision.left = false;
        extraPlatform.body.checkCollision.right = false;
        extraPlatform.refreshBody();
    }


    lastPlatformY = y;

    // sadece üstten collision
    platform.body.checkCollision.up = true;
    platform.body.checkCollision.down = false;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;

    platform.refreshBody();
}

// hareket eden platform
function addMovingPlatform(scene) {

    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let platformTexture = inSpaceStage ? 'platformSpace' : 'movingPlatform';
    let movingPlatform = movingPlatforms.create(x, y, platformTexture);
    movingPlatform.setScale(120 / movingPlatform.width, 42 / movingPlatform.height);


    if (inSpaceStage) {

        movingPlatform.setAlpha(0.8);


        /*
                let glow = scene.add.image(movingPlatform.x, movingPlatform.y, platformTexture);
                glow.setScale(160 / glow.width, 160 / glow.height);
                glow.setAlpha(0.9);
                glow.setDepth(movingPlatform.depth - 1);
        */
        scene.tweens.add({
            targets: movingPlatform,
            alpha: 0.7,
            duration: Phaser.Math.Between(1500, 3000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }


    movingPlatform.setImmovable(true);
    movingPlatform.body.allowGravity = false;

    // daha yumuşak ve çeşitli hareket
    let moveDistance = Phaser.Math.Between(100, 200);
    let moveDuration = Phaser.Math.Between(1500, 2500); // Daha çeşitli hızlar
    scene.tweens.add({
        targets: movingPlatform,
        x: x + moveDistance * (Math.random() > 0.5 ? 1 : -1),
        duration: moveDuration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    lastPlatformY = y;

    movingPlatform.body.checkCollision.up = true;
    movingPlatform.body.checkCollision.down = false;
    movingPlatform.body.checkCollision.left = false;
    movingPlatform.body.checkCollision.right = false;

    movingPlatform.refreshBody();
}

// üzerinde bastıktan sonra kırılan platform
function addBreakingPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let platformTexture = inSpaceStage ? 'platformSpace' : 'breakingPlatform';
    let breakingPlatform = breakingPlatforms.create(x, y, platformTexture);
    breakingPlatform.setScale(120 / breakingPlatform.width, 42 / breakingPlatform.height);

    if (inSpaceStage) {
        breakingPlatform.setAlpha(0.8);

        /*
                let glow = scene.add.image(breakingPlatform.x, breakingPlatform.y, platformTexture);
                glow.setScale(160 / glow.width, 160 / glow.height);
                glow.setAlpha(0.3);
                glow.setDepth(breakingPlatform.depth - 1);
        */
    }


    breakingPlatform.body.allowGravity = false;
    breakingPlatform.setImmovable(true);

    breakingPlatform.body.checkCollision.up = true;
    breakingPlatform.body.checkCollision.down = false;
    breakingPlatform.body.checkCollision.left = false;
    breakingPlatform.body.checkCollision.right = false;


    lastPlatformY = y;

    breakingPlatform.refreshBody();
}

function handlePlatformCollision(player, platform, jumpPower) {
    let playerBottom = player.y + player.displayHeight / 2;
    let platformTop = platform.y - platform.displayHeight / 2;

    // Karakterin yalnızca düşerken çarpışmasını sağla
    if (player.body.velocity.y >= 0) {
        if (playerBottom <= platformTop + 5) { // 5 piksel tolerans


            player.setVelocityY(-jumpPower);  // Zıpla
            player.body.velocity.y = -jumpPower; // Ekstra güvenlik: Y hızını netleştir

        }
    }
}

//kuş düşman
function spawnBird(scene) {
    let x = Phaser.Math.Between(100, config.width - 100);
    let y = player.y - 900;
    let canSpawnBird = true;

    enemies.children.entries.forEach((enemy) => {
        if (enemy.texture.key === 'bird' &&
            Math.abs(enemy.x - x) < 300 &&
            Math.abs(enemy.y - y) < 300) {
            canSpawnBird = false;
        }
    });

    if (!canSpawnBird) return;

    let bird = enemies.create(x, y, 'bird');
    bird.setScale(1.2);
    bird.body.setGravity(0, 0);
    bird.body.velocity.y = 0;
    bird.body.allowGravity = false;
    bird.body.moves = false;
    bird.setImmovable(true);

    if (canPlayBirdSound) {
        scene.sound.play('birdSound');
        canPlayBirdSound = false;

        // 3 saniye sonra tekrar ses çalınabilir
        scene.time.delayedCall(3000, () => {
            canPlayBirdSound = true;
        });
    }

    let movementDistance = Phaser.Math.Between(100, 200);
    let movingRight = movementDistance > 0;

    bird.setFlipX(!movingRight);

    scene.tweens.add({
        targets: bird,
        x: x + movementDistance,
        scaleY: bird.scaleY * 0.85,
        y: bird.y - 20,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        onYoyo: () => {
            bird.setFlipX(true);
        },
        onRepeat: () => {
            bird.setFlipX(false);
        }
    });
}

//Alien düşman
function spawnAlien(scene) {
    let x = Phaser.Math.Between(100, config.width - 100);
    let y = player.y - 900;


    let canSpawnAlien = true;
    enemies.children.entries.forEach((enemy) => {

        if (Math.abs(enemy.x - x) < 400 && Math.abs(enemy.y - y) < 400) {
            canSpawnAlien = false;
        }
    });

    if (canSpawnAlien) {
        let alien = enemies.create(x, y, 'alien');
        alien.setScale(0.9);

        alien.body.setGravity(0, 0);
        alien.body.velocity.y = 0;
        alien.body.allowGravity = false;
        alien.body.moves = false;
        alien.setImmovable(true);

        if (canPlayAlienSound) {
            scene.sound.play('alienSound');
            canPlayAlienSound = false;

            scene.time.delayedCall(3000, () => {
                canPlayAlienSound = true;
            });
        }


        scene.tweens.add({
            targets: alien,
            y: y - 10,
            angle: Phaser.Math.Between(-5, 5),
            alpha: 0.85,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        alien.setTint(0xccffcc);

        scene.time.addEvent({
            delay: 2000,
            callback: () => {
                if (gameActive && alien.active) {
                    let distanceToPlayer = Phaser.Math.Distance.Between(
                        alien.x, alien.y,
                        player.x, player.y
                    );

                    if (distanceToPlayer < 800) {
                        let bullet = alienBullets.create(alien.x, alien.y, 'bullet');
                        bullet.setScale(1.0);
                        bullet.setDataEnabled();
                        bullet.data.set('created', Date.now());
                        let angle = Phaser.Math.Angle.Between(
                            alien.x, alien.y,
                            player.x, player.y
                        );

                        const bulletSpeed = 300;
                        bullet.body.velocity.x = Math.cos(angle) * bulletSpeed;
                        bullet.body.velocity.y = Math.sin(angle) * bulletSpeed;
                        bullet.setAngle(Phaser.Math.RadToDeg(angle) - 90);
                        scene.sound.play('bulletFire');


                    }
                }

            },
            loop: true
        });
    }
}

//ufo düşmanı
function spawnUFO(scene) {
    let x = Phaser.Math.Between(100, config.width - 100);
    let y = player.y - 900;


    let canSpawnUFO = true;
    enemies.children.entries.forEach((enemy) => {

        if (Math.abs(enemy.x - x) < 400 && Math.abs(enemy.y - y) < 400) {
            canSpawnUFO = false;
        }
    });

    if (canSpawnUFO) {
        let ufo = enemies.create(x, y, 'ufo');
        ufo.setScale(1.3);

        ufo.body.setSize(
            ufo.width * 0.5,
            ufo.height * 0.3
        );


        ufo.body.setOffset(
            ufo.width * 0.25,
            ufo.height * 0.35
        );

        ufo.body.setGravity(0, 0);
        ufo.body.velocity.y = 0;
        ufo.body.allowGravity = false;
        ufo.body.moves = false;
        ufo.setImmovable(true);

        if (canPlayUfoSound) {
            scene.sound.play('ufoSound');
            canPlayUfoSound = false;

            scene.time.delayedCall(3000, () => {
                canPlayUfoSound = true;
            });
        }


        scene.tweens.add({
            targets: ufo,
            x: x + Phaser.Math.Between(-80, 80),
            y: y - 10,
            angle: 10,
            alpha: 0.65,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}

function handleEnemyCollision(player, enemy) {

    //    enemy.destroy();
    this.physics.pause();
    gameActive = false;
    showGameOver(this);
}

function handleBulletCollision(player, bullet) {

    bullet.destroy();

    if (canPlayDamageSound) {
        this.sound.play('damageSound');
        canPlayDamageSound = false;

        // Örneğin 300ms sonra yeniden ses çalabilsin.
        this.time.delayedCall(300, () => {
            canPlayDamageSound = true;
        });
    }

    playerHealth--;

    let lastHealthPoint = healthPoints.getChildren()[healthPoints.getChildren().length - 1];
    if (lastHealthPoint) {

        this.tweens.add({
            targets: lastHealthPoint,
            alpha: 0,
            y: lastHealthPoint.y + 20,
            duration: 200,
            onComplete: () => {
                lastHealthPoint.destroy();
            }
        });
    }

    player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
        player.clearTint();
    });


    if (playerHealth <= 0) {
        this.physics.pause();
        gameActive = false;
        showGameOver(this);
    }
}

function showGameOver(scene) {

    if (gameOverSoundPlayed) return; // Eğer zaten çalıştıysa, tekrar çalışmasın
    gameOverSoundPlayed = true;

    scene.physics.pause();
    scene.tweens.pauseAll();
    gameActive = false;
    player.clearTint();

    movingPlatforms.children.each(function (platform) {
        if (platform.body) {
            platform.body.setVelocity(0, 0);
            platform.body.setAcceleration(0, 0);
        }
    });

    enemies.children.each(function (enemy) {
        if (enemy.body) {
            enemy.body.setVelocity(0, 0);
            enemy.body.setAcceleration(0, 0);
        }
    });

    alienBullets.children.each(function (bullet) {
        if (bullet.body) {
            bullet.body.setVelocity(0, 0);
        }
    });

    if (scoreText) scoreText.setVisible(false);
    if (healthPoints) {
        healthPoints.children.each(function (point) {
            point.setVisible(false);
        });
    }

    scene.children.list.forEach(child => {
        if (child.texture &&
            (child.texture.key === 'scorePanel' ||
                child.texture.key === 'healthBar')) {
            child.setVisible(false);
        }
    });

    const overlayColor = inSpaceStage ? 0x0A0033 : 0x6CB4EE;
    let colorOverlay = scene.add.rectangle(
        config.width / 2,
        config.height / 2,
        config.width,
        config.height,
        overlayColor
    );
    colorOverlay.setAlpha(0.6);
    colorOverlay.setScrollFactor(0);
    colorOverlay.setDepth(999);

    const gameOverImageKey = inSpaceStage ? 'gameOverTextSpace' : 'gameOverTextSky';
    let gameOverImage = scene.add.image(
        config.width / 2,
        config.height / 2 - 150,
        gameOverImageKey
    );
    const imageScale = inSpaceStage ? 1.0 : 1.2;
    gameOverImage.setScale(imageScale);
    gameOverImage.setScrollFactor(0);
    gameOverImage.setDepth(1000);

    // Score text
    let finalScoreText = scene.add.text(
        config.width / 2,
        config.height / 2,
        'SCORE: ...',
        {
            fontSize: '40px',
            fontFamily: 'monospace',
            fill: '#ffffff',
            stroke: '#00E5FF',
            strokeThickness: 3
        }
    );
    finalScoreText.setOrigin(0.5);
    finalScoreText.setScrollFactor(0);
    finalScoreText.setDepth(1000);

    // Use different restart button based on stage
    const restartButtonTexture = inSpaceStage ? 'restartButtonSpace' : 'restartButton';
    let restartButton = scene.add.image(
        config.width / 2,
        config.height / 2 + 80,
        restartButtonTexture
    );
    restartButton.setScale(0.3);
    restartButton.setScrollFactor(0);
    restartButton.setDepth(1000);
    restartButton.setInteractive();

    // Add hover effect
    restartButton.on('pointerover', () => {
        restartButton.setScale(0.3);
        restartButton.setTint(0xccccff);
    });

    restartButton.on('pointerout', () => {
        restartButton.setScale(0.3);
        restartButton.clearTint();
    });

    // Add pressed effect
    restartButton.on('pointerdown', () => {
        restartButton.setScale(0.3);
        restartButton.setTint(0x999999);
    });

    // Restart functionality
    restartButton.on('pointerup', () => {

        scene.sound.play('buttonClick', { volume: 0.5 });
        score = 0;
        playerHealth = 5;
        gameActive = true;
        victoryAchieved = false;
        inSpaceStage = false;
        lastPlatformY = 700;
        lastY = 0;
        highestPlayerY = 0;
        touchDirection = null;

        startScreenActive = false;

        gameOverSoundPlayed = false;

        normalPlatforms.clear(true, true);
        movingPlatforms.clear(true, true);
        breakingPlatforms.clear(true, true);
        enemies.clear(true, true);
        coins.clear(true, true);
        alienBullets.clear(true, true);

        colorOverlay.destroy();
        gameOverImage.destroy();
        finalScoreText.destroy();
        restartButton.destroy();

        if (backgroundMusic && backgroundMusic.isPlaying) {
            backgroundMusic.stop(); // veya .pause()
            backgroundMusic.destroy(); // tekrar add edilebilmesi için
            backgroundMusic = null;
        }

        scene.scene.restart();
    });

    const durationMs = GameTimer.getDuration();

    // API'ye skor gönderme
fetch('/api/score/submit', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    coins: _dS1.getCollectedCoinCount(),
    trophy: _dS1.hasTrophy() ? 1 : 0,
    durationMs: durationMs
    })
})
.then(res => res.json())
.then(data => {
    console.log('GameOver Sunucu Skor Yanıtı:', data);
     finalScoreText.setText('SCORE: ' + data.score);
});


    scene.sound.play('gameOverSound');
    _dS1.reset();        
    GameTimer.reset();
}

function showVictoryScreen(scene) {
    scene.physics.pause();
    gameActive = false;
    victoryAchieved = true;

    scene.sound.stopAll();
    scene.sound.play('victorySound', { volume: 1, loop: false });

    player.clearTint();

    // Create a transparent colored overlay 
    const overlayColor = 0x0A0033;
    let colorOverlay = scene.add.rectangle(
        config.width / 2,
        config.height / 2,
        config.width,
        config.height,
        overlayColor
    );
    colorOverlay.setAlpha(0.6);
    colorOverlay.setScrollFactor(0);
    colorOverlay.setDepth(999);

    // Use victory text image
    let victoryImage = scene.add.image(
        config.width / 2,
        config.height / 2 - 150,
        'victoryTextSpace'
    );
    victoryImage.setScale(1.0);
    victoryImage.setScrollFactor(0);
    victoryImage.setDepth(1000);

    // Score text
    let finalScoreText = scene.add.text(
        config.width / 2,
        config.height / 2 + 250,
        'SCORE:...',
        {
            fontSize: '40px',
            fontFamily: 'monospace',
            fill: '#ffffff',
            stroke: '#00E5FF',
            strokeThickness: 3
        }
    );
    finalScoreText.setOrigin(0.5);
    finalScoreText.setScrollFactor(0);
    finalScoreText.setDepth(1000);

    const durationMs = GameTimer.getDuration();

    // Skoru sunucuya bildir
    fetch('/api/score/submit', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        coins: _dS1.getCollectedCoinCount(),
        trophy: _dS1.hasTrophy() ? 1 : 0,
        durationMs: durationMs
    })
    })
    .then(res => res.json())
    .then(data => {
    console.log('Sunucu yanıtı:', data);
    finalScoreText.setText('SCORE: ' + data.score);
});

    _dS1.reset();        
    GameTimer.reset(); 

    // Restart button
    let restartButton = scene.add.image(
        config.width / 2,
        config.height / 2 + 350,
        'restartButtonSpace'
    );
    restartButton.setScale(0.5);
    restartButton.setScrollFactor(0);
    restartButton.setDepth(1000);
    restartButton.setInteractive();

    // Add hover effect
    restartButton.on('pointerover', () => {
        restartButton.setScale(0.5);
        restartButton.setTint(0xccccff);
    });

    restartButton.on('pointerout', () => {
        restartButton.setScale(0.5);
        restartButton.clearTint();
    });

    // Add pressed effect
    restartButton.on('pointerdown', () => {
        restartButton.setScale(0.5);
        restartButton.setTint(0x999999);
    });

    // Restart functionality
    restartButton.on('pointerup', () => {
        score = 0;
        playerHealth = 5;
        gameActive = true;
        victoryAchieved = false;
        inSpaceStage = false;
        lastPlatformY = 700;
        lastY = 0;
        highestPlayerY = 0;
        touchDirection = null;

        normalPlatforms.clear(true, true);
        movingPlatforms.clear(true, true);
        breakingPlatforms.clear(true, true);
        enemies.clear(true, true);
        coins.clear(true, true);
        alienBullets.clear(true, true);

        colorOverlay.destroy();
        victoryImage.destroy();
        finalScoreText.destroy();
        restartButton.destroy();

        scene.scene.restart();
    });

}

function cleanupBullets() {
    if (!gameActive) return;

    const cameraView = {
        top: this.cameras.main.scrollY - 200,
        bottom: this.cameras.main.scrollY + config.height + 200,
        left: -100,
        right: config.width + 100
    };


    alienBullets.children.each(function (bullet) {
        if (bullet.y < cameraView.top || bullet.y > cameraView.bottom ||
            bullet.x < cameraView.left || bullet.x > cameraView.right) {
            bullet.destroy();
        }


        if (bullet.data && bullet.data.has('created')) {
            const created = bullet.data.get('created');
            if (Date.now() - created > 5000) {
                bullet.destroy();
            }
        }
    });
}

function createInitialGround(scene) {

    let trampolineFrame = scene.add.image(config.width / 2, config.height - 300, 'ground');
    trampolineFrame.setScale(2);
    trampolineFrame.setDepth(1);

    let trampolineMat = scene.add.image(config.width / 2, config.height - 300, 'ground');
    trampolineMat.setScale(2);
    trampolineMat.setDepth(0);

    let graphics = scene.make.graphics();
    graphics.fillStyle(0xffffff);

    let trampolineWidth = trampolineMat.width * trampolineMat.scaleX;
    let trampolineHeight = trampolineMat.height * trampolineMat.scaleY;

    graphics.fillEllipse(
        trampolineMat.x,
        trampolineMat.y,
        trampolineWidth * 0.6,
        trampolineHeight * 0.3
    );

    let mask = graphics.createGeometryMask();
    trampolineMat.setMask(mask);

    let startGround = ground.create(config.width / 2, config.height - 300, 'ground');
    startGround.setScale(2);
    startGround.setAlpha(0);

    startGround.body.checkCollision.up = true;
    startGround.body.checkCollision.down = false;
    startGround.body.checkCollision.left = false;
    startGround.body.checkCollision.right = false;

    startGround.body.setSize(startGround.width * 0.9, startGround.height * 0.1);
    startGround.body.setOffset(startGround.width * 0.05, 0);

    startGround.refreshBody();

    startGround.trampolineMat = trampolineMat;
    startGround.originalMatY = trampolineMat.y;

    scene.physics.add.collider(player, ground, (player, platform) => {

        handlePlatformCollision(player, platform, jumpPower + 200);

        if (platform.trampolineMat) {
            scene.sound.play('jump');
            animateTrampoline(scene, platform);
        }
    });
}

function animateTrampoline(scene, platform) {
    if (!platform.trampolineMat) return;

    const mat = platform.trampolineMat;
    const originalY = platform.originalMatY;

    scene.tweens.add({
        targets: mat,
        y: originalY + 30,
        scaleY: mat.scaleY * 0.6,
        duration: 150,
        ease: 'Quad.easeOut',
        onComplete: () => {
            scene.tweens.add({
                targets: mat,
                y: originalY - 20,
                scaleY: mat.scaleY * 1.2,
                duration: 200,
                ease: 'Back.easeOut',
                onComplete: () => {
                    scene.tweens.add({
                        targets: mat,
                        y: originalY,
                        scaleY: mat.scaleY,
                        duration: 150,
                        ease: 'Sine.easeInOut'
                    });
                }
            });
        }
    });


}

function createUI() {

    if (scoreText) {
        scoreText.destroy();
    }

    // Score panel
    let scorePanel = this.add.image(100, 40, 'scorePanel');
    scorePanel.setScale(0.35);
    scorePanel.setScrollFactor(0);
    scorePanel.setDepth(1000);

   let scoreTextObj = this.add.text(155, 38, "0", {
    fontSize: '22px',
    fontFamily: 'monospace',
    fill: '#ffffff',
    stroke: '#ff0000',
    strokeThickness: 2
});
    scoreTextObj.setOrigin(0.5);
    scoreTextObj.setScrollFactor(0);
    scoreTextObj.setDepth(1001);
    _dS1.bindScoreText(scoreTextObj);
    scoreText = scoreTextObj;


    // Health bar container
    let healthBarContainer = this.add.image(config.width - 120, 30, 'healthBar');
    healthBarContainer.setScale(1.0);
    healthBarContainer.setScrollFactor(0);
    healthBarContainer.setDepth(1000);

    // Health points
    healthPoints = this.add.group();
    // Sağ üst köşe için
    if (!isMobile) {
        const healthStartX = (deviceWidth * 0.205);  // Sağdan biraz boşluk
        const healthStartY = 85;
        const healthSpacing = 30;                // İki kalp arası mesafe

        for (let i = 0; i < playerHealth; i++) {
            let healthPoint = this.add.image(
                healthStartX - i * healthSpacing, // Sağdan sola doğru diziyoruz
                healthStartY,
                'healthPoint'
            );
            healthPoint.setScale(0.12);
            healthPoint.setScrollFactor(0);
            healthPoint.setDepth(1001);
            healthPoints.add(healthPoint);
        }
    } else {
        for (let i = 0; i < playerHealth; i++) {
            let healthPoint = this.add.image(
                (config.width - 510) + (i * 22),
                85,
                'healthPoint'
            );
            healthPoint.setScale(0.1);
            healthPoint.setScrollFactor(0);
            healthPoint.setDepth(1001);
            healthPoints.add(healthPoint);
        }
    }

    // Ses aç/kapa butonu
    soundToggleButton = this.add.image(config.width - 40, 100, 'soundOn');
    soundToggleButton.setScale(0.1);
    soundToggleButton.setScrollFactor(0);
    soundToggleButton.setDepth(1001);
    soundToggleButton.setInteractive();

    soundToggleButton.on('pointerdown', () => {
        isMuted = !isMuted;

        if (isMuted) {
            soundToggleButton.setTexture('soundOff');
            // Tüm sesleri sustur
            this.sound.mute = true;
        } else {
            soundToggleButton.setTexture('soundOn');
            // Sesleri aç
            this.sound.mute = false;
        }
    });


}

function animatePlayerLanding(scene, player) {

    scene.tweens.add({
        targets: player,
        scaleX: player.scaleX * 1.01,
        scaleY: player.scaleY * 0.7,
        duration: 120,
        ease: 'Quad.easeOut',
        onComplete: () => {

            scene.tweens.add({
                targets: player,
                scaleX: player.scaleX * 0.9,
                scaleY: player.scaleY * 1.3,
                duration: 150,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Return to original scale
                    scene.tweens.add({
                        targets: player,
                        scaleX: 0.35,
                        scaleY: 0.35,
                        duration: 100,
                        ease: 'Sine.easeInOut'
                    });
                }
            });
        }
    });
}

function createStartScreen(scene) {

    let overlay = scene.add.rectangle(
        config.width / 2,
        config.height / 2,
        config.width,
        config.height,
        0x2ABED9,
        0
    );
    overlay.setScrollFactor(0);
    overlay.setDepth(1000);
    startScreenElements.push(overlay);

    // Fade in the overlay
    scene.tweens.add({
        targets: overlay,
        alpha: 0.75,
        duration: 800,
        ease: 'Power2'
    });

    // Add a slight gradient effect with another rectangle
    let gradientOverlay = scene.add.rectangle(
        config.width / 2,
        config.height / 2,
        config.width,
        config.height,
        0x0AFFFF,
        0
    );
    gradientOverlay.setScrollFactor(0);
    gradientOverlay.setDepth(1000);
    gradientOverlay.setAlpha(0);
    startScreenElements.push(gradientOverlay);

    // Fade in the gradient with a different timing
    scene.tweens.add({
        targets: gradientOverlay,
        alpha: 0.2,
        duration: 1200,
        ease: 'Sine.InOut'
    });

    // Hide the actual player and UI elements
    if (player) player.setVisible(false);
    if (scoreText) scoreText.setVisible(false);
    if (healthPoints) {
        healthPoints.children.each(function (point) {
            point.setVisible(false);
        });
    }

    // Hide UI elements
    scene.children.list.forEach(child => {
        if (child.texture &&
            (child.texture.key === 'scorePanel' ||
                child.texture.key === 'healthBar')) {
            child.setVisible(false);
        }
    });

    // Title with animation
    // Replace text with image
    let title = scene.add.image(
        config.width / 2,
        config.height * 0.2,
        'title'
    );
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(1001);
    title.setAlpha(0);
    title.setScale(0.6);
    startScreenElements.push(title);

    // Animate title dropping in
    scene.tweens.add({
        targets: title,
        y: config.height * 0.3,
        alpha: 1,
        duration: 1000,
        ease: 'Bounce.Out',
        delay: 300
    });



    // Add 5 platforms that start at the bottom and move upward
    for (let i = 0; i < 5; i++) {
        // Spread platforms horizontally
        let x = config.width * (0.2 + 0.15 * i);
        // All start from below the screen
        let y = config.height + 50 + (i * 30);

        let platform = scene.add.image(x, y, 'platform');
        platform.setScale(120 / platform.width, 42 / platform.height);
        platform.setScrollFactor(0);
        platform.setDepth(1001);
        startScreenElements.push(platform);

        // Animate platform moving up continuously
        scene.tweens.add({
            targets: platform,
            y: -100,
            duration: 12000 + i * 1000,
            ease: 'Linear',
            delay: i * 1200, // Staggered start
            loop: -1, // Loop forever
            onLoop: (tween, target) => {
                // Reset position when it goes off screen
                target.y = config.height + 50;
                // Randomize horizontal position on each loop
                target.x = Phaser.Math.Between(50, config.width - 50);
            }
        });

        // Add a slight horizontal wobble
        scene.tweens.add({
            targets: platform,
            x: x + Phaser.Math.Between(-30, 30),
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut',
            delay: i * 500
        });
    }

    // Add a bouncing character
    let demoPlayer = scene.add.image(config.width / 2, config.height - 200, 'player');
    demoPlayer.setScale(0.35);
    demoPlayer.setScrollFactor(0);
    demoPlayer.setDepth(1001);
    demoPlayer.setAlpha(0);
    startScreenElements.push(demoPlayer);

    // Fade in player
    scene.tweens.add({
        targets: demoPlayer,
        alpha: 1,
        duration: 500,
        delay: 1800,
        ease: 'Sine.InOut'
    });

    // Make player bounce
    scene.tweens.add({
        targets: demoPlayer,
        y: demoPlayer.y - 150,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
        delay: 1800,
        onYoyo: () => {
            // Squash when landing
            scene.tweens.add({
                targets: demoPlayer,
                scaleX: 0.45,
                scaleY: 0.25,
                duration: 200,
                yoyo: true
            });
        },
        onRepeat: () => {
            // Stretch when jumping
            scene.tweens.add({
                targets: demoPlayer,
                scaleX: 0.3,
                scaleY: 0.4,
                duration: 200,
                yoyo: true
            });
        }
    });

    let isPopupOpen = false;

    // Start button with animation
    let button = scene.add.image(
        config.width / 2,
        config.height * 0.6 + 50,
        'startButton'
    );
    button.setScale(0);
    button.setScrollFactor(0);
    button.setDepth(1001);
    startScreenElements.push(button);
    // Animate button popping in
    scene.tweens.add({
        targets: button,
        scale: 0.4,
        y: config.height * 0.6,
        duration: 800,
        delay: 2000,
        ease: 'Back.Out',
        onComplete: () => {
            button.setInteractive();

            // Add continuous bounce effect
            scene.tweens.add({
                targets: button,
                scale: 0.45,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.InOut'
            });
        }
    });

    // Button hover effects
    button.on('pointerover', () => {
        scene.tweens.add({
            targets: button,
            scale: 0.5,
            duration: 100
        });
        button.setTint(0xccccff);
    });

    button.on('pointerout', () => {
        scene.tweens.add({
            targets: button,
            scale: 0.45,
            duration: 100
        });
        button.clearTint();
    });

    // Click effect and start game
    button.on('pointerdown', () => {
        scene.tweens.add({
            targets: button,
            scale: 0.35,
            duration: 100
        });

        scene.sound.play('buttonClick');

    });

    button.on('pointerup', () => {
        if (isPopupOpen) return; // zaten açıksa işlem yapma

        isPopupOpen = true;
        
        GameTimer.reset(); 

        // Play a satisfying zoom effect on all elements
        scene.tweens.add({
            targets: startScreenElements,
            scale: '*=1.1',
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                startScreenActive = false;
                gameActive = true;

                // Show the actual player and UI elements
                if (player) {
                    player.setVisible(true);
                }

                if (scoreText) scoreText.setVisible(true);
                if (healthPoints) {
                    healthPoints.children.each(function (point) {
                        point.setVisible(true);
                    });
                }

                // Show UI elements
                scene.children.list.forEach(child => {
                    if (child.texture &&
                        (child.texture.key === 'scorePanel' ||
                            child.texture.key === 'healthBar')) {
                        child.setVisible(true);
                    }
                });

                // Add a slight delay to ensure all elements are properly shown
                scene.time.delayedCall(100, () => {
                    // Force show the player again (extra safety)
                    if (player) player.setVisible(true);
                });

                // Remove start screen elements
                startScreenElements.forEach(element => element.destroy());
                startScreenElements = [];
            }
        });
    });

    // "Nasıl Oynanır" butonu
    let howToPlayButton = scene.add.image(
        config.width / 2,
        config.height * 0.6 + 300,
        'howToButton',
    );
    howToPlayButton.setScale(0);
    howToPlayButton.setOrigin(0.5);
    howToPlayButton.setScrollFactor(0);
    howToPlayButton.setDepth(1001);
    howToPlayButton.setInteractive();
    startScreenElements.push(howToPlayButton);

    scene.tweens.add({
        targets: howToPlayButton,
        scale: 0.1,
        y: config.height * 0.6 + 300,
        duration: 800,
        delay: 2000,
        ease: 'Back.Out',
        onComplete: () => {
            howToPlayButton.setInteractive();

            // Add continuous bounce effect
            scene.tweens.add({
                targets: howToPlayButton,
                scale: 0.15,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.InOut'
            });
        }
    });

    // Button hover effects
    howToPlayButton.on('pointerover', () => {
        scene.tweens.add({
            targets: howToPlayButton,
            scale: 0.15,
            duration: 100
        });
        howToPlayButton.setTint(0xccccff);
    });

    howToPlayButton.on('pointerout', () => {
        scene.tweens.add({
            targets: howToPlayButton,
            scale: 0.12,
            duration: 100
        });
        howToPlayButton.clearTint();
    });

    // Click effect and start game
    howToPlayButton.on('pointerdown', () => {
        scene.tweens.add({
            targets: howToPlayButton,
            scale: 0.08,
            duration: 100
        });

        scene.sound.play('buttonClick');
    });

    howToPlayButton.on('pointerup', () => {
        if (isPopupOpen) return; // zaten açıksa işlem yapma

        isPopupOpen = true;

        let popupBg = scene.add.rectangle(
            config.width / 2,
            config.height / 2,
            config.width * 0.9,
            config.height * 0.6,
            0x000000,
            0.85
        );
        popupBg.setScrollFactor(0);
        popupBg.setDepth(2000);

        let howToPlayText = scene.add.text(
            config.width / 2,
            config.height / 2,
            'hoşça kalın gidiom bne',
            {
                fontSize: '22px',
                fontFamily: 'monospace',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: config.width * 0.8 }
            }
        ).setOrigin(0.5);
        howToPlayText.setScrollFactor(0);
        howToPlayText.setDepth(2001);

        let closeText = scene.add.text(
            config.width / 2,
            config.height / 2 + 180,
            'Kapat',
            {
                fontSize: '24px',
                fontFamily: 'monospace',
                fill: '#ff6666',
                backgroundColor: '#ffffff',
                padding: { x: 12, y: 5 }
            }
        );
        closeText.setOrigin(0.5);
        closeText.setInteractive();
        closeText.setScrollFactor(0);
        closeText.setDepth(2002);

        closeText.on('pointerup', () => {
            isPopupOpen = false;
            popupBg.destroy();
            howToPlayText.destroy();
            closeText.destroy();
        });
    });
}