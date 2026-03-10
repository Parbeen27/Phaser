import Phaser from 'phaser';
import MenuScene from './scenes/menu.js';
import GameScene from './scenes/Platfrom runner/game.js';  
import GameOverScene from './scenes/Platfrom runner/gameover.js';
import WinScene from './scenes/Platfrom runner/win.js';
import BootScene from './scenes/BootScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#666c6f',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    input: {
        activePointers: 3, // Allow up to 3 simultaneous touch inputs
    },
    scene: [BootScene,MenuScene,
         GameScene, GameOverScene,WinScene]
}

const game = new Phaser.Game(config);
