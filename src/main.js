import Phaser from 'phaser';
//import MenuScene from './scenes/menu.js';
//import BootScene from './scenes/BootScene.js';
import scenes from './scenes/index.js';
//import GameScene from './scenes/Platfromrunner/game.js'
//import GameOverScene from './scenes/Platfromrunner/gameover.js';
//import WinScene from './scenes/Platfromrunner/win.js';
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
    scene: scenes
}

const game = new Phaser.Game(config);
