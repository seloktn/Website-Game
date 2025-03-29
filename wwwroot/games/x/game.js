const config = {  
    type: Phaser.AUTO,
    width: 600,
    height: 900,
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

const game = new Phaser.Game(config);
let cursors;
let normalPlatforms;
let movingPlatforms;
let breakingPlatforms;
let phantomPlatforms;
let player;
let ground;
let lastPlatformY = 900;
let platformGap = 200;
let lastY = 0;
let jumpPower = 950;
let gameOverText;
let lastPlatformType = "normal";
let coins;
let score = 0;
let scoreText;

function preload() {
    this.load.image('platform', 'assets/platform.png');
    this.load.image('movingPlatform', 'assets/movingPlatform.png');
    this.load.image('breakingPlatform', 'assets/breakingPlatform.png');
    this.load.image('phantomPlatform', 'assets/phantomPlatform.png');
    this.load.image('player', 'assets/Ataturk2.png');
    this.load.image('coin', 'assets/coin.png');
}

function create() {
    this.physics.world.setBounds(0, 0, config.width, Number.MAX_SAFE_INTEGER);
    coins = this.physics.add.group({ allowGravity: false, immovable: true });

    ground = this.physics.add.staticGroup();
    normalPlatforms = this.physics.add.staticGroup();
    movingPlatforms = this.physics.add.group();
    breakingPlatforms = this.physics.add.group();
    phantomPlatforms = this.physics.add.group();

    player = this.physics.add.sprite(config.width / 2, 700, 'player');
    player.setDisplaySize(75, 120);
    player.setCollideWorldBounds(true);

    player.body.world.bounds.bottom = Number.MAX_SAFE_INTEGER;
    player.body.world.bounds.top = -Number.MAX_SAFE_INTEGER;

    this.physics.add.collider(player, ground, startingJump);

    this.cameras.main.startFollow(player, false, 0, 0);
    this.cameras.main.setFollowOffset(0, -config.height / 4);

    cursors = this.input.keyboard.createCursorKeys();

    createInitialGround(this);

    this.physics.add.collider(player, normalPlatforms, (player, platform) => {
        handlePlatformCollision(player, platform, jumpPower);
    });

    this.physics.add.collider(player, movingPlatforms, (player, platform) => {
        handlePlatformCollision(player, platform, jumpPower);
    });

    this.physics.add.collider(player, breakingPlatforms, (player, platform) => {
        handlePlatformCollision(player, platform, jumpPower);
        setTimeout(() => platform.destroy(), 2000);
    });

    gameOverText = this.add.text(150, config.height / 2, 'Game Over!', {
        fontSize: '50px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 6
    }).setScrollFactor(0).setVisible(false);

    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff'
    }).setScrollFactor(0).setDepth(1000);

    for (let index = 0; index < 10; index++) {
        addNormalPlatform(this);
    }

    this.physics.add.overlap(player, coins, collectCoin, null, this);
}

function update() {
    handlePlayerMovement();

    if (player.y < lastPlatformY + 500) {
        let platformType = Phaser.Math.Between(1, 10);
        if (platformType <= 6) {
            addNormalPlatform(this);
            lastPlatformType = "normal";
        } else if (platformType <= 8) {
            addMovingPlatform(this);
            lastPlatformType = "moving";
        } else if (platformType == 9) {
            addBreakingPlatform(this);
            lastPlatformType = "breaking";
        } else if (platformType == 10 && lastPlatformType != "phantom") {
            addPhantomPlatform(this);
            lastPlatformType = "phantom";
        } else {
            addNormalPlatform(this);
            lastPlatformType = "normal";
        }

        if (Phaser.Math.Between(1, 10) <= 2) {
            addCoin(this);
        }
    }

    if (player.y < this.cameras.main.scrollY + jumpPower / 3) {
        this.cameras.main.scrollY = player.y - jumpPower / 3;
    }

    let cameraBottomY = this.cameras.main.scrollY + config.height;
    if (player.y > cameraBottomY) {
        this.physics.pause();
        gameOverText.setVisible(true);
    }
}

