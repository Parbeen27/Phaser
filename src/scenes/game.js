let speed = 200;
export default class GameScene extends Phaser.Scene {
    constructor() {
        super('gameScene');
    }
    preload() {
        console.log("Preloading assets...");
        this.load.atlas(
            "player",
            "/assets/player_run.png",
            "/assets/player_run.json"
        );
        this.load.atlas(
            "enemy",
            "/assets/enemy.png",
            "/assets/enemy.json"
        );
     //   this.load.image("player","/assets/player.png");
        this.load.image("platform","/assets/platform.png");
        this.load.image("coin","/assets/coin.png");
        this.load.audio("jump", "/assets/jump.wav");
        this.load.audio("coinSound", "/assets/coin.wav");
        this.load.audio("gameOverSound", "/assets/gameover.wav");
        this.load.audio("hitSound", "/assets/hit.mp3");
        this.load.image("bullet","/assets/bullet.png");
    }
    create() {
        console.log("Creating game scene...");
        this.physics.world.setBounds(0, 0, 3000, this.scale.height);
        this.cameras.main.setBounds(0, 0, 3000, this.scale.height);
     //   this.cameras.main.setZoom(0.5);

        //player
        this.player = this.physics.add.sprite(this.scale.width / 2,this.scale.height / 2, "player");  
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
        // Get platform position
        this.createPlatforms();
        let platform = this.platforms.getChildren()[1];
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
        this.boss = this.physics.add.sprite(2800, this.scale.height - 100, "enemy");
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
        this.ground.create(3000/2, this.scale.height - 10, "platform").setDisplaySize(3000, 22).setOrigin(0.5, 0.5).refreshBody();
        
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
        this.ammoText = this.add.text(16, 80, 'Ammo: 10', { fontSize: '16px', fill: '#000' }).setScrollFactor(0);
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
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' }).setScrollFactor(0);
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
            repeat: 0,
        });
        this.gundrop = this.physics.add.group({
            key: "coin",
            maxSize: 5,
            repeat: 0,
        });
        this.physics.add.collider(this.ammoDrop, this.ground);
        this.physics.add.collider(this.ammoDrop, this.platforms);
        this.physics.add.collider(this.gundrop, this.ground);
        this.physics.add.collider(this.gundrop, this.platforms);
        this.physics.add.overlap(this.player, this.ammoDrop, this.collectAmmo,null,this);
        this.physics.add.overlap(this.player, this.gundrop, this.collectGun,null,this);
        //powertimer
        this.powertimer = 0;
        this.powertext = this.add.text(16, 110, '', { fontSize: '16px', fill: '#000' }).setScrollFactor(0);
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
        this.playerHealthtext = this.add.text(16, 50, 'Health: 100', { fontSize: '16px', fill: '#000' }).setScrollFactor(0);
        //this.playerHealth = this.createHealthBar(200,20,100,10,100);
        this.isHit = false;
        // this.physics.add.overlap(this.player, this.enemy.bullets, this.PlayerHit,null,this);
        // this.physics.add.overlap(this.player.bullets, this.enemy, this.enemyHit,null,this);
     //   this.setupCamera();
        //keyboard input
        this.createControls();
        //sounds
        this.sfx = {
            jump: this.sound.add("jump"),
            coin: this.sound.add("coinSound"),
            gameOver: this.sound.add("gameOverSound"),
            hit: this.sound.add("hitSound")
        };
    }
        createPlatforms() { 
        let x=0;
        let y=500;
        this.platforms = this.physics.add.staticGroup();
        while(x<3000){
            const platformwidth = Phaser.Math.Between(120,220);
            const gap = Phaser.Math.Between(220,380);
            x+=gap;
                // Slight height variation (like Mario stairs)
            y += Phaser.Math.Between(-60, 60);
            y = Phaser.Math.Clamp(y, 380, 480);
            const platform = this.platforms.create(x, y, 'platform').setDisplaySize(100, 10).setOrigin(0.5,0.5);
            platform.displayWidth = platformwidth;
            platform.refreshBody();
            x += platformwidth;
        }
     }

        setupCamera() {
            this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        //    this.cameras.main.setBounds(0, 0, 3000, this.scale.height);
            this.cameras.main.setBackgroundColor('#87CEEB');
        }
        createControls (){
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keys = this.input.keyboard.addKeys("W,A,S,D");
        };
        //createHealthBar(x,y,width,height,maxhealth){
        //    const bg = this.add.rectangle(x,y,width + 4, height + 4, 0x000000).setOrigin(0).setScrollFactor(0);
        //    const bar = this.add.rectangle(x+2 , y+2, width , height, 0xff0000).setOrigin(0).setScrollFactor(0);
//
        //    return{
        //        maxhealth,
        //        currentHealth: maxhealth,
        //        update(health){
        //            this.currentHealth = health;
        //            const percentage = Phaser.Math.Clamp(health / this.maxhealth, 0,1);
        //            bar.width = width * percentage;
        //        }
        //    };
        //}
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
            }
        }

        playerDies(){
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
            bullet.rotation = Phaser.Math.Angle.Between(bullet.x, bullet.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
            //destroy bullet after 3 seconds to prevent memory leaks
            this.time.delayedCall(3000, () => {
                bullet.disableBody(true,true);
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
    //    this.physics.moveToObject(this.enemy, this.player, 100);
        //arrow key input
        if (this.cursors.left.isDown){
            this.player.setVelocityX(-speed);
            this.player.play("run", true);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown){
            this.player.setVelocityX(speed);
            this.player.play("run", true);
            this.player.setFlipX(false);
        }
        else {
            this.player.setVelocityX(0);
            this.player.stop();
        }   
        if (this.cursors.up.isDown && this.player.body.touching.down){
            this.player.setVelocityY(-350);
            this.sfx.jump.play();
        }
        if (this.cursors.space.isDown && !this.player.firetimer){
            this.player.firetimer = this.time.addEvent({
                delay: 200,
                callback: this.shoot,
                callbackScope: this,
                loop: true
            });
        }
        if (this.cursors.space.isUp && this.player.firetimer){
                this.player.firetimer.remove();
                this.player.firetimer = null;
        }
        
        //WASD input
        if (this.keys.A.isDown)this.player.setVelocityX(-speed);
        if (this.keys.D.isDown)this.player.setVelocityX(speed);
        if (this.keys.W.isDown && this.player.body.touching.down)this.player.setVelocityY(-350),this.sfx.jump.play();
        if (this.keys.S.isDown)this.player.setVelocityY(speed);        
}

}

