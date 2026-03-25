let speed = 250
export default class GameScene extends Phaser.Scene{
    constructor(){
        super("SpaceBattleScene")

        // Player properties
        this.player = null
        
    
        // Controls
        this.cursors = null
        
    
        // Groups
        this.bullets = null
        this.enemies = null
    
        // Shooting cooldown
        this.lastFired = 0
        this.score = 0
        this.isHit = false
    }
    preload(){
        this.load.pack("game","assets/SpaceBattle/Assets.json")
    }

    create(){
        //background && worldbounds
        this.bg = this.add.tileSprite(0,0,800,600,"background").setOrigin(0,0); 
        this.physics.world.setBounds(0,0,this.sys.canvas.width, this.sys.canvas.height)

        //player
        this.player = this.physics.add.sprite(400,550,"player1").setScale(.2);
        this.player.setCollideWorldBounds(true);
        this.player.body.setAllowGravity(false);
        this.player.fireRate = 500;
        this.player.firetimer = null
        this.player.damage = 0
        this.player.health = 100
        this.player.shield = 3
        this.player.isInvincible = false
        //player ammo
        this.player.ammo = 30
        this.player.maxAmmo = 50

        //======================enemy Waves======================================= 
        this.ENEMY_TYPES = {
            normal: { speed: 100, hp: 1, atlas: 'enemy1', frame: 'restored_1.png', anim: 'enemy_move', canShoot: false },
            mid: { speed: 70, hp: 3, atlas: 'enemy2', frame: 'restored_1.png', anim: 'enemy2_move', canShoot: true, fireRate: 1500 },
            boss: { speed: 40, hp: 100, atlas: 'boss1', frame: 'restored_1.png', anim: 'boss_move', canShoot: true, fireRate: 400 }
        };
        this.enemies = this.physics.add.group({allowGravity : false});

        this.WAVES = [
            [{ type: 'normal', count: 1, delay: 500}],
            [{ type: 'mid', count: 1, delay: 500}],
            [{ type: 'mid', count: 1, delay: 800},{ type: 'boss', count: 1, delay: 2000}]
        ];
        this.waveIndex = 0
        this.activeEnemies = 0
        this.isSpawning = false
        this.waveText = this.add.text(400,300,'',{fontSize: '32px',fill: '#fff'}).setOrigin(0.5).setDepth(10)

        this.startWave()
        this.events.on('shutdown', () => {
            this.time.removeAllEvents();
        });
        //======================Bullets=====================================================

        this.player.bullets = this.physics.add.group({
            classType : Phaser.Physics.Arcade.sprite,
            maxSize : 30,
            allowGravity : false,
            runChildUpdate : true
        });

        this.enemyBullets = this.physics.add.group({allowGravity: false})
        
        //===================================Drops==============================
        this.items = this.physics.add.group({allowGravity: false})
        //===================================collision Handling==========================================
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
        this.physics.add.overlap(this.player,this.enemyBullets,this.hitplayer,null,this)
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this)

        //============================Animation Function================================
        this.createAnimations();
        this.player.play('player_idle')
        //==================================controlls==========================================
        this.isTouchDevice = this.sys.game.device.input.touch && /Mobi |Android/i.test(navigator.userAgent)
        if(this.isTouchDevice){
        this.mobileconstrols()}
        this.createcontrols();

        //=======================================text==============================================
        this.addText()

