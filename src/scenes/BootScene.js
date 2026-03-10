export default class BootScene extends Phaser.Scene {
    constructor() {
        super('bootScene');
    }
    preload() {
        this.load.setPath('assets/');
        this.load.image('PlatformGame', 'PlatformGame/game1.png');
    }
    create() {
        this.scene.start('menuScene');
    }
}