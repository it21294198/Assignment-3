AFRAME.registerComponent('ping-pong-game', {
  init: function () {
    this.ball = document.querySelector('#ball');
    this.hiro = document.querySelector('#hiroMarker');
    this.kanji = document.querySelector('#kanjiMarker');

    this.start = new THREE.Vector3();
    this.end = new THREE.Vector3();
    this.t = 0;
    this.speed = 0.5; // ball speed
    this.direction = 1; // 1: kanji -> hiro, -1: hiro -> kanji
    this.active = true;
  },

  resetGame(winner) {
    alert(`${winner} wins!`);
    this.t = 0;
    this.direction = 1;
    this.active = false;
    this.ball.setAttribute('visible', 'false');

    // Wait 2s and restart
    setTimeout(() => {
      this.active = true;
      this.t = 0;
    }, 2000);
  },

  tick: function (time, deltaTime) {
    if (!this.active) return;

    const hiroVisible = this.hiro.object3D.visible;
    const kanjiVisible = this.kanji.object3D.visible;

    if (!hiroVisible || !kanjiVisible) {
      this.ball.setAttribute('visible', 'false');
      return;
    }

    this.ball.setAttribute('visible', 'true');

    // Get world positions
    this.kanji.object3D.getWorldPosition(this.start);
    this.hiro.object3D.getWorldPosition(this.end);

    // Swap start/end based on direction
    const from = this.direction === 1 ? this.kanji : this.hiro;
    const to = this.direction === 1 ? this.hiro : this.kanji;

    from.object3D.getWorldPosition(this.start);
    to.object3D.getWorldPosition(this.end);

    this.t += (deltaTime / 1000) * this.speed;

    if (this.t >= 1) {
      this.t = 0;

      // Check if destination marker is visible
      if (!to.object3D.visible) {
        const loser = this.direction === 1 ? 'Hiro' : 'Kanji';
        const winner = this.direction === 1 ? 'Kanji' : 'Hiro';
        this.resetGame(winner);
        return;
      }

      this.direction *= -1; // reverse direction
    }

    const lerpPos = new THREE.Vector3().lerpVectors(this.start, this.end, this.t);
    this.ball.object3D.position.copy(lerpPos);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('a-scene').setAttribute('ping-pong-game', '');
});