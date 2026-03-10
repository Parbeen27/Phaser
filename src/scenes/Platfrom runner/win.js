export default class WinScene extends Phaser.Scene {
    constructor() {
        super('winScene');
    }
    init(data) {
        this.score = data.score || 0;
    }
    create() {
        this.add.text(100, 100, "You Win!", { fontSize: "32px", fill: "#00ff00" });
        this.add.text(100, 150, "Final Score: " + this.score, { fontSize: "24px", fill: "#00ff00" });
        this.add.text(100, 200, "Press SPACE or touch to return to the menu", { fontSize: "18px", fill: "#00ff00" });
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('menuScene');
        });
        this.input.once('pointerdown', () => {
            this.scene.start('menuScene');
        });
    }
}   