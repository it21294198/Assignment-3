AFRAME.registerComponent('ball-movement', {
  schema: {},

  init: function () {
    this.ball = document.querySelector('#ball');
    this.hiro = document.querySelector('#hiroMarker');
    this.kanji = document.querySelector('#kanjiMarker');

    this.start = new THREE.Vector3();
    this.end = new THREE.Vector3();
    this.t = 0;
    this.direction = 1; // 1: kanji -> hiro, -1: hiro -> kanji
  },

  tick: function (time, deltaTime) {
    const hiroVisible = this.hiro.object3D.visible;
    const kanjiVisible = this.kanji.object3D.visible;

    if (!hiroVisible || !kanjiVisible) {
      this.ball.setAttribute('visible', 'false');
      return;
    }

    // Make ball visible
    this.ball.setAttribute('visible', 'true');

    // Get world positions
    this.kanji.object3D.getWorldPosition(this.start);
    this.hiro.object3D.getWorldPosition(this.end);

    // Update t
    this.t += (deltaTime / 1000) * 0.5 * this.direction;
    if (this.t >= 1) {
      this.t = 1;
      this.direction = -1;
    } else if (this.t <= 0) {
      this.t = 0;
      this.direction = 1;
    }

    // Lerp position
    const lerpPos = new THREE.Vector3().lerpVectors(this.start, this.end, this.t);
    this.ball.object3D.position.copy(lerpPos);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('a-scene').setAttribute('ball-movement', '');
});