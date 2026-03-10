export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }
    checkOrientation() {
        const rotatediv = document.getElementById('rotate-device');
        if (window.innerWidth < window.innerHeight) {
            rotatediv.style.display = 'flex';
            this.scene.pause();
        } else {
            rotatediv.style.display = 'none';
            this.scene.resume();
        }
    }
    create() {
        //this.checkOrientation();
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.scale.refresh();
            },200);
        });
        //window.addEventListener('orientationchange', () => this.checkOrientation());
        this.add.text(100, 100, "Welcome to the Game!", { font: "32px Arial", fill: "#ffffff" });
        this.add.text(100, 200, "Press SPACE or TAP to Start", { font: "24px Arial", fill: "#ffffff" });
        this.add.text(100, 300, "Press F to Toggle Fullscreen", { font: "18px Arial", fill: "#ffffff" });
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('gameScene');
        });
        this.input.on('pointerdown', () => {
            this.scene.start('gameScene');
        });
        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
    }
}