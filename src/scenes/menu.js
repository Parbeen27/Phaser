export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('menuScene');
        this.cards = [];
    }
    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        this.bg = this.add.rectangle(0, 0, width, height, 0x0f172a).setOrigin(0,0);
        this.title = this.add.text(width / 2, height * 0.1, "Game Hub", {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        const game = [
            { key: 'PlatformGame', text: 'Platform Runner', scene: 'gameScene' },
            { key: 'SpaceBattle', text: 'Space Battle', scene: 'SpaceBattleScene' }
        ];
        this.createCards(game);
        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
        this.scale.on('resize', this.resize, this);
        this.resize({ width, height})
    }
    createCards(game){
        const width = this.scale.width;
        const height = this.scale.height;
        this.cards.forEach(cardobj => {
            cardobj.card.destroy();
            cardobj.image.destroy();
            cardobj.text.destroy();
        })
        this.cards=[];

        let startx = width * 0.3;
        let starty = height * 0.4;
        let spacingx = width * 0.4;
        const cardWidth = 260;
        const cardHeight = 180;

        game.forEach((g, index) => {
            const x = startx + index * spacingx;
            const y = starty;
            const card = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x000000, 0.5).setStrokeStyle(2, 0xffffff).setOrigin(0.5);
            const image = this.add.image(0, 0, g.key);
            const maxWidth = 220;
            const scale = Math.min(maxWidth / image.width, 1);
            image.setScale(scale);
            const text = this.add.text(0, 0, g.text, {
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
            this.cards.push({ card, image, text});
        });
    }
    resize(gameSize) {
        const { width, height } = gameSize;
        //background
        this.bg.setSize(width, height);
        this.title.setPosition(width / 2, height * 0.1)
        this.bg.setPosition(0,0);

        //card repostion
        const spacingx = 20
        const cardWidth = 260
        const maxCardsPerrow = Math.floor(width / (cardWidth + spacingx))
        const cardsperrow = Math.min(maxCardsPerrow, this.cards.length)
        const totalrowwidth = cardsperrow * cardWidth + (cardsperrow - 1) * spacingx
        const startx = (width - totalrowwidth)/2 + cardWidth / 2;
        const starty = height * 0.4;
        this.cards.forEach((cardobj, index) => {
            const row = Math.floor(index / cardsperrow);
            const col = index % cardsperrow;

            const x = startx + col * (cardWidth + spacingx)
            const y = starty + row * (cardWidth * 0.75)

            cardobj.card.setPosition(x, y)
            cardobj.image.setPosition(x, y)
            cardobj.text.setOrigin(0.5)
            const imageHeigh = cardobj.image.displayHeight;
            cardobj.text.setPosition(x, y + imageHeigh /3 + 10)
        })
    }
}