        //========================================sounds=====================================================
        this.sfx = {
            BossTheme: this.sound.add('BossTheme')
        }
    }
    update(time,delta){
        if(this.isTouchDevice){
        this.mobilemovement()}
        else{this.handleMovement();}
        this.handleShooting(time);
        this.enemies.children.iterate(enemy => {
            if(!enemy) return;
            if(enemy.x < 20){
                enemy.x = 20;
                enemy.setVelocityX(Math.abs(enemy.body.velocity.x))
            }
            if(enemy.x > this.sys.canvas.width - 20){
                enemy.x = this.sys.canvas.width - 20;
                enemy.setVelocityX(-Math.abs(enemy.body.velocity.x))
            }
            if(enemy.isBoss){
                enemy.x += Math.sin(time*0.002)* 2;
            }
            if(enemy.y > this.sys.canvas.height + 50){
                this.killenemy(enemy);
            }
        })
        this.enemyBullets.children.iterate(b => {
            if(!b)return;
            if(b.y > this.sys.canvas.height){
                b.destroy();
            }
        })
    }
    handleShooting(time){
        let shoot = this.shootButtonPress || this.cursors.space.isDown
        if(shoot && time > this.lastFired){
            this.shootBullet();
            this.lastFired = time + this.player.fireRate;
        }
    }
    shootBullet(){
        if(this.player.ammo <= 0)return;
        this.player.ammo--;
        this.ammoText.setText('Ammo: ' + this.player.ammo)
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
        bullet.setCollideWorldBounds(true)
        bullet.body.onWorldBounds = true
        this.physics.world.on('worldbounds', (body) => {
            body.gameObject.disableBody(true,true)
        })
        bullet.play('player_shoot')
        
        this.time.delayedCall(3000, () => {
            bullet.disableBody(true,true);
        });
    }

    startWave(){
        if(this.waveIndex >= this.WAVES.length){
            console.log('all waves completed')
            return;
        }
        console.log('Starting wave:', this.waveIndex);
        const currentWave = this.WAVES[this.waveIndex]
        this.isSpawning = true
        let totaldelay = 0
        let enemiesTOSpawn = 0
        
        currentWave.forEach(group => {
            if(!group.type){
                console.error('invalid enemy type',group);
                return;
            }
            enemiesTOSpawn += group.count
            for(let i = 0; i < group.count; i++){
                const enemyType = group.type;
                const spawnTime = totaldelay + i * group.delay;
                
                this.time.delayedCall(spawnTime,() => {
                    this.spawnEnemy(enemyType);
                    enemiesTOSpawn--;
                    if(enemiesTOSpawn === 0){
                        this.isSpawning = false;
                    }
                })
            }
            totaldelay += group.count * group.delay
        })
        this.time.delayedCall(totaldelay + 50,() => {
            this.isSpawning = false
        });
        this.waveIndex++
        
    }
    spawnEnemy(type){
        console.log('spawning : ', type)
        if (!type) {
            console.error("enemy type is not defined",new Error().stack);
            return;}
        const config = this.ENEMY_TYPES[type]
        if(!config){
            console.error('invalide type : ',type)
            return;
        }
        if(!this.textures.exists(config.atlas)){
            console.error("texture missing : ",config.atlas)
            return;
        }
        const difficultMultiplier = 1 + (this.waveIndex * 0.2)
        const x = Phaser.Math.Between(50,750);
        const enemy = this.enemies.create(x,0,config.atlas,config.frame);
        enemy.setScale(.4)

        enemy.setVelocityY(config.speed * difficultMultiplier);

       const dx = this.player.x - enemy.x
       const dirX = Phaser.Math.Clamp(dx ,-1, 1)
       const randomness = Phaser.Math.Between(-20,20)
       enemy.setVelocityX(dirX * 60 + randomness)
        if(type == 'boss'){
            enemy.setVelocity(0,0);
            enemy.y = 100
            enemy.x = this.sys.canvas.width/2
            enemy.isBoss = true
            enemy.maxHealth = config.hp
            enemy.phase2 = false
            enemy.setScale(1)
            this.sfx.BossTheme.play()
            this.startBossAttack(enemy)
        } 
        
        enemy.health = config.hp * difficultMultiplier
        enemy.play(config.anim)
        enemy.scorevalue = 10
        this.activeEnemies++
        if(config.canShoot && type != 'boss'){
            enemy.shootEvent = this.time.addEvent({
                delay: config.fireRate / difficultMultiplier,
                loop: true,
                callback: () => {
                    if(enemy.active){
                        this.enemyShoot(enemy);
                    }
                }
            })
        }
        if(enemy.y > this.sys.canvas.height){
            this.killenemy(enemy)
        }

    }
    startBossAttack(enemy){
        if(!enemy.active)return
        enemy.attackloop = this.time.addEvent({
            delay: 2500,
            loop: true,
            callback: ()=>{
                let shots = 0
                enemy.burstEvent = this.time.addEvent({
                    delay: enemy.phase2 ? 120 : 180,
                    repeat: 3,
                    callback: () => {
                        if(!enemy.active)return
                        this.bossShot(enemy)
                    }
                })
            }
        })
    }
    bossShot(enemy){
        const angles = [-40,-30,0,20,40]
        angles.forEach(angle => {
            const bullet = this.enemyBullets.create(enemy.x,enemy.y,'enemy_bullet').setScale(.2)
            this.physics.velocityFromAngle(angle + 90, 250, bullet.body.velocity)    
        })   
    }
    enemyShoot(enemy){
        const bullet = this.enemyBullets.create(enemy.x, enemy.y, 'enemy_bullet')
        bullet.setVelocityY(250)
        bullet.setScale(.2)

    }
    killenemy(enemy){
        if(!enemy)return;
        let explosion = this.add.sprite(enemy.x,enemy.y,'explosion').setScale(0.4)
        explosion.play('explode')
        explosion.once('animationcomplete',() => {
            explosion.destroy()
        })
        if(enemy.shootEvent)enemy.shootEvent.remove();
        if(enemy.attackloop)enemy.attackloop.remove();
        if(enemy.burstEvent)enemy.burstEvent.remove();
        if(enemy.active){
            enemy.destroy()
        } 
        if(Phaser.Math.Between(0,100) < 50){
            this.dropItem(enemy.x,enemy.y)
        }
        if(enemy.isBoss){this.dropItem(enemy.x,enemy.y)}
        this.activeEnemies = Math.max(0, this.activeEnemies - 1);
    
        console.log('Remaining:',this.activeEnemies, 'spawning: ',this.isSpawning)

        if(this.activeEnemies === 0 && !this.isSpawning){
            this.waveText.setText('Wave Cleared -> Starting Next Wave')
            this.time.delayedCall(1000, () => {
                this.waveText.setText('')
                //for boss
                const nextwave = this.WAVES[this.waveIndex]
                if(nextwave && nextwave.some(g => g.type === 'boss')){
                    this.waveText.setText('☠️ Boss Incoming')
                    this.time.delayedCall(1500, () => {
                        this.waveText.setText('')
                        this.startWave()
                    })
                } else{
                    this.startWave();
                }
            })
        }
    }
    hitenemy(enemy){
        if (!enemy.active)return
        this.cameras.main.shake(100,0.01)
        if(enemy.isBoss && !enemy.phase2 && enemy.health <= enemy.maxHealth/2){
            enemy.phase2 = true
            console.log('boss phase 2')
            if(enemy.shootEvent){
                enemy.shootEvent.remove()
            }
            enemy.shootEvent = this.time.addEvent({
                delay: 2000,
                loop: true,
                callback: () => {
                    if(enemy.active)this.bossShot(enemy)
                }
            })
        }
        enemy.health -= 10
        enemy.setTint(0xff0000)
        this.time.delayedCall(100,() => {
            if(enemy.active) enemy.clearTint()
        })
        if(enemy.health <= 0){
            this.score += enemy.scorevalue
            this.scoreText.setText('Score: '+ this.score)
            
            this.killenemy(enemy)
        }
    }
    dropItem(x,y){
        const types = ['shield', 'ammo']
        const type = Phaser.Utils.Array.GetRandom(types)
        const item = this.items.create(x,y, type)
        item.type = type
        item.setVelocityY(100)
        item.setScale(.3)
    }
    collectItem(player,item){
        if(!item.active) return;
        if(item.type === 'shield'){
            player.shield = Math.min(player.shield + 1,5)

            this.shieldText.setText('Shield: '+ player.shield)
        }
        if(item.type === 'ammo'){
            player.ammo = Math.min(player.ammo + 10,player.maxAmmo)
            this.ammoText.setText('Ammo: '+ player.ammo)
        }
        item.destroy()
    }
    hitplayer(player,bullet){
        if(player.isInvincible)return;
        if(this.isHit)return
        this.isHit = true
        this.cameras.main.shake(150,0.02)
        bullet.destroy();
        if(player.shield > 0){
            player.shield--
            player.setTint(0x00ffff)
            this.shieldText.setText('Shield: '+ player.shield)

        }else{
            player.health -= 10
            player.setTint(0xff0000)
        }
        player.isInvincible = true
        this.playerHealth.setText('Health: '+ player.health)
        this.time.delayedCall(100,() => {
            player.clearTint()
            this.isHit = false
            player.isInvincible = false
        })
        if(player.health <= 0){
            this.playerdies()
        }
    }
    playerhit(){
        if(this.isHit)return;
        this.isHit = true
        this.cameras.main.shake(150,0.02)
        this.player.health -= 10
        this.playerHealth.setText('Health: ' + this.player.health)
        this.player.setTint(0xff0000)
        this.time.delayedCall(100,()=>{
            this.player.clearTint()
            this.isHit = false
        })
        if(this.player.health <= 0){
            this.player.play('explode')
            this.playerdies()
        }
    }
    playerdies(){
        for(let key in this.sfx){
            if(this.sfx[key].isPlaying){
                this.sfx[key].stop();
            }
        }
        this.scene.stop('SpaceBattleScene')
        this.scene.start("gameOverScene")
    }
    addText(){
        this.scoreText = this.add.text(600, 40, 'Score: 0', {fontSize: '25px', fill: '#e0d2d2'}).setScrollFactor(0)
        this.playerHealth = this.add.text(0,10,'Health: 100',{fontSize: '25px',fill: '#f2e4e4'}).setScrollFactor(0)
        this.ammoText = this.add.text(10,40, 'Ammo: 30',{fontSize: '20px',fill: '#fff'})
        this.shieldText = this.add.text(10,60, 'Shield: 3',{fontSize: '20px',fill: '#fff'})
    }

    createcontrols(){
        this.cursors=this.input.keyboard.createCursorKeys();
    }
    mobileconstrols(){   
        this.shootButtonPress = false;
        this.input.on('pointerdown',(pointer) => {
            if(this.shootButton && this.shootButton.getBounds().contains(pointer.x,pointer.y))return;
            this.targetX = pointer.x
            this.targetY = pointer.y
            this.isMovin = true
    })
        this.input.on('pointermove',(pointer) => {
            if(pointer.isDown){
                this.targetX = pointer.x
                this.targetY = pointer.y
        }
    })
        this.input.on('pointerup',() => {
            this.isMovin = false
    }) 
    const W = this.cameras.main.width
    const H = this.cameras.main.height
    this.shootButton = this.add.image(W * 0.85, H * 0.85, 'shoot').setScale(0.3).setInteractive().setAlpha(0.5).setScrollFactor(0).setDepth(100);
    this.shootButton.on('pointerdown', () => {
        this.shootButtonPress = true
    })
    this.shootButton.on('pointerup', () => {
        this.shootButtonPress = false
    })
        
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
    mobilemovement(){
        if(!this.player)return;
        let targetAngle = 0
        if(this.isMovin){
            const dx = this.targetX - this.player.x
            const dy = this.targetY - this.player.y
            const distance = Math.sqrt(dx*dx + dy*dy)
            if(distance > 5){
                this.player.setVelocityX((dx / distance)* speed)
                this.player.setVelocityY((dy / distance)* speed)
            }else{this.player.setVelocity(0,0)}
        }else{
            this.player.setVelocity(0,0)
        }
        if (this.isMovin){
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


    //================================Animation Function=========================================
    createAnimations(){
        //===========Player Animations===================
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

        //===========================Enemy Animation======================
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
        this.anims.create({
            key: 'enemy2_move',
            frames: this.anims.generateFrameNames('enemy2', {
                prefix: 'restored_',
                start: 1,
                end: 8,
                suffix: '.png'
            }),
            frameRate: 12,
            repeat: -1
        })
        this.anims.create({
            key: 'boss_move',
            frames: this.anims.generateFrameNames('boss1', {
                prefix: 'restored_',
                start: 1,
                end: 8,
                suffix: '.png'
            }),
            frameRate: 12,
            repeat: -1
        })
        //=======================Bullets Animations=========================
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
        //============================Explosion=============================
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNames('explosion', {
                prefix: 'restored_',
                start: 1,
                end: 8,
                suffix: '.png'   }),
          frameRate: 12,
          repeat: 0
        });
    }
}