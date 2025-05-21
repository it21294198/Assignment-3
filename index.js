// Ping Pong AR Game Logic for Animated Rackets and Ball
AFRAME.registerComponent('tennis-game', {
  schema: {},
  init: function () {
    // Entities
    this.racket1 = document.querySelector('#tennis-racket-1'); // Main player (kanji marker)
    this.racket2 = document.querySelector('#tennis-racket-2'); // Opponent (hero marker)
    this.ball = document.querySelector('#tennis-ball');
    this.court = document.querySelector('#tennis-court');
    this.racket1Marker = this.racket1.parentElement;
    this.racket2Marker = this.racket2.parentElement;

    // Ball movement state
    this.ballState = {
      t: 0,
      speed: 0.5,
      direction: 1, // 1: racket1->racket2, -1: racket2->racket1
      active: true,
      start: new THREE.Vector3(),
      end: new THREE.Vector3(),
      locked: false
    };
    this.setBallTrajectory();

    // Listen for user input to "hit" the ball (main player)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.ballState.direction === -1 && this.ballState.active) {
        // Player hits the ball back
        this.hitBall();
      }
    });
  },

  setBallTrajectory: function () {
    // Lock the ball's start/end positions for the current shot
    const from = this.ballState.direction === 1 ? this.racket1 : this.racket2;
    const to = this.ballState.direction === 1 ? this.racket2 : this.racket1;
    from.object3D.getWorldPosition(this.ballState.start);
    to.object3D.getWorldPosition(this.ballState.end);
    this.ballState.locked = true;
  },

  hitBall: function () {
    // Animate racket1 swing
    this.animateRacket(this.racket1, 30, 200);
    // Reverse ball direction and lock new trajectory
    this.ballState.direction = 1;
    this.ballState.t = 0;
    this.setBallTrajectory();
    // Set a timer: if player doesn't hit again, auto send ball back after a delay
    if (this.hitTimeout) clearTimeout(this.hitTimeout);
    this.hitTimeout = setTimeout(() => {
      if (this.ballState.direction === 1 && this.ballState.t === 0) {
        // Auto send ball again from racket1
        this.hitBall();
      }
    }, 1200); // 1.2s to hit again
  },

  animateRacket: function (racket, angle, duration) {
    // Simple swing animation: rotate Z by angle, then back
    const obj = racket.object3D;
    const origRot = obj.rotation.z;
    const targetRot = origRot + THREE.MathUtils.degToRad(angle);
    let t = 0;
    const step = (timestamp) => {
      t += 16;
      if (t < duration/2) {
        obj.rotation.z = origRot + (targetRot-origRot)*(t/(duration/2));
        requestAnimationFrame(step);
      } else if (t < duration) {
        obj.rotation.z = targetRot - (targetRot-origRot)*((t-duration/2)/(duration/2));
        requestAnimationFrame(step);
      } else {
        obj.rotation.z = origRot;
      }
    };
    requestAnimationFrame(step);
  },

  tick: function (time, deltaTime) {
    // Only animate if both markers are visible
    if (!this.racket1Marker.object3D.visible || !this.racket2Marker.object3D.visible) {
      this.ball.setAttribute('visible', 'false');
      return;
    }
    this.ball.setAttribute('visible', 'true');

    // Move the ball
    this.ballState.t += (deltaTime / 1000) * this.ballState.speed;
    if (this.ballState.t >= 1) {
      this.ballState.t = 0;
      // Animate racket swing for the hitter
      if (this.ballState.direction === 1) {
        this.animateRacket(this.racket2, -30, 200);
      } else {
        this.animateRacket(this.racket1, 30, 200);
      }
      // Reverse direction
      this.ballState.direction *= -1;
      this.setBallTrajectory();
    }
    // Interpolate ball position
    const lerpPos = new THREE.Vector3().lerpVectors(this.ballState.start, this.ballState.end, this.ballState.t);
    this.ball.object3D.position.copy(lerpPos);
  }
});

// Attach the game logic to the scene
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('a-scene').setAttribute('tennis-game', '');
});