export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }
    create() {
        this.add.text(100, 100, "Welcome to the Game!", { font: "32px Arial", fill: "#ffffff" });
        this.add.text(100, 200, "Press SPACE or TAP to Start", { font: "24px Arial", fill: "#ffffff" });
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('gameScene');
        });
        this.input.on('pointerdown', () => {
            this.scene.start('gameScene');
        });
    }
}