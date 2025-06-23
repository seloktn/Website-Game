// ------------------- Start Scene -------------------

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }



    preload() {
        this.load.image('start-button', 'assets_w/ui/start-button.png');
        this.load.image('game-title', 'assets_w/ui/title.png');
        this.load.image('sound-on', 'assets_w/ui/sound-on-white.png');    // Ses açık ikonu
        this.load.image('sound-off', 'assets_w/ui/sound-off-white.png');  // Ses kapalı ikonu
        this.load.image('start', 'assets_w/ui/start.png');
    }

    create() {
        this.recommendedImages = [];

        this.background = this.add.image(config.width / 2, config.height / 2, 'start');

        // SES BUTONU
        this.isSoundOn = true;
        this.soundButton = this.add.image(config.width - 50, 50, 'sound-on');
        this.soundButton.setDepth(10);
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

        // Glow efekti
        let glowGraphics = this.add.graphics();
        glowGraphics.fillStyle(0xffff00, 0.1);
        glowGraphics.fillRect(0, 0, 1000, 600);

        this.tweens.add({
            targets: glowGraphics,
            alpha: { from: 0.1, to: 0.2 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Buton (ilk başta işlevsiz)
        let startButton = this.add.image(config.width / 2, config.width / 2 + 50, 'start-button');
        startButton.setScale(0.4);
        startButton.setInteractive({ useHandCursor: true });
        startButton.setDepth(2);

        // Pulse efekt
        let buttonTween = this.tweens.add({
            targets: [startButton],
            scaleX: { from: startButton.scaleX, to: startButton.scaleX * 1.1 },
            scaleY: { from: startButton.scaleY, to: startButton.scaleY * 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        startButton.on('pointerover', () => {
            startButton.setScale(0.45);
            buttonTween.pause();
        });

        startButton.on('pointerout', () => {
            startButton.setScale(0.4);
            buttonTween.resume();
        });


        fetch('/api/product/recommendedImages')
            .then(res => res.json())
            .then(images => {
                this.recommendedImages = images;

                startButton.on('pointerdown', () => {
                    startButton.disableInteractive();
                    startButton.setVisible(false);
                    this.scene.start('GameScene', { images: this.recommendedImages });
                });
            });
    }

}

// ------------------- GameScene -------------------
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    init(data) {
        this.recommendedImages = data.images || [];
        this.loadedImageKeys = new Set();
    }


    preload() {
        this.load.image('cloud', 'assets_w/background/cloud.png');
        this.load.image('background', 'assets_w/background/wizard-castle.png');
        this.load.image('moon', 'assets_w/background/moon.png');
        this.load.image('raindrop', 'assets_w/background/raindrop.png');
        this.load.image('fog', 'assets_w/background/fog.png');
        this.load.image('background-space', 'assets_w/background/background-space.png')

        //this.load.image('item', 'assets_w/coin.png');
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
    }

    create() {
        this.gameActive = true;

        this.input.keyboard.on('keydown-J', () => {
            this.handleGameWin();
        });

        this.input.keyboard.on('keydown-K', () => {
            this.scene.start('WinScene');
        });

        this.input.keyboard.on('keydown-L', () => {
            this.scene.start('GameOverScene');
        });

        this.startTime = Date.now();

        this.itemSpawnInterval = 1000; // item spawn aralığı
        this.itemSpawnTimer = 0;
        this.bombSpawnInterval = 2000; // 2 saniyede bir bomba spawn etme
        this.bombSpawnTimer = 0;

        this.hearts = 3; // Oyuncunun canı
        this.arrowsFired = 0;
        this.spawnedItems = 0;
        this.spawnedBombs = 0;
        this.spawnedTrophy = 0;
        this.itemsHit = 0;
        this.bombsHit = 0;
        this.didWin = false;
        this.durationMs = 0;

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

        this.score = 0;

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
                console.log("arrow destroyed");
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
    }

    addUIElements() {
        // Score image
        this.skor = this.add.image(150, 80, 'skor-panel');
        this.skor.setScale(0.2); // Adjust scale as needed
        this.skor.setOrigin(0.5);
        this.skor.setDepth(15)

        // Score value text
        this.itemScoreText = this.add.text(200, 80, '0', {
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
        this.time.addEvent({
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

        this.trajectoryLine.lineStyle(2, hexColor, 1);

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

    shootArrow(x, y) {
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
        this.arrowsFired++;
    }

    // Item ekleme
    addItem(locY) {
        if (!this.gameActive) return;
        if (!this.recommendedImages || this.recommendedImages.length === 0) return;

        let xArray = [];
        let y, velocity;
        for (let index = config.width / 2 + 100; index < config.width; index += 100) {
            xArray.push(index);
        }
        let x = xArray[Phaser.Math.Between(0, xArray.length - 1)];
        if (locY == 'top') {
            y = Phaser.Math.Between(-100, -300);
            velocity = Phaser.Math.Between(100, 300);
        } else if (locY == 'bottom') {
            y = Phaser.Math.Between(config.height + 100, config.height + 300);
            velocity = Phaser.Math.Between(-100, -300);
        } else {
            console.error('Geçersiz konum: ' + locY);
            return;
        }

        let imageUrl = Phaser.Utils.Array.GetRandom(this.recommendedImages);
        let imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));

        const spawn = () => {
            let item = this.items.create(x, y, imageName);
            item.from = locY;
            item.setScale(0.2);
            item.body.setAllowGravity(false);
            item.setVelocityY(velocity);
            this.spawnedItems++;
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
        this.spawnedBombs++;
    }

    // Iteme vurma işlemi
    hitItem(arrow, item) {
        item.destroy(); // Itemi yok et
        arrow.destroy(); // Okun kendisini yok et
        this.score += 10; // Skoru artır
        this.itemScoreText.setText(this.score); // Yazıyı güncelle

        if (this.score >= 500) {
            this.handleGameWin();
        }
        this.itemsHit++;
    }

    //bomba vurma işlemi
    hitBomb(arrow, bomb) {
        bomb.destroy(); // Bombayı yok et
        arrow.destroy(); // Okun kendisini yok et
        this.bombsHit++;

        if (this.hearts > 0) {
            this.hearts--; // Canı azalt

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
            this.gameActive = false;
            this.clearScreen();
            this.sound.stopAll();
            // GameScene içinde, oyun bittiği anda:
            this.scene.start('GameOverScene', {
                sessionToken: 'abc123',
                score: this.score,
                arrowsFired: this.arrowsFired,
                spawnedItems: this.spawnedItems,
                spawnedBombs: this.spawnedBombs,
                spawnedTrophy: this.spawnedTrophy,
                itemsHit: this.itemsHit,
                bombsHit: this.bombsHit,
                heartsLeft: this.hearts,
                won: this.didWin,
                durationMs: Date.now() - this.startTime
            });
        }
    }

    clearScreen() {
        this.items.clear(true, true);
        this.bombs.clear(true, true);
        this.arrows.clear(true, true);
    }

    handleGameWin() {
        this.didWin = true;
        this.spawnedTrophy = 1;
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
            this.scene.start('WinScene');
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
        this.load.image('game-over', 'assets_w/ui/game-over.png');
        this.load.image('restart-button', 'assets_w/ui/restart-red.png');
        this.load.image('score-image', 'assets_w/ui/score-image.png');    // Ses açık ikonu
    }

    create(data) {
        // 1) Payload’dan alanları al
        const {
            sessionToken,
            score,
            arrowsFired,
            spawnedItems,
            spawnedBombs,
            spawnedTrophy,
            itemsHit,
            bombsHit,
            heartsLeft,
            won,
            durationMs
        } = data;

        // 2) Fetch ile server’a gönder
        fetch('/api/gamew/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionToken,
                score,
                arrowsFired,
                spawnedItems,
                spawnedBombs,
                spawnedTrophy,
                itemsHit,
                bombsHit,
                heartsLeft,
                won,
                durationMs
            })
        })
            .then(r => { if (!r.ok) throw new Error('Skor gönderilemedi'); return r.json(); })
            .then(j => console.log('✅ Skor gönderildi:', j))
            .catch(e => console.error('❌ Gönderme hatası:', e));
        // "Game Over" Yazısı
        this.gameOverText = this.add.image(this.game.config.width / 2, config.height / 2 - 200, 'game-over')
        this.gameOverText.setOrigin(0.5, 0.5);
        this.gameOverText.setScale(0.75);

        //skor yazısı
        this.FinalScoreText = this.add.text(config.width / 2, config.height / 2 + 120, 'Score : ' + score, {
            fontSize: '50px',
            fontWeight: 'bold',
            fill: '#d00000',
            stroke: '#e85d04',
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
            restartButton.disableInteractive();
            restartButton.setVisible(false);
            this.scene.start('GameScene', { images: this.recommendedImages });
        });

    }
}

class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    preload() {
        this.load.image('win-text', 'assets_w/ui/win.png');
        this.load.image('restart', 'assets_w/ui/restart-green.png')
    }

    create() {

        //kazandınız yazısı
        this.winText = this.add.image(config.width / 2, config.height / 2 - 200, 'win-text');

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
            restartButton.setScale(0.45);
            buttonTween.pause();
        });

        restartButton.on('pointerout', () => {
            restartButton.setScale(0.4);
            buttonTween.resume();
        });

        restartButton.on('pointerdown', () => {
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

//TODO: ateş toplarına dönme ekle
//TODO: sesleri ekle
//* J -> uzay kısmı K -> win ekranı L -> gameover ekranı 