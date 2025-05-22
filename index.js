AFRAME.registerComponent('tennis-game', {
  init: function () {
    this.ball = document.querySelector('#tennis-ball');
    this.direction = 1;
    this.speed = 0.01;
  },
  tick: function () {
    if (!this.ball) return;

    const pos = this.ball.getAttribute('position');
    pos.z += this.direction * this.speed;

    if (pos.z >= 0.5) this.direction = -1;
    if (pos.z <= -0.5) this.direction = 1;

    this.ball.setAttribute('position', pos);
  }
});