let speed = 250
export default class GameScene extends Phaser.Scene{
    constructor(){
        super("SpaceBattleScene")

        // Player properties
        this.player = null
        
    
        // Controls
        this.cursors = null
        this.spaceKey = null
    
        // Groups
        this.bullets = null
        this.enemies = null
    
        // Shooting cooldown
        this.lastFired = 0
        this.score = 0
        this.isHit = false
        this.enemy1kill = 0
    }
    preload(){
        this.load.pack("game","assets/SpaceBattle/Assets.json")
    }

    create(){
        //background
        this.bg = this.add.tileSprite(0,0,800,600,"background").setOrigin(0,0);   
        //player
        this.player = this.physics.add.sprite(400,550,"player1").setScale(.2);
        this.player.setCollideWorldBounds(true);
        this.player.body.setAllowGravity(false);
        this.player.fireRate = 500;
        this.player.firetimer = null
        this.player.damage = 0
        //player anims
        this.anims.create({
            key: 'player_fly',
            frames: this.anims.generateFrameNames('player1', {
                prefix: 'restored_',
                start: 3,
                end: 4,
                suffix: '.png'   }),
          frameRate: 12,
          repeat: -1
        });
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNames('player1', {
                prefix: 'restored_',
                start: 1,
                end: 2, // fewer frames for subtle effect
                suffix: '.png'
            }),
            frameRate: 1, // slow
            repeat: -1
        });
        this.anims.create({
            key: 'player_boost',
            frames: this.anims.generateFrameNames('player1', {
                prefix: 'restored_',
                start: 5,
                end: 8, 
                suffix: '.png'
            }),
            frameRate: 12, 
            repeat: -1
        });
        this.player.play('player_idle')
        //player Health
        this.player.health = 100
        //enemy
        this.anims.create({
            key: 'enemy_move',
            frames: this.anims.generateFrameNames('enemy1', {
                prefix: 'restored_',
                start: 1,
                end: 8, 
                suffix: '.png'
            }),
            frameRate: 12, 
            repeat: -1
        });
        this.enemies = this.physics.add.group({allowGravity : false});
        //enemies spawn
        this.time.addEvent({
            delay : 1500,
            callback : () => this.spawnEnemy(),
            callbackScope : this,
            loop : true
        });
        //mid enemies
        this.anims.create({
            key: 'enemy_move',
            frames: this.anims.generateFrameNames('enemy2', {
                prefix: 'restored_',
                start: 1,
                end: 8,
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        })
        //player bullets
        this.anims.create({
            key: 'player_shoot',
            frames: this.anims.generateFrameNames('player_bullet', {
                prefix: 'restored_',
                start: 1,
                end: 8,
                suffix: '.png'   }),
          frameRate: 10,
          repeat: -1
        });
        this.player.bullets = this.physics.add.group({
            classType : Phaser.Physics.Arcade.sprite,
            maxSize : 20,
            allowGravity : false,
            runChildUpdate : true
        });
        //collision Handling
        this.physics.add.overlap(this.player.bullets,this.enemies, (obj1,obj2) => {
            let bullet = obj1;
            let enemy = obj2;    
            if (!bullet.texture || bullet.texture.key !== "player_bullet") {
                bullet = obj2;
                enemy = obj1;
            }  
            if(!bullet.active || !enemy.active) return; //ignore if either is already destroyed
            bullet.disableBody(true,true);
            this.hitenemy(enemy);
        });
        this.physics.add.overlap(this.player,this.enemies,this.playerhit,null,this)
        

        //controlls
        this.createcontrols();

        //text
        this.addText()
    }
    update(time,delta){
        this.handleMovement();
        this.handleShooting(time);
        // this.cleanObjects();
    }
    handleMovement(){
        if(!this.player)return;
        let left = this.cursors.left.isDown;
        let right = this.cursors.right.isDown;
        let up = this.cursors.up.isDown;
        let down = this.cursors.down.isDown;
        let ismoving = false
        let targetAngle = 0
        //this.player.setVelocity(0,0)
        //Horizontal Movement
        if(left){
            this.player.setVelocityX(-speed);
            targetAngle = -15
            ismoving = true
        }
        else if(right){
            this.player.setVelocityX(speed);
            targetAngle = 15
            ismoving = true
        }
        else{
            this.player.setVelocity(0);
            targetAngle = 0
            ismoving = false
        }
        //verticall movement
        if(up){
            this.player.setVelocityY(-speed);
            ismoving = true
        }
        else if (down){
            this.player.setVelocityY(speed);
            ismoving = true
        }
        if (ismoving){
            if(this.player.anims.currentAnim.key !== 'player_fly'){
                this.player.play('player_fly')
                this.player.scaleY = Phaser.Math.Linear(this.player.scaleY, 0.4, 0.1);
            }
        }else{
            if(this.player.anims.currentAnim.key !== 'player_idle'){
                this.player.play('player_idle')
                this.player.setScale(0.2,0.2)
            }
        }
        this.player.angle = Phaser.Math.Linear(this.player.angle, targetAngle,0.1)
    }
    handleShooting(time){
        let shoot = this.cursors.space.isDown;
        if(shoot && time > this.lastFired){
            this.shootBullet();
            this.lastFired = time + this.player.fireRate;
        }
    }
    shootBullet(){
        const bullet = this.player.bullets.get(
            this.player.x,
            this.player.y,
            'player_bullet',
            'restored_1.png'
        );
        if(!bullet) return;
        bullet.enableBody(true,this.player.x,this.player.y,true,true);
        bullet.setScale(.06)
        bullet.body.setSize(10,10)
        bullet.setVelocityY(-400);
        bullet.setAngle(-90)
        bullet.play('player_shoot')
        this.time.delayedCall(3000, () => {
            bullet.disableBody(true,true);
        });
    }
    createcontrols(){
    this.cursors=this.input.keyboard.createCursorKeys();
    //this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    spawnEnemy(){
        const x = Phaser.Math.Between(50,750);
        const enemy = this.enemies.create(x,0,'enemy1');
        enemy.setScale(.2)
        enemy.play('enemy_move')
        enemy.setVelocityY(200);
        enemy.setVelocityX(Phaser.Math.Between(-50,50));
        enemy.health = 10
        enemy.scorevalue = 10
        if(this.enemy1kill == 10){
            const enemy2 = this.enemies.create(x,0,'enemy2')
            enemy2.setScale(.5)
            enemy2.play('mid_move')
            enemy2.setVelocity(300)
            this.enemy1kill -= 10
        }
    }
    hitenemy(enemy){
        if (!enemy.active)return
        enemy.health -= 10
        enemy.setTint(0xff0000)
        this.time.delayedCall(100,() => {
            if(enemy.active) enemy.clearTint()
        })
        if(enemy.health <= 0){
            enemy.disableBody(true,true)
            enemy.active = false
            this.enemy1kill += 1
            this.score += enemy.scorevalue
            this.scoreText.setText('Score: '+ this.score)
        }
    }
    playerhit(){
        if(this.isHit)return;
        this.isHit = true
        this.player.health -= 10
        this.playerHealth.setText('Health: ' + this.player.health)
        this.player.setTint(0xff0000)
        this.time.delayedCall(100,()=>{
            this.player.clearTint()
            this.isHit = false
        })
        if(this.player.health <= 0){
            this.playerdies()
        }
    }
    playerdies(){
        this.scene.stop('SpaceBattleScene')
        this.scene.start("gameOverScene")
    }
    addText(){
        this.scoreText = this.add.text(400, 0, 'Score: 0', {fontSize: '30px', fill: '#e0d2d2'}).setScrollFactor(0)
        this.playerHealth = this.add.text(0,17,'Health: 100',{fontSize: '32px',fill: '#f2e4e4'}).setScrollFactor(0)
    }
}