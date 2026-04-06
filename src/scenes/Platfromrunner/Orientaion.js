export default class OrientationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OrientationScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.message = this.add.text(width / 2, height / 2,
      'Rotate device to landscape',
      { fontSize: '24px', color: '#ffffff' }
    ).setOrigin(0.5);

    // Run once after a short delay (important fix)
    this.time.delayedCall(100, () => {
      this.checkOrientation();
    });

    // Listen to orientation change properly
    this.scale.on('orientationchange', this.checkOrientation, this);
  }

  checkOrientation(orientation) {
    const isLandscape =
      this.scale.orientation === Phaser.Scale.LANDSCAPE;

    if (isLandscape) {
      this.scene.start('gameScene');
    } else {
      this.message.setText('Rotate device to landscape');
    }
  }
}