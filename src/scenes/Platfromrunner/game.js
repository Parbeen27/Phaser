let speed = 200;
export default class GameScene extends Phaser.Scene {
    constructor() {
        super('gameScene');
    }
    preload() {
        this.load.pack("game1","assets/PlatformGame/Assets.json");

    }
    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        this.gamecontainer = this.add.container(0,0);
        console.log("Creating game scene...");
        this.physics.world.setBounds(0, 0, 3000, height);
        this.cameras.main.setBounds(0, 0, 3000, height);
     //   this.cameras.main.setZoom(0.5)


        //player
        this.player = this.physics.add.sprite(width / 2,height / 2, "player");  
        this.player.setScale(.2);  
        this.player.body.setSize(this.player.width, this.player.height);
        this.player.body.setOffset(0, 0);
     //   this.player.body.setSize(200, 400);  // tweak these
     //   this.player.body.setOffset(56,20); // tweak these too
     //   this.cameras.main.startFollow(this.player,true,.01,.01);

     //   this.player.body.setSize(this.player.width * 0.6,this.player.height * 0.8);
        this.player.setCollideWorldBounds(true);
        this.player.firerate = 500;
        this.player.firetimer = null;
        this.player.damage = 10;
        this.nextfire = 0;
        // Get platform position
        this.createPlatforms(height);
        let platform = this.platforms.getChildren()[2];
        //enemy
        this.enemy = this.physics.add.sprite(platform.x, platform.y-100, "enemy");
        this.enemy.setScale(.2);
        this.enemy.body.setSize(220, 340);  // tweak these
        this.enemy.body.setOffset(216,10); // tweak these too
        this.enemy.setCollideWorldBounds(true);
        this.enemy.firetimer = null;
        this.enemy.firerange = 300;
        this.enemy.firerate = 200;
        this.enemy.health = 100;
        this.enemy.scoreValue = 50;
        //boss
        this.boss = this.physics.add.sprite(2800, height - 100, "enemy");
        this.boss.setScale(.3);
        this.boss.body.setSize(220, 340);  // tweak these
        this.boss.body.setOffset(216,10); // tweak these too
        this.boss.setCollideWorldBounds(true);
        this.boss.health = 200;
        this.boss.firetimer = null;
        this.boss.firerange = 500;
        this.boss.firerate = 150;
        this.boss.scoreValue = 100;
        this.boss.isboss = true;
        //bullets
        this.enemy.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 20,
            runChildUpdate: false
        });
        this.boss.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 40,
            runChildUpdate: false
        });
        this.player.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 20,
            runChildUpdate: false
        });
        //floor - create platforms FIRST before adding colliders
        this.ground = this.physics.add.staticGroup();
        this.floor = this.ground.create(3000/2,height - 10, "platform").setDisplaySize(3000, 22).setOrigin(0.5, 1).refreshBody();
        
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.enemy, this.ground);
        this.physics.add.collider(this.player,this.platforms);
        this.physics.add.collider(this.enemy,this.platforms);
        this.physics.add.collider(this.boss, this.ground);
        this.physics.add.collider(this.boss, this.platforms);   

        //bullet collisions
        this.physics.add.collider(this.enemy.bullets, this.ground, (bullet) => {
            bullet.disableBody(true,true);
        });
        this.physics.add.collider(this.enemy.bullets, this.platforms, (bullet) => {
            bullet.disableBody(true,true);
        });
        this.physics.add.overlap(this.enemy.bullets, this.player, (player,bullet) => {
            bullet.disableBody(true,true);
            this.PlayerHit(player);
        });
        this.physics.add.collider(this.boss.bullets, this.ground, (bullet) => {
            bullet.disableBody(true,true);
        });
        this.physics.add.collider(this.boss.bullets, this.platforms, (bullet) => {
            bullet.disableBody(true,true);
        });
        this.physics.add.overlap(this.boss.bullets, this.player, (player,bullet) => {
            bullet.disableBody(true,true);
            this.PlayerHit(player);
        });
        this.physics.add.collider(this.player.bullets, this.ground, (bullet) => {
            bullet.disableBody(true,true);
        });
        this.physics.add.collider(this.player.bullets, this.platforms, (bullet) => {
            bullet.disableBody(true,true);
        });
        this.physics.add.overlap(this.player.bullets, this.enemy, (obj1,obj2) => {
            let bullet = obj1;
            let enemy = obj2;
            if (!bullet.texture || bullet.texture.key !== "coin") {
                bullet = obj2;
                enemy = obj1;
            }
            if(!bullet.active || !enemy.active) return; //ignore if either is already destroyed
            bullet.disableBody(true,true);
            this.enemyHit(enemy);
        });
        this.physics.add.overlap(this.player.bullets, this.boss, (obj1,obj2) => {  
            let bullet = obj1;
            let boss = obj2;    
            if (!bullet.texture || bullet.texture.key !== "coin") {
                bullet = obj2;
                boss = obj1;
            }  
            if(!bullet.active || !boss.active) return; //ignore if either is already destroyed
            bullet.disableBody(true,true);
            this.BossHit(boss);
        });

        //coins
        this.coins = this.physics.add.group({
            key: "coin",
            repeat: 4,
         //   setXY: { x: 100, y: 0, stepX: 120 }
        });     
        this.coins.children.iterate(function (child) {
            let x = Phaser.Math.Between(50, 3000 - 50);
            child.setPosition(x, Phaser.Math.Between(0, 100));
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.5));
            child.setScale(.1);
        });


        //ammo
        this.ammocount = 10;
        this.ammoText = this.add.text(16, 80, 'Ammo𖦏: 10', { fontSize: '26px', fill: '#000',fontStyle: 'bold' }).setScrollFactor(0);
        this.ammo = this.physics.add.group({
            key: "bullet",
            repeat: 4,
        });
        this.ammo.children.iterate(function (child) {
            let x = Phaser.Math.Between(50, 3000 - 50);
            child.setPosition(x, Phaser.Math.Between(0, 100));
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.5));
            child.setScale(.05);
        });
        this.physics.add.collider(this.ammo, this.ground);
        this.physics.add.collider(this.ammo, this.platforms);
        this.physics.add.overlap(this.player, this.ammo, (player,bullet) => {
            bullet.disableBody(true,true);
            this.sfx.coin.play();
            this.ammocount += 5;
            this.ammoText.setText('Ammo: ' + this.ammocount);
            this.time.delayedCall(3000, ()=>{
                console.log("respawn",bullet.active);
                const x= Phaser.Math.Between(50,this.scale.width - 50);
                const y = Phaser.Math.Between(0,100);
                bullet.enableBody(true,x,y,true,true);
                bullet.setBounceY(Phaser.Math.FloatBetween(.2,.5));
                bullet.setScale(.05);
                console.log("resp", bullet.active);

         } )
        }, null, this);
        //score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '42px', fill: '#000',fontStyle: 'bold' }).setScrollFactor(0);
        this.physics.add.overlap(this.player, this.coins,(player,coin) => {
            coin.disableBody(true,true);
            this.sfx.coin.play();
            this.score += 10;
            this.scoreText.setText('Score: '+ this.score);
            this.time.delayedCall(3000, ()=>{
                console.log("respawn",coin.active);
                const x= Phaser.Math.Between(50,this.scale.width - 50);
                const y = Phaser.Math.Between(0,100);
                coin.enableBody(true,x,y,true,true);
                coin.setBounceY(Phaser.Math.FloatBetween(.2,.5));
                coin.setScale(.1);
                console.log("resp", coin.active);

         } )
        }, null, this);
        //worldlock
        this.currentenemy = this.boss; //start locked to boss
        this.worldlock = false;
        //drops
        this.ammoDrop = this.physics.add.group({
            key: "bullet",
            maxSize: 10,
            active: false,
            visible: false
        });
        this.gundrop = this.physics.add.group({
            key: "coin",
            maxSize: 5,
            active: false,
            visible: false
        });
        this.physics.add.collider(this.ammoDrop, this.ground);
        this.physics.add.collider(this.ammoDrop, this.platforms);
        this.physics.add.collider(this.gundrop, this.ground);
        this.physics.add.collider(this.gundrop, this.platforms);
        this.physics.add.overlap(this.player, this.ammoDrop, this.collectAmmo,null,this);
        this.physics.add.overlap(this.player, this.gundrop, this.collectGun,null,this);
        //powertimer
        this.powertimer = 0;
        this.powertext = this.add.text(16, 110, '', { fontSize: '16px', fill: '#000' ,fontStyle: 'bold'}).setScrollFactor(0);
        //animations
        this.anims.create({
            key: "run",
            frames:[
                { key: "player", frame: "restored_1" },
                { key: "player", frame: "restored_2" },
                { key: "player", frame: "restored_3" },
                { key: "player", frame: "restored_4" },
                { key: "player", frame: "restored_5" },
                { key: "player", frame: "restored_6" },
                { key: "player", frame: "restored_7" },
                { key: "player", frame: "restored_8" }
            ],
            frameRate: 10,
            repeat: -1
        });

        console.log(this.textures.get("enemy").getFrameNames());
        this.player.play("run");
        //healthbar
        this.playerHealth = 100;
        this.playerHealthtext = this.add.text(16, 50, 'Health+: 100', { fontSize: '26px', fill: '#000',fontStyle: 'bold' }).setScrollFactor(0);
        this.isHit = false;
        // this.physics.add.overlap(this.player, this.enemy.bullets, this.PlayerHit,null,this);
        // this.physics.add.overlap(this.player.bullets, this.enemy, this.enemyHit,null,this);
     //   this.setupCamera();
        //keyboard input
        this.createControls();
        if(this.sys.game.device.os.android || this.sys.game.device.os.iOS){
            this.createMobileControls();
        }
        //back button
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start("menuScene");
        });
        this.backButton = this.add.text(this.scale.width - 100, 20, "Back",{
            fontSize: '24px',
            backgroundColor: '#000',
            padding: { x: 8, y: 4 },
            color: '#fff'
        }).setInteractive().setScrollFactor(0).on('pointerdown', () => {
            this.scene.start("menuScene");});
        //sounds
        this.sfx = {
            jump: this.sound.add("jump"),
            coin: this.sound.add("coinSound"),
            gameOver: this.sound.add("gameOverSound"),
            hit: this.sound.add("hitSound")
        };
        
        this.gamecontainer.add([this.player,...this.platforms.getChildren(),...this.ground.getChildren(),this.enemy,this.boss])
        
        // Create rotation message for mobile
        // Create black overlay for portrait mode
        this.blackOverlay = this.add.rectangle(width / 2, height / 2, width * 2, height * 2, 0x000000, 1)
            .setScrollFactor(0).setDepth(999).setOrigin(0.5);
        this.blackOverlay.setVisible(false);
        
        // Create rotation message for portrait mode
        this.rotationMessage = this.add.text(width / 2, height / 2, 'Please rotate your device\nto landscape mode', {
            fontSize: '48px',
            fill: '#fff',
            align: 'center',
            padding: { x: 20, y: 20 },
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        this.rotationMessage.setVisible(false);
        
        this.scale.on('resize', this.resize,this)
        this.time.delayedCall(50, () => {
            this.resize({width, height})
        })
        this.setupCamera();
        this.lastOrientation = width > height;
    }
    resize(gameSize){
        const w = gameSize?.width || this.scale.width;
        const h = gameSize?.height || this.scale.height;
        
        // Set physics world bounds to accommodate floor position
        if(this.sys.game.device.os.android || this.sys.game.device.os.iOS){
            
        
        this.physics.world.setBounds(0, 0, 3000, h + 150);
        this.cameras.main.setBounds(0, 0, 3000, h + 150); 

        this.createPlatforms(h);

        
        // Floor repositioning - keep at bottom of screen/world
        if(this.floor){
            const nw = 3000;
            const nh = 25;
            // Position floor at the very bottom of the game world
            const floorYPosition = h + 165; // Place well below viewport
            this.floor
                .setDisplaySize(nw, nh)
                .setOrigin(0.5, 1)
                .setPosition(nw/2, floorYPosition)
                .refreshBody();
            const body = this.floor.body;
            if(body && body.setSize){
                body.setSize(nw, nh);
                body.setOffset(0, 0);
                body.updateFromGameObject();
            }
        }
        
        // Player repositioning - position relative to floor
        if(this.player){
            this.player.setPosition(w / 2, h + 50); // Position player above floor
        }
        
        // Enemy repositioning - position on platform or relative to floor
        if(this.enemy && this.platforms){
            let platform = this.platforms.getChildren()[2];
            if(platform){
                this.enemy.setPosition(platform.x, platform.y - 100);
            } else {
                this.enemy.setPosition(w / 2 + 300, h + 50);
            }
        }
        
        // Boss repositioning
        if(this.boss){
            this.boss.setPosition(2800, h - 100);
        }
        this.physics.add.collider(this.player,this.platforms);
        this.physics.add.collider(this.enemy,this.platforms);
        this.physics.add.collider(this.boss, this.platforms);  
        
        // UI Text repositioning (set scroll factor to 0 so they stay on screen)
        if(this.scoreText){
            this.scoreText.setPosition(w-900, h-440).setScrollFactor(0);
        }
        if(this.playerHealthtext){
            this.playerHealthtext.setPosition(w-900, h-380).setScrollFactor(0);
        }
        if(this.ammoText){
            this.ammoText.setPosition(w-900, h-330).setScrollFactor(0);
        }
        if(this.powertext){
            this.powertext.setPosition(w-900, h-300).setScrollFactor(0);
        }
        
        // Back button repositioning
        if(this.backButton){
            this.backButton.setPosition(w + 150 , h-440);
        }
        
        // Check orientation on mobile
        if(this.sys.game.device.os.android || this.sys.game.device.os.iOS){
            const isLandscape = w > h;
            if(this.lastOrientation == isLandscape)return;
            this.lastOrientation = isLandscape;    
    
            this.blackOverlay
                .setPosition(w / 2, h / 2)
                .setDisplaySize(w * 2, h * 2)
                .setVisible(true);

            this.rotationMessage
                .setPosition(w / 2, h / 2)
                .setVisible(true);
            this.scene.restart();
        }
    
}
    }
        createPlatforms(wh) { 
        let x=0;
        let y=wh ;
        //if(this.platforms)this.platforms.clear(true,true);
        this.platforms = this.physics.add.staticGroup();
        while(x<3000){
            const platformwidth = Phaser.Math.Between(120,220);
            const gap = Phaser.Math.Between(220,380);
            x+=gap;
                // Slight height variation (like Mario stairs)
            y += Phaser.Math.Between(-60, 60);
            if(this.sys.game.device.os.android || this.sys.game.device.os.iOS){
                y = Phaser.Math.Clamp(y, wh * 0.5, wh * 67);
            }
            else{
                y = Phaser.Math.Clamp(y, wh * 0.65, wh * 0.77);
            } // Adjusted range to appear higher above ground
            const platform = this.platforms.create(x, y, 'platform').setDisplaySize(platformwidth, 10).setOrigin(0.5,0.3);
            platform.refreshBody();
            x += platformwidth;
        }
     }

        setupCamera() {
            this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
            this.cameras.main.setZoom(Math.min(this.scale.width / 800, this.scale.height / 600));
            this.cameras.main.setBackgroundColor('#87CEEB');
        }
        createControls (){
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keys = this.input.keyboard.addKeys("W,A,S,D");
        };
        createMobileControls(){
            this.leftpress = false;
            this.rightpress = false;
            this.uppress = false;
            this.shootpress = false;
            const h = this.scale.height;
            const w = this.scale.width;
            this.joypointer = null;
            //joystick base
            const joyBaseRadius = Math.max(30, h * 0.01);
            const joyKnobRadius = Math.max(15,h* 0.01)
            const joyBaseX = w * 0.15 ;
            const joyBaseY = h * 0.8;
            this.joybase = this.add.circle(joyBaseX, joyBaseY, joyBaseRadius, 0x888888, 0.5).setScrollFactor(0).setInteractive();
            this.joystick = this.add.circle(joyBaseX, joyBaseY, joyKnobRadius, 0xcccccc, 0.8).setScrollFactor(0);
            this.joyMaxDist = joyBaseRadius;
            // Store for resize handler
            this.joyBaseRadius = joyBaseRadius;
            this.joyKnobRadius = joyKnobRadius;
            this.joyBaseX = joyBaseX;
            this.joyBaseY = joyBaseY;

            const upSize = Math.max(50, w* 0.08)
            const upX = w + 220;
            const upY = h - 90;
            this.upbuttozone = this.add.zone(upX, upY, upSize, upSize).setScrollFactor(0).setInteractive().setOrigin(0.5);
            const upButton = this.add.image(this.upbuttozone.x, this.upbuttozone.y+10, "up").setInteractive().setScrollFactor(0).setScale(upSize/500).setDepth(1001);
            
            const shootSize = Math.max(50, w*0.08)
            const shootX = w + 150;
            const shootY = h - 60;
            this.shootbuttonzone = this.add.zone(shootX, shootY, shootSize, shootSize).setScrollFactor(0).setInteractive().setOrigin(0.5);
            const shootButton = this.add.image(this.shootbuttonzone.x, this.shootbuttonzone.y+10, "shoot").setInteractive().setScrollFactor(0).setScale(shootSize / 500).setDepth(1001);
            //joystick input
            this.input.on("pointerdown", (pointer) => {
                if (pointer.x < w / 2) {
                    this.joypointer = pointer;}
                });
            this.input.on("pointermove", (pointer) => {
                if (this.joypointer === pointer) {
                    const dx = pointer.x - this.joybase.x;
                    const dy = pointer.y - this.joybase.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const angle = Math.atan2(dy,dx);
                    const clampedDist = Math.min(dist, this.joyMaxDist)
                    this.joystick.x = this.joybase.x + Math.cos(angle) * clampedDist;
                    this.joystick.y = this.joybase.y + Math.sin(angle) * clampedDist;
                    if (dx < -joyBaseRadius * 0.4) {
                        this.leftpress = true;
                        this.rightpress = false;
                    } else if (dx > joyBaseRadius * 0.4) {
                        this.leftpress = false;
                        this.rightpress = true;
                    } else {
                        this.leftpress = false;
                        this.rightpress = false;
                    }
                }
            });
            this.input.on("pointerup", (pointer) => {
                if (this.joypointer === pointer) {
                    this.leftpress = false;
                    this.rightpress = false;
                    this.joystick.setPosition(this.joybase.x, this.joybase.y);
                    this.joypointer = null;
        }});
            upButton.on("pointerdown", () =>  {
                this.uppress = true;
                upButton.setTint(0xaaaaaa);});
            upButton.on("pointerup", () => {
                this.uppress = false;
                upButton.clearTint();});
            upButton.on("pointerout", () => {
                this.uppress = false;
                upButton.clearTint();});
            shootButton.on("pointerdown", () => {
                this.shootpress = true;
                shootButton.setTint(0xaaaaaa);});
            shootButton.on("pointerup", () => {
                this.shootpress = false;
                shootButton.clearTint();});
            shootButton.on("pointerout", () => {
                this.shootpress = false;
                shootButton.clearTint();});
            //resize controls on orientation change
            this.scale.on('resize', (gameSize) => {
                const w = gameSize.width;
                const h = gameSize.height;
                // Update joystick positions with new screen dimensions
                const newJoyBaseX = w * 0.15;
                const newJoyBaseY = h * 0.8;
                this.joybase.setPosition(newJoyBaseX, newJoyBaseY);
                this.joystick.setPosition(newJoyBaseX, newJoyBaseY);
                this.upbuttozone.setPosition(w - 160, h - 80);
                upButton.setPosition(w - 160, h - 80);
                this.shootbuttonzone.setPosition(w - 80, h - 80);
                shootButton.setPosition(w - 80, h - 80);
            }); 
        }
        PlayerHit(player){
            if(this.isHit) return; //prevent health loss every frame
            this.isHit = true;
            this.sfx.hit.play();
            //decrease player health
            this.playerHealth -= 10;
            //update health bar
            this.playerHealthtext.setText('Health: ' + this.playerHealth);
            //this.playerHealth.update(this.playerHealth.currentHealth);
            //flash red when hit
            player.setTint(0xff0000);
            //reset tint after 200ms
            this.time.delayedCall(200, () => {
                player.clearTint();
                this.isHit = false;
            });
            //player dies
            if(this.playerHealth <= 0){
                this.playerDies();
            }
        }
        enemyHit(enemy){
            if (!enemy.active) return; //ignore hits on dead enemies
            if(!this.cameras.main.worldView.contains(enemy.x, enemy.y)) return; //ignore if enemy offscreen
            this.sfx.hit.play();
            enemy.health -= this.player.damage;
            enemy.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                if(enemy.active) enemy.clearTint();
            });
            console.log("Enemy hit!",enemy.health);
            if (enemy.health <= 0){
                console.log("Enemy death trigers!");
                if(enemy.firetimer){
                    enemy.firetimer.remove(false);
                    enemy.firetimer = null;
                }
                let dropchance = Phaser.Math.Between(1,100);
                if(dropchance <= 50){
                    const ammo = this.ammoDrop.get(enemy.x, enemy.y);
                    if(ammo){
                        ammo.enableBody(true, enemy.x, enemy.y, true, true);
                        ammo.setBounceY(Phaser.Math.FloatBetween(.2,.5));
                        ammo.setScale(.05);
                    }
                }
                else {
                    const gun = this.gundrop.get(enemy.x, enemy.y);
                    if(gun){
                        gun.enableBody(true, enemy.x, enemy.y, true, true);
                        gun.setBounceY(Phaser.Math.FloatBetween(.2,.5));
                        gun.setScale(.1);
                    }
                }
                enemy.disableBody(true,true);
                enemy.active = false;
                enemy.visible = false;
                this.score += enemy.scoreValue;
                this.scoreText.setText('Score: '+ this.score);
                if (enemy.isboss){
                    this.currentenemy = null;
                    this.worldlock = false; }
            }
        }
        BossHit(enemy){
            if (!enemy.active) return; //ignore hits on dead enemies
            if(!this.cameras.main.worldView.contains(enemy.x, enemy.y)) return; //ignore if enemy offscreen
            this.sfx.hit.play();
            enemy.health -= this.player.damage;
            enemy.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                if(enemy.active) enemy.clearTint();
            });
            console.log("Enemy hit!",enemy.health);
            if (enemy.health <= 0){
                console.log("Enemy death trigers!");
                if(enemy.firetimer){
                    enemy.firetimer.remove(false);
                    enemy.firetimer = null;
                }
                let dropchance = Phaser.Math.Between(1,100);
                if(dropchance <= 50){
                    const ammo = this.ammoDrop.get(enemy.x, enemy.y);
                    if(ammo){
                        ammo.enableBody(true, enemy.x, enemy.y, true, true);
                        ammo.setBounceY(Phaser.Math.FloatBetween(.2,.5));
                        ammo.setScale(.05);
                    }
                }
                else {
                    const gun = this.gundrop.get(enemy.x, enemy.y);
                    if(gun){
                        gun.enableBody(true, enemy.x, enemy.y, true, true);
                        gun.setBounceY(Phaser.Math.FloatBetween(.2,.5));
                        gun.setScale(.1);
                    }
                }
                enemy.disableBody(true,true);
                enemy.active = false;
                enemy.visible = false;
                this.score += enemy.scoreValue;
                this.scoreText.setText('Score: '+ this.score);
                this.worldlock = false;
                this.setupCamera();
                this.scene.start("winScene", { score: this.score });
            }
        }

        playerDies(){
            this.sfx.gameOver.play();
            this.scene.stop('gameScene')
            this.scene.start("gameOverScene");
        } 
        collectAmmo(player,ammo){
            ammo.disableBody(true,true);
            this.sfx.coin.play();
            this.ammocount += 10;
            this.ammoText.setText('Ammo: ' + this.ammocount);
        }
        collectGun(player,gun){
            gun.disableBody(true,true);
            this.sfx.coin.play();
            this.player.damage += 10; //increase player damage as a simple "powerup"
            speed += 50; //increase player speed as a simple "powerup"
            this.poweruptime = 10;
            this.powertext.setText('Power: ' + this.poweruptime);
            if(this.powertimer) this.powertimer.remove();
            this.powertimer = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.poweruptime--;
                    this.powertext.setText('Power: ' + this.poweruptime);
                    if(this.poweruptime <= 0){
                        this.player.damage -= 10; //reset damage after powerup ends
                        speed -= 50; //reset speed after powerup ends
                        this.powertext.setText('');
                        this.powertimer.remove();
                    }
                },
                loop: true
            });
        }
        canSeePlayer(enemy, player) {

            const line = new Phaser.Geom.Line(
                enemy.x, enemy.y,
                player.x, player.y
            );
        
            const platforms = this.platforms.getChildren();
        
            for (let i = 0; i < platforms.length; i++) {
                if (Phaser.Geom.Intersects.LineToRectangle(line, platforms[i].getBounds())) {
                    return false; // platform blocking view
                }
            }
        
            return true; // player visible
            }
        shoot(){
            if(this.ammocount <= 0) return; //no ammo
            this.ammocount--;
            this.ammoText.setText('Ammo: ' + this.ammocount);
            const bullet = this.player.bullets.get(this.player.x, this.player.y);
            if (!bullet) return;
            bullet.enableBody(true, this.player.x, this.player.y, true, true);
            bullet.setTexture("bullet");
            bullet.setFlipX(this.player.flipX);
            bullet.setScale(.05);
            bullet.body.setSize(10,10);
            bullet.body.setAllowGravity(false);
            bullet.setVelocityX(500 * (this.player.flipX ? -1 : 1));
            
            //destroy bullet after 3 seconds to prevent memory leaks
            if(bullet.timer){
                bullet.timer.remove(false);
            }
            bullet.timer = this.time.delayedCall(3000, () => {
                if(bullet.active){
                    bullet.disableBody(true,true);}
            });
        }
        firebullet(enemy,player,group){
            if(!enemy.active || enemy.health <= 0) return; //don't fire if dead
            const bullet = group.get(enemy.x, enemy.y);
            if (!bullet) return; //no available bullets in the pool
            bullet.enableBody(true, enemy.x, enemy.y, true, true);
            bullet.setTexture("bullet");
            bullet.setScale(.05);
         //   bullet.setCollideWorldBounds(false);
            this.physics.moveToObject(bullet, player, 500);
            bullet.body.setSize(10,10);
            bullet.body.setAllowGravity(false);
            bullet.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            //destroy bullet after 3 seconds to prevent memory leaks
            this.time.delayedCall(3000, () => {
                bullet.disableBody(true,true);
            });
            
        }
        handleshooting(character){
            if (!character.active || character.health <= 0) return; //don't shoot if dead
            const Distance = Phaser.Math.Distance.Between(character.x, character.y, this.player.x, this.player.y);
            if (Distance <= character.firerange && this.canSeePlayer(character, this.player)){
                if (!character.firetimer){
                    character.firetimer = this.time.addEvent({
                        delay: character.firerate,
                        callback: () => this.firebullet(character,this.player,character.bullets),
                        loop: true
                    });
                }
            }
            else {
                if(character.firetimer) {
                    character.firetimer.remove();
                    character.firetimer = null; //reset timer if player goes out of range or sight
                    }

        }
        }

    update(time, delta) {
       // if (!this.enemy.hasFired && Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y) <= 300){
       //     this.enemy.hasFired = true;
       //     this.firebullet(this.enemy,this.player,this.bullets);
       // }
       let left = this.cursors.left.isDown || this.keys.A.isDown || this.leftpress;
       let right = this.cursors.right.isDown || this.keys.D.isDown || this.rightpress;
       let jump = this.cursors.up.isDown || this.keys.W.isDown || this.uppress;
       let fireinput = this.cursors.space.isDown || this.shootpress;
       if(!this.worldlock && this.player.x >= 2100){
        this.worldlock = true;
        this.cameras.main.startFollow(this.boss, true, 0.05, 0.05);
        this.cameras.main.setBackgroundColor('#656060');
    }
        if(!this.worldlock){this.setupCamera();}
        if (this.worldlock){
            const cams = this.cameras.main;
            const bounds = new Phaser.Geom.Rectangle(cams.worldView.x, cams.worldView.y, cams.worldView.width, cams.worldView.height);
            if (!bounds.contains(this.player.x, this.player.y)){
                this.player.setVelocity(0);
                this.player.x = Phaser.Math.Clamp(this.player.x, bounds.x + 20, bounds.right - 20);
                this.player.y = Phaser.Math.Clamp(this.player.y, bounds.y + 20, bounds.bottom - 20);
             }}
        this.handleshooting(this.enemy);
        this.handleshooting(this.boss);

        //controls
        if (left){
            this.player.setVelocityX(-speed);
            this.player.play("run", true);
            this.player.setFlipX(true);
        }
        else if (right){
            this.player.setVelocityX(speed);
            this.player.play("run", true);
            this.player.setFlipX(false);
        }
        else {
            this.player.setVelocityX(0);
            this.player.anims.stop();
        }
        if (jump && this.player.body.blocked.down)this.player.setVelocityY(-350),this.sfx.jump.play();
        if (fireinput){
            if(this.time.now > this.nextfire){
                this.shoot();
                this.nextfire = this.time.now + 200;
            }
        }
}

}

