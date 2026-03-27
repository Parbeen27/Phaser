import Phaser from 'phaser';
import scenes from './scenes/index.js';

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#666c6f',
    scale: {
        mode: isMobile ? Phaser.Scale.RESIZE : Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
        width: 800,
        height: 600
    },
    resolution: window.devicePixelRatio,
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
