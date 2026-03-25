export default class BootScene extends Phaser.Scene {
    constructor() {
        super('bootScene');
    }
    preload() {
        this.load.setBaseURL(import.meta.env.BASE_URL);
        this.load.setPath('assets/');
        this.load.image('PlatformGame', 'PlatformGame/game1.png');
        this.load.image('SpaceBattle', 'SpaceBattle/game2.png');
    }
    create() {
        this.scene.start('menuScene');
    }
}