export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }
    
    create() {
        this.add.text(100, 100, "Game Over!", { fontSize: "32px", fill: "#ff0000" });
        this.add.text(100, 200, "Press SPACE or Touch to Restart", { fontSize: "24px", fill: "#ffffff" });
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('menuScene');
        });
        this.input.on('pointerdown', () => {
            this.scene.start('menuScene');
        });
    }
}
