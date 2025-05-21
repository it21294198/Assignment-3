// AR Tennis Game Logic for Animated Rackets and Ball
AFRAME.registerComponent('tennis-game', {
  schema: {},
  
  init: function () {
    // References to entities
    this.racket1 = document.querySelector('#tennis-racket-1'); // Main player (kanji marker)
    this.racket2 = document.querySelector('#tennis-racket-2'); // Opponent (hero marker)
    this.ball = document.querySelector('#tennis-ball');
    this.court = document.querySelector('#tennis-court');
    
    // Parent markers
    this.racket1Marker = this.racket1.parentElement;
    this.racket2Marker = this.racket2.parentElement;
    
    // Game state
    this.scores = { player1: 0, player2: 0 };
    
    // Ball physics state
    this.ballState = {
      t: 0,                      // Current interpolation value (0-1)
      speed: 0.5,                // Speed factor
      direction: 1,              // 1: racket1->racket2, -1: racket2->racket1
      active: false,             // Is ball currently in play
      start: new THREE.Vector3(), // Start position of current trajectory
      end: new THREE.Vector3(),   // End position of current trajectory
      midPoint: new THREE.Vector3(), // Arc high point
      maxHeight: 2,               // Maximum height of ball arc
      waiting: false             // Waiting for player input
    };
    
    // Racket animation states
    this.racketStates = {
      racket1: {
        basePosition: new THREE.Vector3(0, 0, 0),
        baseRotation: new THREE.Euler(0, Math.PI/2, 0),
        readyPosition: new THREE.Vector3(0, 0.3, -0.2),
        readyRotation: new THREE.Euler(-0.2, Math.PI/2, 0),
        swingPositions: [
          { pos: new THREE.Vector3(-0.1, 0.4, -0.1), rot: new THREE.Euler(-0.3, Math.PI/2, -0.2), time: 0.2 },
          { pos: new THREE.Vector3(0.1, 0.5, 0), rot: new THREE.Euler(-0.1, Math.PI/2, 0.2), time: 0.3 },
          { pos: new THREE.Vector3(0.2, 0.3, 0.2), rot: new THREE.Euler(0.1, Math.PI/2, 0.3), time: 0.5 }
        ],
        animating: false,
        currentAnimation: null,
        lastSwingTime: 0
      },
      racket2: {
        basePosition: new THREE.Vector3(0, 0, 0),
        baseRotation: new THREE.Euler(0, Math.PI/2, 0),
        readyPosition: new THREE.Vector3(0, 0.3, -0.2),
        readyRotation: new THREE.Euler(-0.2, Math.PI/2, 0),
        swingPositions: [
          { pos: new THREE.Vector3(-0.1, 0.4, -0.1), rot: new THREE.Euler(-0.3, Math.PI/2, -0.2), time: 0.2 },
          { pos: new THREE.Vector3(0.1, 0.5, 0), rot: new THREE.Euler(-0.1, Math.PI/2, 0.2), time: 0.3 },
          { pos: new THREE.Vector3(0.2, 0.3, 0.2), rot: new THREE.Euler(0.1, Math.PI/2, 0.3), time: 0.5 }
        ],
        animating: false,
        currentAnimation: null,
        lastSwingTime: 0
      }
    };
    
    // Set rackets to base position
    this.setRacketToBasePosition(this.racket1, this.racketStates.racket1);
    this.setRacketToBasePosition(this.racket2, this.racketStates.racket2);
    
    // Ball arc calculation
    this.calculateArc = () => {
      // Get midpoint between rackets for arc calculation
      this.midPoint = new THREE.Vector3().addVectors(
        this.ballState.start, 
        this.ballState.end
      ).multiplyScalar(0.5);
      
      // Set arc height
      this.midPoint.y += this.ballState.maxHeight;
    };
    
    // Initialize ball arc
    this.calculateArc();
    
    // Listen for keyboard input to "hit" the ball
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.ballState.active) {
        this.handlePlayerInput();
      }
    });
    
    // Add touch/click controls for mobile
    document.addEventListener('click', () => {
      if (this.ballState.active) {
        this.handlePlayerInput();
      }
    });
    
    // Start the game when all markers are visible
    this.checkMarkerVisibility();
  },
  
  setRacketToBasePosition: function(racket, racketState) {
    racket.object3D.position.copy(racketState.basePosition);
    racket.object3D.rotation.set(
      racketState.baseRotation.x,
      racketState.baseRotation.y,
      racketState.baseRotation.z
    );
  },
  
  setRacketToReadyPosition: function(racket, racketState) {
    this.animateRacketTransform(
      racket,
      racketState.basePosition,
      racketState.readyPosition,
      racketState.baseRotation,
      racketState.readyRotation,
      0.5 // duration in seconds
    );
  },
  
  handlePlayerInput: function() {
    // Only allow hit when ball is approaching player 1
    if (this.ballState.direction === -1 && !this.ballState.waiting) {
      // Player hit timing check (ball must be in last 40% of trajectory)
      if (this.ballState.t > 0.6) {
        this.hitBall();
      }
    }
  },
  
  animateRacketTransform: function(racket, startPos, endPos, startRot, endRot, duration) {
    const startTime = performance.now();
    const obj = racket.object3D;
    
    // Store original positions/rotations
    const originalPos = new THREE.Vector3().copy(startPos);
    const originalRot = new THREE.Euler(startRot.x, startRot.y, startRot.z);
    const targetPos = new THREE.Vector3().copy(endPos);
    const targetRot = new THREE.Euler(endRot.x, endRot.y, endRot.z);
    
    // Set up animation
    const animateStep = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easing function for smoother animation
      const eased = this.easeInOutCubic(progress);
      
      // Interpolate position
      obj.position.lerpVectors(originalPos, targetPos, eased);
      
      // Interpolate rotation (Euler angles)
      obj.rotation.set(
        this.lerpAngle(originalRot.x, targetRot.x, eased),
        this.lerpAngle(originalRot.y, targetRot.y, eased),
        this.lerpAngle(originalRot.z, targetRot.z, eased)
      );
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animateStep);
      }
    };
    
    // Start animation
    requestAnimationFrame(animateStep);
  },
  
  // Easing function for smooth animation
  easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  
  // Lerp function specifically for angles (handles wrapping)
  lerpAngle: function(start, end, t) {
    // Find the shortest path between angles
    const diff = (end - start) % (Math.PI * 2);
    const shortestDiff = diff < -Math.PI ? diff + Math.PI * 2 : diff > Math.PI ? diff - Math.PI * 2 : diff;
    return start + shortestDiff * t;
  },
  
  // Full racket swing animation sequence
  performFullSwing: function(racketObj, racketState) {
    // Prevent multiple overlapping swings
    if (racketState.animating) return;
    
    racketState.animating = true;
    
    // Store original position and rotation
    const originalPos = new THREE.Vector3().copy(racketObj.object3D.position);
    const originalRot = new THREE.Euler().copy(racketObj.object3D.rotation);
    
    // Function to chain animations
    const chainAnimations = (index) => {
      if (index >= racketState.swingPositions.length) {
        // Return to ready position when complete
        this.animateRacketTransform(
          racketObj,
          racketObj.object3D.position,
          racketState.readyPosition,
          racketObj.object3D.rotation,
          racketState.readyRotation,
          0.3
        );
        
        // Animation complete
        setTimeout(() => {
          racketState.animating = false;
        }, 300);
        
        return;
      }
      
      const swingPos = racketState.swingPositions[index];
      
      // Animate to next position in sequence
      this.animateRacketTransform(
        racketObj,
        racketObj.object3D.position,
        swingPos.pos,
        racketObj.object3D.rotation,
        swingPos.rot,
        swingPos.time
      );
      
      // Chain to next position after duration
      setTimeout(() => {
        chainAnimations(index + 1);
      }, swingPos.time * 1000);
    };
    
    // Start the animation sequence
    chainAnimations(0);
  },
  
  checkMarkerVisibility: function() {
    // Start a continuous check for marker visibility
    setInterval(() => {
      const racket1Visible = this.racket1Marker.object3D.visible;
      const racket2Visible = this.racket2Marker.object3D.visible;
      
      // If both markers are visible and ball isn't in play, serve
      if (racket1Visible && racket2Visible && !this.ballState.active) {
        // When markers first appear, set rackets to ready position
        this.setRacketToReadyPosition(this.racket1, this.racketStates.racket1);
        this.setRacketToReadyPosition(this.racket2, this.racketStates.racket2);
        
        // Start game after rackets are in ready position
        setTimeout(() => {
          this.startGame();
        }, 600);
      }
      
      // If any marker disappears while ball is in play, pause game
      if (!racket1Visible || !racket2Visible) {
        this.ball.setAttribute('visible', 'false');
        this.ballState.active = false;
      }
    }, 500); // Check every 500ms
  },
  
  startGame: function() {
    // Set initial ball position to racket1
    this.updateRacketPositions();
    
    // Make ball visible
    this.ball.setAttribute('visible', 'true');
    
    // Start with the ball at racket1
    this.ball.object3D.position.copy(this.ballState.start);
    
    // Begin the game with an automatic serve after a delay
    setTimeout(() => {
      this.ballState.active = true;
      this.ballState.direction = 1; // Serve from player 1 to player 2
      this.ballState.t = 0;
      this.setBallTrajectory();
      
      // Perform full swing animation instead of simple rotation
      this.performFullSwing(this.racket1, this.racketStates.racket1);
    }, 1000);
  },
  
  setBallTrajectory: function() {
    // Update racket positions
    this.updateRacketPositions();
    
    // Set trajectory based on direction
    if (this.ballState.direction === 1) {
      // Ball travels from racket1 to racket2
      this.ballState.start.copy(this.racket1.object3D.position);
      this.ballState.end.copy(this.racket2.object3D.position);
    } else {
      // Ball travels from racket2 to racket1
      this.ballState.start.copy(this.racket2.object3D.position);
      this.ballState.end.copy(this.racket1.object3D.position);
    }
    
    // Adjust Y positions for better visual
    this.ballState.start.y += 0.5;
    this.ballState.end.y += 0.5;
    
    // Calculate the arc
    this.calculateArc();
    
    // Reset timer
    this.ballState.t = 0;
    this.ballState.waiting = false;
  },
  
  updateRacketPositions: function() {
    // Get world positions of rackets
    const racket1Pos = new THREE.Vector3();
    const racket2Pos = new THREE.Vector3();
    
    this.racket1.object3D.getWorldPosition(racket1Pos);
    this.racket2.object3D.getWorldPosition(racket2Pos);
    
    // Store updated positions
    this.racket1.worldPosition = racket1Pos;
    this.racket2.worldPosition = racket2Pos;
  },
  
  hitBall: function() {
    // Perform full swing animation
    this.performFullSwing(this.racket1, this.racketStates.racket1);
    
    // Reverse ball direction
    this.ballState.direction = 1;
    this.ballState.t = 0;
    this.ballState.waiting = false;
    
    // Set new trajectory
    this.setBallTrajectory();
    
    // Play sound effect (if implemented)
    // this.playSound('hit');
  },
  
  computerHit: function() {
    // Perform full swing animation for computer player
    this.performFullSwing(this.racket2, this.racketStates.racket2);
    
    // Reverse ball direction
    this.ballState.direction = -1;
    this.ballState.t = 0;
    
    // Set new trajectory
    this.setBallTrajectory();
    
    // Play sound effect (if implemented)
    // this.playSound('hit');
  },
  
  // Basic racket rotation (legacy method kept for compatibility)
  animateRacket: function(racket, angle, duration) {
    // Simple swing animation: rotate Z by angle, then back
    const obj = racket.object3D;
    const origRot = obj.rotation.z;
    const targetRot = origRot + THREE.MathUtils.degToRad(angle);
    const startTime = performance.now();
    
    const animateStep = (currentTime) => {
      const elapsed = currentTime - startTime;
      
      if (elapsed < duration/2) {
        // Forward swing
        const progress = elapsed / (duration/2);
        obj.rotation.z = origRot + (targetRot - origRot) * progress;
        requestAnimationFrame(animateStep);
      } else if (elapsed < duration) {
        // Backward swing
        const progress = (elapsed - duration/2) / (duration/2);
        obj.rotation.z = targetRot - (targetRot - origRot) * progress;
        requestAnimationFrame(animateStep);
      } else {
        // Reset position
        obj.rotation.z = origRot;
      }
    };
    
    requestAnimationFrame(animateStep);
  },
  
  quadraticBezier: function(p0, p1, p2, t) {
    // Quadratic Bezier curve formula for smooth ball arc
    const result = new THREE.Vector3();
    
    // B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂, where 0 ≤ t ≤ 1
    const mt = 1 - t;
    result.x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
    result.y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
    result.z = mt * mt * p0.z + 2 * mt * t * p1.z + t * t * p2.z;
    
    return result;
  },
  
  tick: function(time, deltaTime) {
    // Only animate if ball is active
    if (!this.ballState.active) return;
    
    // Only animate if both markers are visible
    if (!this.racket1Marker.object3D.visible || !this.racket2Marker.object3D.visible) {
      this.ball.setAttribute('visible', 'false');
      return;
    }
    
    // Make ball visible
    this.ball.setAttribute('visible', 'true');
    
    // If waiting for player input, don't update ball position
    if (this.ballState.waiting) return;
    
    // Update t based on deltaTime and speed
    this.ballState.t += (deltaTime / 1000) * this.ballState.speed;
    
    // Ball has reached destination
    if (this.ballState.t >= 1) {
      if (this.ballState.direction === 1) {
        // Ball reached player 2, computer responds automatically
        this.computerHit();
      } else {
        // Ball reached player 1, wait for input
        this.ballState.waiting = true;
        
        // If player doesn't hit in time, they miss
        setTimeout(() => {
          if (this.ballState.waiting) {
            // Player missed, reset the game with a new serve
            this.ballState.active = false;
            setTimeout(() => this.startGame(), 1000);
          }
        }, 800); // 800ms to respond
      }
    } else {
      // Move the ball along the arc trajectory using quadratic bezier
      const position = this.quadraticBezier(
        this.ballState.start,
        this.midPoint,
        this.ballState.end,
        this.ballState.t
      );
      
      // Update ball position
      this.ball.object3D.position.copy(position);
      
      // Add ball spin rotation for visual effect
      this.ball.object3D.rotation.x += 0.1;
      this.ball.object3D.rotation.z += 0.05;
    }
  }
});

// Attach the game logic to the scene when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('a-scene').setAttribute('tennis-game', '');
});