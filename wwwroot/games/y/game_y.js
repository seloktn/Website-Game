// ------------------- Start Scene -------------------

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        this.load.image('background', 'assets_y/background.png');
        this.load.image('player', 'assets_y/shoppingCart (1).png');
        //this.load.image('coin', 'assets_y/coin.png');
        this.load.image('bomb', 'assets_y/bombCopy.png');
        this.load.image('heart', 'assets_y/heart.PNG');
        this.load.image('ice-cube', 'assets_y/ice_cube.PNG');

        this.load.image('cashier', 'assets_y/ui/cashier.png');
        this.load.image('start-button', 'assets_y/ui/start-button.png');
        this.load.image('table', 'assets_y/ui/table.png');
        this.load.image('game-title', 'assets_y/ui/game-title.png');
        this.load.image('sound-on', 'assets_y/ui/sound-on.png');    // Ses açık ikonu
        this.load.image('sound-off', 'assets_y/ui/sound-off.png');  // Ses kapalı ikonu


        this.load.audio('background-music', 'assets_y/sounds/backgroundMusic.mp3');
        this.load.audio('gameover-sound', 'assets_y/sounds/gameover.mp3');
        this.load.audio('buttonClick', 'assets_y/sounds/button-click.mp3');
        this.load.audio('cashier-sound', 'assets_y/sounds/cashier.mp3');





    }

    create() {
        this.recommendedImages = [];

        fetch('/api/product/recommendedImages')
            .then(res => res.json())
            .then(images => {
                this.recommendedImages = images;
            });

        this.sound.stopAll();
        this.buttonClickSound = this.sound.add('buttonClick');
        this.cashierSound = this.sound.add('cashier-sound');


        // Arka plan
        let background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setDisplaySize(1000, 600);

        // SES BUTONU
        this.isSoundOn = true;
        this.soundButton = this.add.image(950, 50, 'sound-on');
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

        this.backgroundMusic = this.sound.add('background-music', { loop: true, volume: 0.5 });
        this.backgroundMusic.play();

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


        // Game title image 
        let titleImage = this.add.image(500, 130, 'game-title');
        titleImage.setOrigin(0.5, 0.5);
        titleImage.setScale(0.8);

        // Title image animasyon
        this.tweens.add({
            targets: titleImage,
            scaleX: { from: titleImage.scaleX, to: titleImage.scaleX * 1.05 },
            scaleY: { from: titleImage.scaleY, to: titleImage.scaleY * 1.05 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Düşen nesneler efekti
        // this.createFallingObjects();

        // Oyun açıklaması
        /* let instructionsText = this.add.text(500, 420, 'Altınları topla, bombalardan kaçın!\nBuz küplerinden uzak dur ve kalpleri topla!', {
             fontSize: '24px',
             fontFamily: 'Arial', // Geçici font
             fill: '#fff',
             stroke: '#000',
             strokeThickness: 4,
             align: 'center'
         });
         instructionsText.setOrigin(0.5, 0.5);
         
         // Açıklama metni için fade animasyonu
         this.tweens.add({
             targets: instructionsText,
             alpha: { from: 0.7, to: 1 },
             duration: 1500,
             yoyo: true,
             repeat: -1
         });
     */
        // Masa
        let table = this.add.image(500, 535, 'table');
        table.setScale(1.2);
        table.setDepth(0);
        // Kasa
        let cashier = this.add.image(510, 400, 'cashier');
        cashier.setScale(0.4);
        cashier.setDepth(1);

        // Buton
        let startButton = this.add.image(568, 450, 'start-button');
        startButton.setScale(0.38);
        startButton.setInteractive({ useHandCursor: true });
        startButton.setDepth(2);


        // Buton için pulse efekti
        let buttonTween = this.tweens.add({
            targets: [startButton],
            scaleX: { from: startButton.scaleX, to: startButton.scaleX * 1.1 },
            scaleY: { from: startButton.scaleY, to: startButton.scaleY * 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Buton efektleri
        startButton.on('pointerover', () => {
            startButton.setScale(0.4);
            buttonTween.pause();
        });

        startButton.on('pointerout', () => {
            startButton.setScale(0.38);
            buttonTween.resume();
        });

        startButton.on('pointerdown', () => {
            //  this.buttonClickSound.play();
            this.cashierSound.play();
            startButton.disableInteractive();


            startButton.setVisible(false);

            // Kasa soldan dışarı hareket etsin
            this.tweens.add({
                targets: cashier,
                x: -300,
                angle: -15,
                scale: 0.3,
                duration: 1300,
                ease: 'Power2'
            });

            // Masa sağdan dışarı hareket etsin
            this.tweens.add({
                targets: table,
                x: 1600,
                duration: 900,
                ease: 'Power2',
                onComplete: () => {
                    // Animasyonlar bittikten sonra geçiş efekti
                    let transition = this.add.rectangle(0, 0, 1000, 600, 0x000000, 0);
                    transition.setOrigin(0, 0);

                    this.tweens.add({
                        targets: transition,
                        alpha: 1,
                        duration: 500,
                        onComplete: () => {
                           this.scene.start('GameScene', { images: this.recommendedImages });
                        }
                    });
                }
            });
        });

    }
    /*
    createFallingObjects() {
        // Düşen nesneler - dekoratif amaçlı
        const createRandomObject = () => {
            const x = Phaser.Math.Between(50, 950);
            const y = -50;
            
            // Rastgele nesne seçimi (para, bomba, kalp veya buz)
            const objectTypes = ['coin', 'bomb', 'heart', 'ice-cube'];
            const randomIndex = Phaser.Math.Between(0, objectTypes.length - 1);
            const objectType = objectTypes[randomIndex];
            
            let object = this.add.image(x, y, objectType);
            
            // Nesne tipine göre boyut ayarla
            if (objectType === 'coin') {
                object.setScale(0.15);
            } else if (objectType === 'bomb') {
                object.setScale(0.15);
            } else {
                object.setScale(0.05);
            }
            
            // Düşme animasyonu
            this.tweens.add({
                targets: object,
                y: 650,
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Linear',
                onComplete: () => {
                    object.destroy();
                }
            });
            
            // Dönme animasyonu
            this.tweens.add({
                targets: object,
                angle: 360,
                duration: 2000,
                repeat: -1
            });
        };
        
        // Belirli aralıklarla düşen nesneler oluştur
        this.time.addEvent({
            delay: 800,
            callback: createRandomObject,
            callbackScope: this,
            repeat: -1
        });
    }
    */

    update() {

    }
}


// ------------------- Game Scene -------------------
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.recommendedImages = data.images || [];
    }

    preload() {
        this.load.image('background', 'assets_y/background.png');
        this.load.image('player', 'assets_y/shoppingCart (1).png');
        //this.load.image('coin', 'assets_y/coin.png');
        this.load.image('bomb', 'assets_y/bombCopy.png');
        this.load.image('heart', 'assets_y/heart.png')
        this.load.image('ice-cube', 'assets_y/ice_cube.PNG')
        this.load.image('trophy', 'assets_y/trophy.png');
        this.load.image('tekrar-oyna', 'assets_y/ui/tekrar-oyna.png');
        this.load.image('skor-panel', 'assets_y/ui/skor-panel.png');
        this.load.image('sound-on', 'assets_y/ui/sound-on.png');
        this.load.image('sound-off', 'assets_y/ui/sound-off.png');
        this.load.image('explosion', 'assets_y/ui/explosion.png');
        this.load.image('ice-break', 'assets_y/ui/ice-break.png');




        this.load.audio('victory-sound', 'assets_y/sounds/victory.mp3');
        this.load.audio('coin-sound', 'assets_y/sounds/coin.mp3');
        this.load.audio('bomb-sound', 'assets_y/sounds/bomb.mp3');
        this.load.audio('ice-sound', 'assets_y/sounds/ice.mp3');
        this.load.audio('unfreeze-sound', 'assets_y/sounds/unfreeze.mp3');
        this.load.audio('heart-sound', 'assets_y/sounds/heart.mp3');


    }

    create() {

        this.bombSound = this.sound.add('bomb-sound');
        this.coinSound = this.sound.add('coin-sound');
        this.gameOverSound = this.sound.add('gameover-sound');
        this.victorySound = this.sound.add('victory-sound');
        this.iceSound = this.sound.add('ice-sound');
        this.unfreezeSound = this.sound.add('unfreeze-sound');
        this.heartSound = this.sound.add('heart-sound');




        // Değişkenler
        this.ground;
        this.player;
        this.gameActive = true;
        this.lastPlayerX = null;
        this.dragging = false;
        this.dragOffset = 0;

        this.items;
        this.itemSpawnTimer = 0;
        this.itemSpawnInterval = 0;

        this.bombs;
        this.bombSpawnTimer = 0;
        this.bombSpawnInterval = 0;

        this.iceCubes;
        this.isPlayerFrozen = false;
        this.iceCubeSpawnTimer = 0;
        this.iceCubeSpawnInterval = 0;
        this.freezeDuration = 3000;

        this.hearts;
        this.heartSpawnTimer = 0;
        this.heartSpawnInterval = 0;
        this.heartsLeft = 3;
        this.heartsLeftText;

        this.itemScore = 0;
        this.itemScoreText;

        this.trophy;
        this.currentDifficulty = null;

        // Physics world bounds
        this.physics.world.setBounds(0, 0, config.width, config.height);

        // Arka plan oluşturma
        let background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setDisplaySize(config.width, config.height);

        // --- SES BUTONUNU KOY
        this.isSoundOn = !this.sound.mute;
        this.soundButton = this.add.image(950, 50, this.isSoundOn ? 'sound-on' : 'sound-off');
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

        // Zemin oluşturma
        this.ground = this.physics.add.staticImage(config.width / 2, config.height - 10, null);
        this.ground.displayWidth = config.width;
        this.ground.displayHeight = 20;
        this.ground.refreshBody();
        this.ground.visible = false;

        // Player oluşturma
        this.player = this.physics.add.sprite(config.width / 2, this.ground.y - 50, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.2);

        // Player ile zemin arasında çarpışma oluşturma
        this.physics.add.collider(this.player, this.ground);

        // Buz kırılma efekti (başta görünmesin)
        this.iceBreakEffect = this.add.image(this.player.x, this.player.y, 'ice-break');
        this.iceBreakEffect.setScale(0.4); // istediğin büyüklükte ayarla
        this.iceBreakEffect.setVisible(false);
        this.iceBreakEffect.setDepth(2); // Oyuncunun üstünde olsun


        // Kontroller: mouse ile x ekseninde hareket etme
        this.input.on('pointermove', function (pointer) {
            if (this.player && this.gameActive && !this.isPlayerFrozen) {
                this.player.x = Phaser.Math.Clamp(pointer.x, 0, config.width);
            }
        }, this);

        this.input.on('pointerdown', function (pointer) {
            if (!this.isPlayerFrozen && this.gameActive) {
                // Parmağın karakter üstüne geldiği noktadaki farkı al
                this.dragOffset = pointer.x - this.player.x;
                this.dragging = true;
            }
        }, this);

        this.input.on('pointermove', function (pointer) {
            if (this.dragging && !this.isPlayerFrozen && this.gameActive) {
                // Parmağın yeni pozisyonuna göre karakteri taşı
                this.player.x = Phaser.Math.Clamp(pointer.x - this.dragOffset, 0, config.width);
            }
        }, this);

        this.input.on('pointerup', function (pointer) {
            this.dragging = false;
        }, this);

        // Itemler
        this.items = this.physics.add.group();
        this.physics.add.overlap(this.player, this.items, this.collectCoin, null, this);

        // Bomba
        this.bombs = this.physics.add.group();
        this.physics.add.overlap(this.player, this.bombs, this.hitBomb, null, this);

        // Buz küpü
        this.iceCubes = this.physics.add.group();
        this.physics.add.overlap(this.player, this.iceCubes, this.hitIceCubes, null, this);

        // Can
        this.hearts = this.physics.add.group();
        this.physics.add.overlap(this.player, this.hearts, this.collectHeart, null, this);

        // Kupa
        this.trophy = this.physics.add.sprite(config.width / 2, -200, 'trophy');
        this.trophy.setScale(0.2);
        this.trophy.body.setAllowGravity(false);
        this.physics.add.collider(this.trophy, this.ground);
        this.physics.add.overlap(this.player, this.trophy, this.winGame, null, this);

        // Score image
        this.skor = this.add.image(120, 40, 'skor-panel');
        this.skor.setScale(0.3); // Adjust scale as needed
        this.skor.setOrigin(0.5);

        // Score value text
        this.itemScoreText = this.add.text(150, 39, '0', {
            fontSize: '20px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fill: '#ffd700',
            stroke: '#990000',
            strokeThickness: 4
        });
        this.itemScoreText.setOrigin(0, 0.5);
        this.itemScoreText.setScrollFactor(0);


        this.heartIcons = [];
        for (let i = 0; i < 3; i++) {
            let heart = this.add.image(230 + (i * 16), 40, 'heart');
            heart.setScale(0.02);
            heart.setOrigin(0.5);
            heart.setScrollFactor(0);
            this.heartIcons.push(heart);
        }

        // İlk zorluk seviyesini ayarla
        this.setDifficulty('easy');


        // BUNU KALDIR SONRA 
        this.input.keyboard.on('keydown-W', () => {
            this.scene.start('WinScene', { score: 1234 });
        });
        // BUNU KALDIR SONRA 
        this.input.keyboard.on('keydown-G', () => {
            this.scene.start('GameOverScene', { score: 100 });
        });

    }


    update(time, delta) {
        if (!this.gameActive) return;

        // Karakter nereye giderse oraya baksın
        if (this.lastPlayerX !== null) {
            if (this.player.x > this.lastPlayerX) {
                this.player.setFlipX(true); // Sağa gidiyor
            } else if (this.player.x < this.lastPlayerX) {
                this.player.setFlipX(false); // Sola gidiyor
            }
        }

        this.lastPlayerX = this.player.x;

        // Zorluk ayarı
        if (this.itemScore < 100) {
            this.setDifficulty('easy');
        }
        else if (this.itemScore < 200) {
            this.setDifficulty('medium');
        }
        else if (this.itemScore < 500) {
            this.setDifficulty('hard');
        }
        else if (this.itemScore < 1000) {
            this.setDifficulty('veryhard');
        }
        else if (this.itemScore >= 1000) {
            this.clearScreen();
            this.trophy.setVelocityY(200);
        }

        // Item spawn etme
        this.itemSpawnTimer += delta;
        if (this.itemSpawnTimer >= this.itemSpawnInterval) {
            this.addItem();
            this.itemSpawnTimer = 0;
        }

        // Bomb spawn etme
        this.bombSpawnTimer += delta;
        if (this.bombSpawnTimer >= this.bombSpawnInterval) {
            this.addBomb();
            this.bombSpawnTimer = 0;
        }

        // Kalp spawn etme
        this.heartSpawnTimer += delta;
        if (this.heartSpawnTimer >= this.heartSpawnInterval) {
            this.addHeart();
            this.heartSpawnTimer = 0;
        }

        // Buz küpü spawn etme
        this.iceCubeSpawnTimer += delta;
        if (this.iceCubeSpawnTimer >= this.iceCubeSpawnInterval) {
            this.addIceCube();
            this.iceCubeSpawnTimer = 0;
        }

        // Kaçırılan itemleri yok et
        this.items.children.each((item) => {
            if (item.y > config.height + 50) {
                item.destroy();
            }
        });

        // Kaçırılan bombaları yok et
        this.bombs.children.each((bomb) => {
            if (bomb.y > config.height + 50) {
                bomb.destroy();
            }
        });

        // Kaçırılan canları yok et
        this.hearts.children.each((heart) => {
            if (heart.y > config.height + 50) {
                heart.destroy();
            }
        });

        // Kaçırılan buzları yok et
        this.iceCubes.children.each((iceCube) => {
            if (iceCube.y > config.height + 50) {
                iceCube.destroy();
            }
        });

        if (this.iceBreakEffect) {
            this.iceBreakEffect.x = this.player.x;
            this.iceBreakEffect.y = this.player.y;
        }

    }

    addItem() {
    if (!this.recommendedImages || this.recommendedImages.length === 0) return;

    let x = Phaser.Math.Between(50, config.width - 50);
    let y = Phaser.Math.Between(-100, -300);
    
    let imageUrl = Phaser.Utils.Array.GetRandom(this.recommendedImages);
    let imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));

    if (!this.textures.exists(imageName)) {
        this.load.image(imageName, imageUrl);
        this.load.once('filecomplete-image-' + imageName, () => {
            let item = this.items.create(x, y, imageName);
            item.setScale(0.12);
        });
        this.load.start();
    } else {
        let item = this.items.create(x, y, imageName);
        item.setScale(0.12);
    }
}


    collectCoin(player, item) {
        item.destroy();
        this.coinSound.play();
        this.itemScore += 10;
        this.itemScoreText.setText(this.itemScore);
    }

    addBomb() {
        let x = Phaser.Math.Between(50, config.width - 50);
        let y = Phaser.Math.Between(-100, -300);
        let bomb = this.bombs.create(x, y, 'bomb');
        bomb.setScale(0.15);
        bomb.setAngularVelocity(Phaser.Math.Between(-150, 150));
    }

    addHeart() {
        let x = Phaser.Math.Between(50, config.width - 50);
        let y = Phaser.Math.Between(-100, -300);
        let heart = this.hearts.create(x, y, 'heart');
        heart.setScale(0.05);
        heart.setAngularVelocity(Phaser.Math.Between(-150, 150));

    }

    addIceCube() {
        let x = Phaser.Math.Between(50, config.width - 50);
        let y = Phaser.Math.Between(-100, -300);
        let iceCube = this.iceCubes.create(x, y, 'ice-cube');
        iceCube.setScale(0.05);
        iceCube.setAngularVelocity(Phaser.Math.Between(-150, 150));

    }

    clearScreen() {
        this.items.clear(true, true);
        this.bombs.clear(true, true);
        this.hearts.clear(true, true);
        this.iceCubes.clear(true, true);
    }

    hitBomb(player, bomb) {
        this.bombSound.play();
        // Patlama efekti oluştur
        let explosion = this.add.image(bomb.x, bomb.y, 'explosion');
        explosion.setScale(0.5); // İstersen ayarla
        explosion.setDepth(10); // Önde gözükmesi için

        // Patlama efekti yavaşça kaybolsun
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
        if (this.heartsLeft > 1) {
            this.cameras.main.shake(200, 0.01);
            this.heartsLeft--;
            let lastHeartIndex = this.heartsLeft;
            this.heartIcons[lastHeartIndex].setVisible(false);
            bomb.destroy();
            player.setTint(0xff0000);

            // 1 saniye sonra tinti temizle
            this.time.delayedCall(1000, () => {
                player.clearTint();
            });
        }
        else {
            // --- YENİDEN YAZIYORUZ ---
            this.gameActive = false;

            // 1. Oyun fiziklerini duraklat
            this.physics.pause();

            // 2. Inputu kapat
            this.input.enabled = false;

            // 3. Player'ı dondur
            player.setTint(0xff0000);
            bomb.setTint(0xff0000);
            this.heartIcons[0].setVisible(false);

            // 4. Bomba sesini çal
            this.bombSound.play();

            // 5. Bomba sesi bitince gameover müziği çal ve sahne değiştir
            this.time.delayedCall(this.bombSound.duration * 1000, () => {
                // Bomba sesi bittikten sonra sadece gameover sesi çalacak
                this.gameOverSound.play();

                // Gameover sesi bittikten sonra sahne değiştir
                this.time.delayedCall(this.gameOverSound.duration * 1000, () => {
                    this.scene.start('GameOverScene', { score: this.itemScore });
                });
            });
        }
    }

    hitIceCubes(player, iceCube) {
        this.isPlayerFrozen = true;
        player.setTint(0x87cefa); // açık mavi: #87CEFA
        this.iceSound.play();
        iceCube.destroy();

        this.time.delayedCall(this.freezeDuration, () => {
            this.isPlayerFrozen = false;
            this.player.clearTint();
            this.unfreezeSound.play();

            // BUZ KIRILMA efekti göster
            this.iceBreakEffect.setVisible(true);
            this.iceBreakEffect.setAlpha(1); // tamamen görünür yap

            // 0.5 saniyede kaybolsun
            this.tweens.add({
                targets: this.iceBreakEffect,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.iceBreakEffect.setVisible(false);
                }
            });
        });

    }

    collectHeart(player, heart) {
        if (this.heartsLeft < 3) {
            this.heartsLeft++;

            let heartIndex = this.heartsLeft - 1;
            this.heartIcons[heartIndex].setVisible(true);

            heart.destroy();

            // Kalp sesi çal
            this.heartSound.play();
        }
        else {
            heart.destroy();
        }
    }

    setDifficulty(difficulty) {
        // şu anki zorluk seviyesini sakla
        if (this.currentDifficulty === difficulty) {
            return; // Zaten aynı zorluk seviyesindeyse değiştirme
        }

        this.currentDifficulty = difficulty;

        switch (difficulty) {
            case 'easy':
                this.itemSpawnInterval = 2000;
                this.bombSpawnInterval = 5000;
                this.heartSpawnInterval = 10000;
                this.iceCubeSpawnInterval = 8000;
                break;
            case 'medium':
                this.itemSpawnInterval = 1000;
                this.bombSpawnInterval = 2000;
                this.heartSpawnInterval = 10000;
                this.iceCubeSpawnInterval = 8000;
                break;
            case 'hard':
                this.itemSpawnInterval = 750;
                this.bombSpawnInterval = 1250;
                this.heartSpawnInterval = 10000;
                this.iceCubeSpawnInterval = 7500;
                break;
            case 'veryhard':
                this.itemSpawnInterval = 500;
                this.bombSpawnInterval = 750;
                this.heartSpawnInterval = 7500;
                this.iceCubeSpawnInterval = 5000;
                break;
            default:
                this.itemSpawnInterval = 2000;
                this.bombSpawnInterval = 5000;
                this.heartSpawnInterval = 10000;
                this.iceCubeSpawnInterval = 8000;
        }
    }

    winGame(player, trophy) {
        trophy.destroy();
        this.gameActive = false;
        player.setTint(0x00ff00);

        this.victorySound.play()

        // Win ekranına geç
        this.time.delayedCall(1500, () => {
            this.scene.start('WinScene', { score: this.itemScore });
        });
    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    preload() {
        this.load.image('background', 'assets_y/background.png');
        this.load.image('bomb', 'assets_y/bombCopy.png');
        this.load.image('start-button', 'assets_y/ui/start-button.png');
        this.load.image('game-over', 'assets_y/ui/game-over.png');
        this.load.image('skor', 'assets_y/ui/skor.png');
        this.load.image('receipt', 'assets_y/ui/receipt.png');
        this.load.image('toptan', 'assets_y/ui/toptan.png');
        this.load.image('tekrar-oyna', 'assets_y/ui/tekrar-oyna.png');
        this.load.image('sound-on', 'assets_y/ui/sound-on.png');
        this.load.image('sound-off', 'assets_y/ui/sound-off.png');

        this.load.audio('button-click', 'assets_y/sounds/button-click.mp3');

    }

    create() {
        this.buttonClickSound = this.sound.add('button-click');

        // Arka plan with darkened overlay
        let background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setDisplaySize(1000, 600);
        background.setTint(0x999999); // Darken the background

        // --- SES BUTONUNU KOY
        this.isSoundOn = !this.sound.mute;
        this.soundButton = this.add.image(950, 50, this.isSoundOn ? 'sound-on' : 'sound-off');
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

        // Add a dark overlay
        let overlay = this.add.rectangle(0, 0, 1000, 600, 0x000000, 0.5);
        overlay.setOrigin(0, 0);

        // Create receipt container (for all receipt elements)
        const receiptContainer = this.add.container(500, 800);

        // Add receipt image
        const receipt = this.add.image(0, 0, 'receipt');
        receipt.setOrigin(0.5);
        receipt.setScale(0.8);
        receiptContainer.add(receipt);

        // Add toptan image above game over image
        const toptanImage = this.add.image(0, -200, 'toptan');
        toptanImage.setOrigin(0.5);
        toptanImage.setScale(0.6);
        toptanImage.setAngle(-5);
        toptanImage.setTint(0x999999);
        receiptContainer.add(toptanImage);

        // Add game over image on the receipt with an angle
        const gameOverImage = this.add.image(14, -110, 'game-over');
        gameOverImage.setOrigin(0.5);
        gameOverImage.setScale(0.4);
        gameOverImage.setAngle(-5);
        receiptContainer.add(gameOverImage);

        // Add score label and value on the receipt
        const scoreLabel = this.add.image(-6, -1, 'skor');
        scoreLabel.setOrigin(0.5);
        scoreLabel.setScale(0.21);
        scoreLabel.setAngle(-5);
        receiptContainer.add(scoreLabel);

        const scoreValueX = 78;

        // Add score value text
        const scoreValue = this.add.text(scoreValueX, -8, `${this.finalScore}`, {
            fontSize: '26px',
            fontFamily: 'monospace',
            fill: '#666666',
            fontWeight: 'bold'
        });
        scoreValue.setOrigin(0, 0.5);
        scoreValue.setAngle(-5);
        receiptContainer.add(scoreValue);

        // tekrar-oyna button
        const restartButton = this.add.image(538, 370, 'tekrar-oyna');
        restartButton.setScale(0);
        restartButton.setAngle(-6);
        restartButton.setInteractive({ useHandCursor: true });

        // Button interactions
        restartButton.on('pointerover', () => {
            restartButton.setScale(0.62);
        });

        restartButton.on('pointerout', () => {
            restartButton.setScale(0.6);
        });

        restartButton.on('pointerdown', () => {
            restartButton.setScale(0.58);
        });

        restartButton.on('pointerup', () => {
            this.buttonClickSound.play();
            this.scene.start('StartScene');
        });

        // receipt animation
        this.tweens.add({
            targets: receiptContainer,
            y: 300, // Final position
            duration: 1000,
            ease: 'Power2',
            delay: 500,
            onComplete: () => {
                // Animate button appearance after receipt animation completes
                this.tweens.add({
                    targets: restartButton,
                    scale: 0.6, // Final size
                    duration: 500,
                    ease: 'Back.out',
                    delay: 100
                });
            }
        });
    }
}

class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    preload() {
        this.load.image('background', 'assets_y/background.png');
        //this.load.image('coin', 'assets_y/coin.png');
        this.load.image('tekrar-oyna-win', 'assets_y/ui/tekrar-oyna-win.png');
        this.load.image('tebrikler', 'assets_y/ui/tebrikler.png');
        this.load.image('skor-panel', 'assets_y/ui/skor-panel.png');
        this.load.image('sound-on', 'assets_y/ui/sound-on.png');
        this.load.image('sound-off', 'assets_y/ui/sound-off.png');

        this.load.audio('button-click', 'assets_y/sounds/button-click.mp3');

    }

    create() {
        this.buttonClickSound = this.sound.add('button-click');
        // SES BUTONU
        this.isSoundOn = !this.sound.mute; // Mevcut mute durumunu oku
        this.soundButton = this.add.image(950, 50, this.isSoundOn ? 'sound-on' : 'sound-off');
        this.soundButton.setOrigin(0.5);
        this.soundButton.setScale(0.2);
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


        // Background
        let background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setDisplaySize(1000, 600);

        // --- SES BUTONUNU KOY
        this.isSoundOn = !this.sound.mute;
        this.soundButton = this.add.image(950, 50, this.isSoundOn ? 'sound-on' : 'sound-off');
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

        // Add subtle overlay
        let overlay = this.add.rectangle(0, 0, 1000, 600, 0xffff00, 0.1);
        overlay.setOrigin(0, 0);

        // tebrikler image
        let congratsImage = this.add.image(515, 190, 'tebrikler');
        congratsImage.setOrigin(0.5);
        // You may need to adjust the scale based on your image size
        congratsImage.setScale(0.5);

        // animation
        this.tweens.add({
            targets: congratsImage,
            y: congratsImage.y + 5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Create a container for score elements
        let scoreContainer = this.add.container(400, 420);

        // Add the "TOPLAM SKOR" image
        let scoreLabelImg = this.add.image(222, -10, 'skor-panel');
        scoreLabelImg.setOrigin(1, 0.5); // Right-align the label
        scoreLabelImg.setScale(0.35);
        scoreContainer.add(scoreLabelImg);

        // Add score 
        let scoreValueText = this.add.text(145, -10, `${this.finalScore}`, {
            fontSize: '20px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fill: '#ffd700',
            stroke: '#990000',
            strokeThickness: 4
        });
        scoreValueText.setOrigin(0, 0.5); // Left-align the value
        scoreContainer.add(scoreValueText);

        // Restart button
        let restartButton = this.add.image(518, 520, 'tekrar-oyna-win');
        restartButton.setScale(0.45);
        restartButton.setInteractive({ useHandCursor: true });

        // Button effects
        restartButton.on('pointerover', () => {
            restartButton.setScale(0.5);
        });

        restartButton.on('pointerout', () => {
            restartButton.setScale(0.45);
        });

        restartButton.on('pointerdown', () => {
            restartButton.setScale(0.42);
        });

        restartButton.on('pointerup', () => {
            this.buttonClickSound.play();
            this.scene.start('StartScene');
        });
    }
}

// ------------------- Config -------------------
const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
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