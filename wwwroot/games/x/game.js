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

//platformlar standart boyutta 30px/30px

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


function preload() {
    this.load.image('platform', 'assets/platform.png');
    this.load.image('movingPlatform', 'assets/movingPlatform.png');
    this.load.image('breakingPlatform', 'assets/breakingPlatform.png');
    this.load.image('phantomPlatform', 'assets/phantomPlatform.png');
    this.load.image('player', 'assets/Ataturk2.png');
}

function create() {
    this.physics.world.setBounds(0, 0, config.width, Number.MAX_SAFE_INTEGER);

    ground = this.physics.add.staticGroup();
    normalPlatforms = this.physics.add.staticGroup();
    movingPlatforms = this.physics.add.group();
    breakingPlatforms = this.physics.add.group();
    phantomPlatforms = this.physics.add.group();

    // Create player
    player = this.physics.add.sprite(config.width / 2, 700, 'player');
    player.setDisplaySize(75, 120);
    player.setCollideWorldBounds(true);

    player.body.world.bounds.bottom = Number.MAX_SAFE_INTEGER; // ✅ Alt sınır sonsuz olsun
    player.body.world.bounds.top = -Number.MAX_SAFE_INTEGER; // ✅ Üst sınır sonsuz olsun


    this.physics.add.collider(player, ground, startingJump)

    // Kamera ayarları
    this.cameras.main.startFollow(player, false, 0, 0);
    this.cameras.main.setFollowOffset(0, -config.height / 4);

    // Klavye girişlerini oluştur
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
        setTimeout(function () {
            platform.destroy();  // kırılan platformu yok et
        }, 2000);  // yok olma süresi ms cinsinden
    });

    //Game over ekranı
    gameOverText = this.add.text(150, config.height / 2, 'Game Over!', {
        fontSize: '50px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 6
    }).setScrollFactor(0).setVisible(false);

    //ilk 10 platformu oluşturur
    for (let index = 0; index < 10; index++) {
        addNormalPlatform(this);
    }

}

function update() {
    handlePlayerMovement();

    //oyuncu yaklaştıkca random sayı oluştur sayının aralığına göre platform ekle
    if (player.y < lastPlatformY + 500) {
        //random sayı oluştur sayının aralığına göre platform ekle
        let platformType = Phaser.Math.Between(1, 10)
        if (platformType <= 6) {  //%60 ihtimalle normal
            addNormalPlatform(this);
            lastPlatformType = "normal";
        } else if (platformType <= 8) {  //%20 ihtimalle moving
            addMovingPlatform(this);
            lastPlatformType = "moving";
        } else if (platformType == 9) {  //%10 ihtimalle breaking
            addBreakingPlatform(this);
            lastPlatformType = "breaking";
        } else if (platformType == 10 && lastPlatformType != "phantom") {  //%10 ihtimalle phantom
            addPhantomPlatform(this);
            lastPlatformType = "phantom";
        }
    }

    // Eski platformları yok et
    normalPlatforms.children.each(function (platform) {
        if (platform.y > player.y + 900) {
            platform.destroy();
            console.log("platform destroyed");
        }
    });

    movingPlatforms.children.each(function (platform) {
        if (platform.y > player.y + 900) {
            platform.destroy();
            console.log("platform destroyed");
        }
    });

    breakingPlatforms.children.each(function (platform) {
        if (platform.y > player.y + 900) {
            platform.destroy();
            console.log("platform destroyed");
        }
    });

    phantomPlatforms.children.each(function (platform) {
        if (platform.y > player.y + 900) {
            platform.destroy();
            console.log("platform destroyed");
        }
    });

    // Karakter yeni bir yüksekliğe çıkarsa kamera takip etsin
    if (player.y < this.cameras.main.scrollY + jumpPower / 3) {
        this.cameras.main.scrollY = player.y - jumpPower / 3;
    }
    if (player.y > this.cameras.main.scrollY) {

    }

    //game over
    let cameraBottomY = this.cameras.main.scrollY + config.height;
    if (player.y > cameraBottomY) {
        this.physics.pause();
        gameOverText.setVisible(true);
    }
}

function handlePlayerMovement() {
    if (cursors.left.isDown) {
        player.setVelocityX(-500);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(500);
    }
    else {
        player.setVelocityX(0);
    }
}

function createInitialGround(scene) {
    let startGround = ground.create(300, 870, 'platform')
    startGround.setScale(600 / startGround.width, 50 / startGround.height)
    startGround.refreshBody();

}

function addNormalPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let platform = normalPlatforms.create(x, y, 'platform');
    platform.setScale(200 / platform.width, 50 / platform.height)
    platform.refreshBody();

    lastPlatformY = y;

    //sadece üstten collision
    platform.body.checkCollision.up = true;
    platform.body.checkCollision.down = false;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;
}

//hareket eden platform
function addMovingPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let movingPlatform = movingPlatforms.create(x, y, 'movingPlatform');
    movingPlatform.setScale(200 / movingPlatform.width, 50 / movingPlatform.height);
    movingPlatform.refreshBody();
    movingPlatform.setImmovable(true);
    movingPlatform.body.allowGravity = false;

    // Use a more robust tween for movement
    scene.tweens.add({
        targets: movingPlatform,
        x: x + Phaser.Math.Between(100, 200) * (Math.random() > 0.5 ? 1 : -1),
        duration: 1500,
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


//üzerinde bastıktan sonra kırılan platform
//TODO overlap sonrası platform kayboluyor
function addBreakingPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let breakingPlatform = breakingPlatforms.create(x, y, 'breakingPlatform');
    breakingPlatform.setScale(200 / breakingPlatform.width, 50 / breakingPlatform.height)
    breakingPlatform.refreshBody();
    breakingPlatform.body.allowGravity = false;
    breakingPlatform.setImmovable(true);

    breakingPlatform.body.checkCollision.up = true;
    breakingPlatform.body.checkCollision.down = false;
    breakingPlatform.body.checkCollision.left = false;
    breakingPlatform.body.checkCollision.right = false;

    lastPlatformY = y;
}


//sahte platform
function addPhantomPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let phantomPlatform = phantomPlatforms.create(x, y, 'phantomPlatform')

    phantomPlatform.setScale(200 / phantomPlatform.width, 50 / phantomPlatform.height);
    phantomPlatform.refreshBody();

    // Yerçekimini kapat ve immovable yap
    phantomPlatform.body.setAllowGravity(false);
    phantomPlatform.body.immovable = true;

    // Karakterin içinden geçmesini sağla
    scene.physics.add.overlap(player, phantomPlatform, () => {
        // Collision yoksay
    });

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
        }
    }
}
/*
    moving platformlar bazen saçma yerlerde oluşup lakasız yerlere gittiğinden
    tamamen ekran dışı kalabiliyorlar ona bi bakarsınız
*/
