
    const config = {
      type: Phaser.AUTO,
      width: 560,
      height: 1050,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
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
    };
    let recommendedImages = [];

    // İlk önce coin görsellerini al
    fetch('/api/product/recommendedImages')
      .then(res => res.json())
      .then(images => {
        recommendedImages = images;
    
    new Phaser.Game(config);
  });


const DEBUG_COLLISIONS = false;
let cursors;
let normalPlatforms;
let movingPlatforms;
let breakingPlatforms;
// let phantomPlatforms;
let player;
let ground;
let lastPlatformY = 700;
let platformGap = 150;
let lastY = 0;
let jumpPower = 820;
let gameOverText;
let lastPlatformType = "normal";
let coins;
let score = 0;
let scoreText;
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
let victoryY = spaceThreshold - 8000;
let victoryScreen;
let victoryAchieved = false;
let trophy;


function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('platformSpace', 'assets/platformSpace.png');
    this.load.image('movingPlatform', 'assets/movingPlatform.png');
    this.load.image('breakingPlatform', 'assets/breakingPlatform.png');

    this.load.image('player', 'assets/player.png');

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

    recommendedImages.forEach(imageUrl => {
        const imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));
        this.load.image(imageName, imageUrl);
      });
}

function create() {
    //dünya sınırları
    this.physics.world.setBounds(0, 0, config.width, Number.MAX_SAFE_INTEGER);
    coins = this.physics.add.group({ allowGravity: false, immovable: true });

    //arka plan oluşturma
    let background = this.add.image(config.width / 2, config.height, 'background');
    background.setOrigin(0.5, 1);
    background.displayWidth = config.width;
    background.setScrollFactor(0.9);


    normalPlatforms = this.physics.add.staticGroup();
    movingPlatforms = this.physics.add.group();
    breakingPlatforms = this.physics.add.group();
    //  phantomPlatforms = this.physics.add.group();

    //debug
    enemies = this.physics.add.group();
    if (DEBUG_COLLISIONS) {
        this.physics.world.createDebugGraphic();
    }

    //karakter oluşturma
    player = this.physics.add.sprite(config.width / 2, config.height - 500, 'player');//Y = config.height - 500
    player.setScale(0.35);
    player.setCollideWorldBounds(false);
    player.setVelocityY(-100)

    player.body.setSize(player.width, player.height);
    player.body.setOffset(0, 0);

    //başlangıç zemini oluşturma
    ground = this.physics.add.staticGroup();
    createInitialGround(this);

    player.body.world.bounds.bottom = Number.MAX_SAFE_INTEGER;
    player.body.world.bounds.top = -Number.MAX_SAFE_INTEGER;

    //kamera takip
    this.cameras.main.startFollow(player, false, 0, 1);
    this.cameras.main.setFollowOffset(0, -config.height * 2 / 10);


    cursors = this.input.keyboard.createCursorKeys();

    //mobil kontroller
    //mobil cihaz kontrolü
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        this.input.on('pointermove', function (pointer) {
            if (!player || !gameActive) return;

            // Parmağın X konumuna göre karakterin pozisyonunu ayarla
            player.x = Phaser.Math.Clamp(pointer.x, 0, config.width);
        }, this);
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
    const initialPlatformsCount = 20; // Increased from 10
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


}

