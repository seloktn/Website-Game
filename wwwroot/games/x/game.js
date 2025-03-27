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
let platforms;
let player;
let ground;
let lastPlatformY = 900;
let score = 0;
let scoreText;
let lastY = 0;
let jumpPower = 900;
let gameOverText;


function preload() {

}

function create() {
    this.physics.world.setBounds(0, 0, config.width, Number.MAX_SAFE_INTEGER);

    ground = this.physics.add.staticGroup();
    platforms = this.physics.add.staticGroup();

    // Create player
    player = this.physics.add.sprite(config.width / 2, 700, 'player');
    player.setDisplaySize(75, 120);
    player.setCollideWorldBounds(true);
    player.body.world.bounds.bottom = Number.MAX_SAFE_INTEGER; // ✅ Alt sınır sonsuz olsun
    player.body.world.bounds.top = -Number.MAX_SAFE_INTEGER; // ✅ Üst sınır sonsuz olsun


    this.physics.add.collider(player, ground, startingJump)

    // Kamera ayarları
    //    this.cameras.main.centerOn(player.x, player.y);
    this.cameras.main.startFollow(player, false, 0, 0);
    this.cameras.main.setFollowOffset(0, -config.height / 4);

    // Klavye girişlerini oluştur
    cursors = this.input.keyboard.createCursorKeys();

    createInitialGround(this);

    for (let index = 0; index < 10; index++) {
        addPlatform(this);
    }

    this.physics.add.overlap(player, platforms, jump, null, this);

}

function update() {
    handlePlayerMovement();

    // Yeni platformlar ekle
    if (player.y < lastPlatformY + 500) {
        addPlatform(this);
    }

    // Karakter yeni bir yüksekliğe çıkarsa kamera takip etsin
    if (player.y < this.cameras.main.scrollY + jumpPower / 3) {
        this.cameras.main.scrollY = player.y - jumpPower / 3;
    }
    if (player.y > this.cameras.main.scrollY) {
        
    }
}

function createInitialGround(scene) {
    let startGround = ground.create(300, 870)
    startGround.setScale(20, 2);
    startGround.refreshBody();

}

function addPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - 300;
    let platform = platforms.create(x, y);
    platform.setScale(5, 0.5)
    platform.refreshBody();
    lastPlatformY = y;

    //sadece üstten collision
    player.body.checkCollision.up = false;
    player.body.checkCollision.left = false;
    player.body.checkCollision.right = false;
}
function startingJump() {
    player.setVelocityY(-1100);
}

function jump(player, platform) {
    if (player.body.velocity.y > 0) {
        // Dinamik zıplama kuvveti
        player.setVelocityY(-jumpPower);
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