function checkPlatforms() {
    let offScreenY = this.cameras.main.scrollY + this.cameras.main.height;
    let checkInterval = 10;
    let frameCount = 0;

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

        phantomPlatforms.children.each(function (platform) {
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

phantomPlatforms.children.each(function (platform) {
    if (platform.y > player.y + 900) {
        platform.setVisible(false);
        platform.body.enable = false;
        platform.body.velocity.x = 0;
    }
});

function handlePlayerMovement() {
    if (cursors.left.isDown) {
        player.setVelocityX(-500);
    } else if (cursors.right.isDown) {
        player.setVelocityX(500);
    } else {
        player.setVelocityX(0);
    }
}

function createInitialGround(scene) {
    let startGround = ground.create(300, 870, 'platform');
    startGround.setScale(600 / startGround.width, 50 / startGround.height);
    startGround.refreshBody();
}

function collectCoin(player, coin) {
    coin.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
    console.log('Coin collected! Score: ' + score);
}

function addCoin(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = Phaser.Math.Between(lastPlatformY - platformGap - 100, lastPlatformY - platformGap + 100);

    let coin = coins.create(x, y, 'coin');
    coin.setScale(1);

    let attempts = 0;
    let isOverlapping = true;

    while (isOverlapping && attempts < 10) {
        isOverlapping = false;

        coins.children.each(function (existingCoin) {
            if (coin !== existingCoin && Phaser.Geom.Intersects.RectangleToRectangle(coin.getBounds(), existingCoin.getBounds())) {
                isOverlapping = true;
            }
        });

        normalPlatforms.children.each(function (platform) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(coin.getBounds(), platform.getBounds())) {
                isOverlapping = true;
            }
        });

        movingPlatforms.children.each(function (platform) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(coin.getBounds(), platform.getBounds())) {
                isOverlapping = true;
            }
        });

        breakingPlatforms.children.each(function (platform) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(coin.getBounds(), platform.getBounds())) {
                isOverlapping = true;
            }
        });

        phantomPlatforms.children.each(function (platform) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(coin.getBounds(), platform.getBounds())) {
                isOverlapping = true;
            }
        });

        if (isOverlapping) {
            coin.setPosition(Phaser.Math.Between(0, config.width), Phaser.Math.Between(lastPlatformY - platformGap - 100, lastPlatformY - platformGap + 100));
            attempts++;
        }
    }

    if (isOverlapping) {
        coin.destroy();
    }
}
function addNormalPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let platform = normalPlatforms.create(x, y, 'platform');
    platform.setScale(200 / platform.width, 50 / platform.height);
    platform.refreshBody();

    lastPlatformY = y;

    // sadece üstten collision
    platform.body.checkCollision.up = true;
    platform.body.checkCollision.down = false;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;
}

// hareket eden platform
function addMovingPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let movingPlatform = movingPlatforms.create(x, y, 'movingPlatform');
    movingPlatform.setScale(200 / movingPlatform.width, 50 / movingPlatform.height);
    movingPlatform.refreshBody();
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
}

// üzerinde bastıktan sonra kırılan platform
function addBreakingPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let breakingPlatform = breakingPlatforms.create(x, y, 'breakingPlatform');
    breakingPlatform.setScale(200 / breakingPlatform.width, 50 / breakingPlatform.height);
    breakingPlatform.refreshBody();
    breakingPlatform.body.allowGravity = false;
    breakingPlatform.setImmovable(true);

    breakingPlatform.body.checkCollision.up = true;
    breakingPlatform.body.checkCollision.down = false;
    breakingPlatform.body.checkCollision.left = false;
    breakingPlatform.body.checkCollision.right = false;

    // platforma etkileşim ekleyerek tıklandığında yok et
    breakingPlatform.setInteractive(); // Platforma etkileşim ekle
    breakingPlatform.on('pointerdown', () => {
        breakingPlatform.destroy(); // Platformu yok et
    });

    lastPlatformY = y;
}

// sahte platform
function addPhantomPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let phantomPlatform = phantomPlatforms.create(x, y, 'phantomPlatform');

    phantomPlatform.setScale(200 / phantomPlatform.width, 50 / phantomPlatform.height);
    phantomPlatform.refreshBody();

    // Yerçekimini kapat ve immovable yap
    phantomPlatform.body.setAllowGravity(false);
    phantomPlatform.body.immovable = true;

    // Karakterin içinden geçmesini sağla
    phantomPlatform.body.checkCollision.up = false;
    phantomPlatform.body.checkCollision.down = false;
    phantomPlatform.body.checkCollision.left = false;
    phantomPlatform.body.checkCollision.right = false;

    lastPlatformY = y;
}

function startingJump() {
    player.setVelocityY(-(jumpPower + 200));
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