function update() {

    let cameraTopY = this.cameras.main.scrollY;
    let cameraBottomY = cameraTopY + config.height;

    handlePlayerMovement();
    adjustCameraDeadzone.call(this);

    function adjustCameraDeadzone() {
        if (player.body.velocity.y < 0) {
            //kamera takip noktası ayarlama
            this.cameras.main.setFollowOffset(0, config.height * 2 / 10);
        }
    }

    inSpaceStage = checkSpaceStage(player.y);
    //    checkVictoryCondition.call(this);

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

        if (Phaser.Math.Between(1, 10) <= 2) {
            addCoin(this);
        }
    }

    if (player.y < this.cameras.main.scrollY + jumpPower * 9 / 10 && player.body.velocity.y < 0) {
        this.cameras.main.scrollY = player.y - jumpPower * 9 / 10;

    }

    if (this.cameras.main.scrollY > lastY) {
        this.cameras.main.scrollY = lastY;
    } else {
        lastY = this.cameras.main.scrollY;
    }

    if (player.y > cameraBottomY + 500) {

        normalPlatforms.children.each(function (platform) {
            if (platform.y > cameraBottomY - 50) {
                platform.setVisible(false);
            }
        });

        movingPlatforms.children.each(function (platform) {
            if (platform.y > cameraBottomY - 50) {
                platform.setVisible(false);
            }
        });

        breakingPlatforms.children.each(function (platform) {
            if (platform.y > cameraBottomY - 50) {
                platform.setVisible(false);
            }
        });

        // Play a falling animation
        this.tweens.add({
            targets: player,
            angle: 180,
            alpha: 0.7,
            duration: 500,
            onComplete: () => {
                this.physics.pause();
                gameActive = false;
                showGameOver(this);
            }
        });
    }

    // bird

    if (gameActive) {
        if (gameActive && !inSpaceStage && player.y < cloudSpawnThreshold && Phaser.Math.Between(1, 130) === 1) {
            spawnBird(this);
        }
    }



    // alien
    if (gameActive && inSpaceStage && player.y - config.height > victoryY ) {
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


function collectCoin(player, coin) {
    coin.destroy();
    score += 10;
    scoreText.setText(score.toString());

    console.log('Coin collected! Score: ' + score);
}

function addCoin(scene) {
    if (!recommendedImages || recommendedImages.length === 0) return;

    let x = Phaser.Math.Between(0, config.width);
    let y = Phaser.Math.Between(lastPlatformY - platformGap - 100, lastPlatformY - platformGap + 100);

    let imageUrl = Phaser.Utils.Array.GetRandom(recommendedImages);
    let imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));

    //  50x50 container 
    let coin = scene.add.container(x, y);
    let image = scene.add.image(0, 0, imageName);

    // orantılı şekilde 50x50 kutuya sığdırma
    const maxSize = 60;
    const texture = scene.textures.get(imageName).getSourceImage();
    const scale = Math.min(maxSize / texture.width, maxSize / texture.height);
    image.setScale(scale);

    coin.add(image);

    //  50x50’lik hitbox 
    scene.physics.world.enable(coin);
    coin.body.setSize(60, 60);
    coin.body.setOffset(-30, -30); // i
    coin.body.setAllowGravity(false);
    coin.body.setImmovable(true);

    coins.add(coin); 

    // 4. Çakışma kontrolü
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


        let glow = scene.add.image(platform.x, platform.y, platformTexture);
        glow.setScale(160 / glow.width, 160 / glow.height);
        glow.setAlpha(0.3);
        glow.setDepth(platform.depth - 1);


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



        let glow = scene.add.image(movingPlatform.x, movingPlatform.y, platformTexture);
        glow.setScale(160 / glow.width, 160 / glow.height);
        glow.setAlpha(0.9);
        glow.setDepth(movingPlatform.depth - 1);

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


        let glow = scene.add.image(breakingPlatform.x, breakingPlatform.y, platformTexture);
        glow.setScale(160 / glow.width, 160 / glow.height);
        glow.setAlpha(0.3);
        glow.setDepth(breakingPlatform.depth - 1);
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
        'SCORE: ' + score,
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

        score = 0;
        playerHealth = 5;
        gameActive = true;
        victoryAchieved = false;
        inSpaceStage = false;
        lastPlatformY = 700;
        lastY = 0;

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

        scene.scene.restart();
    });
}

function showVictoryScreen(scene) {
    scene.physics.pause();
    gameActive = false;
    victoryAchieved = true;

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
        'SCORE: ' + score,
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

    let startGround = ground.create(config.width / 2, config.height - 250, 'ground');
    startGround.setScale(5);

    startGround.body.checkCollision.up = true;
    startGround.body.checkCollision.down = false;
    startGround.body.checkCollision.left = false;
    startGround.body.checkCollision.right = false;

    startGround.body.setSize(startGround.width * 0.9, startGround.height * 0.1);
    startGround.body.setOffset(startGround.width * 0.05, 0);

    startGround.refreshBody();

    scene.physics.add.collider(player, ground, (player, platform) => {
        handlePlatformCollision(player, platform, jumpPower + 200);
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

    scoreText = this.add.text(155, 38, score.toString(), {
        fontSize: '22px',
        fontFamily: 'monospace',
        fill: '#ffffff',
        stroke: '#ff0000',
        strokeThickness: 2
    });
    scoreText.setOrigin(0.5);
    scoreText.setScrollFactor(0);
    scoreText.setDepth(1001);

    // Health bar container
    let healthBarContainer = this.add.image(config.width - 120, 30, 'healthBar');
    healthBarContainer.setScale(1.0);
    healthBarContainer.setScrollFactor(0);
    healthBarContainer.setDepth(1000);

    // Health points
    healthPoints = this.add.group();
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