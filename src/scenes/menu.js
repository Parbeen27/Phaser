export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }
    create() {
        this.add.rectangle(400, 300, 800, 600, 0x0f172a);
        this.add.text(400,80,"Game Hub",{
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.scale.refresh();
            },200);
        });
        const game = [
            { key: 'PlatformGame', text: 'Platform Runner', scene: 'gameScene'},
            { key: 'SpaceBattle' , text: 'Space Battle'   , scene: 'SpaceBattleScene'}
        ];
        let startx = 250;
        let starty = 200;
        let spacingx = 300;
        const cardWidth = 260;
        const cardHeight = 180;
        game.forEach((g, index) => {
            const x = startx + index * spacingx;
            const y = starty;
            const card = this.add.rectangle(x-100, y-10, cardWidth, cardHeight, 0x000000, 0.5).setStrokeStyle(2, 0xffffff).setOrigin(0.5);
            const image = this.add.image(x-100, y-10, g.key);
            const maxWidth = 220;
            const scale = Math.min(maxWidth / image.width, 1);
            image.setScale(scale);
            const text = this.add.text(x-100, y + 110, g.text, {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
            }).setOrigin(0.5);
            // Make card interactive
            card.setInteractive({ useHandCursor: true });
    
            // Add hover effect and click handler
            card.on('pointerover', () => {
                this.tweens.add({
                    targets: [card, image],
                    scalex: 1.08,
                    scaley: 1.08,
                    duration: 200,
                    ease: 'Power2'
                });
                card.setStrokeStyle(4, 0xff0000);
            });
            card.on('pointerout', () => {
                this.tweens.add({
                    targets: [card, image],
                    scalex: 1,
                    scaley: 1,
                    duration: 200,
                    ease: 'Power2'
                });
                card.setStrokeStyle(2, 0xffffff);
            });
            card.on('pointerdown', () => {
                this.scene.start(g.scene);
            });
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