import Phaser from 'phaser';
import MenuScene from './scenes/menu.js';
import GameScene from './scenes/game.js';  
import GameOverScene from './scenes/gameover.js';
import WinScene from './scenes/win.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#666c6f',
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    //    min:{
    //        width: 400,
    //        height: 300
    //    },
    //    max:{
    //        width: 1200,
    //        height: 900
    //    }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: [MenuScene,
         GameScene, GameOverScene,WinScene]
}

const game = new Phaser.Game(config);
