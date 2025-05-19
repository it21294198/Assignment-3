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

    // Score tracking
    this.scores = { Hiro: 0, Kanji: 0 };
    this.maxScore = 5;
    this.createUI();
    this.updateScoreUI();
    this.trajectory = { start: new THREE.Vector3(), end: new THREE.Vector3() };
    this.setTrajectory();
  },

  createUI: function () {
    // Create overlay for scores and messages
    let overlay = document.getElementById('game-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'game-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '20px';
      overlay.style.left = '50%';
      overlay.style.transform = 'translateX(-50%)';
      overlay.style.background = 'rgba(0,0,0,0.6)';
      overlay.style.color = '#fff';
      overlay.style.padding = '10px 30px';
      overlay.style.borderRadius = '10px';
      overlay.style.fontSize = '1.5em';
      overlay.style.zIndex = '9999';
      overlay.innerHTML = '<span id="score-text"></span> <span id="message-text"></span>';
      document.body.appendChild(overlay);
    }
  },

  updateScoreUI: function (message = '') {
    document.getElementById('score-text').textContent = `Hiro: ${this.scores.Hiro} | Kanji: ${this.scores.Kanji}`;
    document.getElementById('message-text').textContent = message;
  },

  setTrajectory: function () {
    // Set the start and end positions for the current direction
    const from = this.direction === 1 ? this.kanji : this.hiro;
    const to = this.direction === 1 ? this.hiro : this.kanji;
    from.object3D.getWorldPosition(this.trajectory.start);
    to.object3D.getWorldPosition(this.trajectory.end);
  },

  resetGame(winner) {
    this.scores[winner]++;
    this.updateScoreUI(`${winner} scores!`);
    if (this.scores[winner] >= this.maxScore) {
      this.active = false;
      this.updateScoreUI(`${winner} wins the game!`);
      setTimeout(() => {
        this.scores = { Hiro: 0, Kanji: 0 };
        this.speed = 0.5;
        this.updateScoreUI('New game!');
        this.active = true;
        this.t = 0;
      }, 4000);
      return;
    }
    this.t = 0;
    this.direction = 1;
    this.active = false;
    this.ball.setAttribute('visible', 'false');
    this.speed = 0.5; // reset speed after a point
    // Wait 2s and restart
    setTimeout(() => {
      this.active = true;
      this.t = 0;
      this.updateScoreUI();
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

    // Move ball along the locked trajectory
    this.t += (deltaTime / 1000) * this.speed;

    if (this.t >= 1) {
      this.t = 0;
      // Check if destination marker is visible
      const to = this.direction === 1 ? this.hiro : this.kanji;
      if (!to.object3D.visible) {
        const loser = this.direction === 1 ? 'Hiro' : 'Kanji';
        const winner = this.direction === 1 ? 'Kanji' : 'Hiro';
        this.resetGame(winner);
        return;
      }
      this.direction *= -1; // reverse direction
      // Lock new trajectory for the next shot
      this.setTrajectory();
      // Increase speed after each successful hit
      this.speed = Math.min(this.speed + 0.1, 2.0);
      this.updateScoreUI('Speed up!');
      setTimeout(() => this.updateScoreUI(), 800);
    }

    // Interpolate along the locked trajectory
    const lerpPos = new THREE.Vector3().lerpVectors(this.trajectory.start, this.trajectory.end, this.t);
    this.ball.object3D.position.copy(lerpPos);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('a-scene').setAttribute('ping-pong-game', '');
});