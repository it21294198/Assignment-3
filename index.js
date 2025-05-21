// // Get references to entities
// const racket1 = document.querySelector("#tennis-racket-1");
// const racket2 = document.querySelector("#tennis-racket-2");
// const ball = document.querySelector("#tennis-ball");

// let ballDirection = { x: 0, y: 0.02, z: 0.05 }; // Initial direction/speed

// function animateBall() {
//   if (!ball.object3D.visible) return;

//   // Get current ball position
//   const pos = ball.object3D.position;

//   // Update ball position
//   pos.x += ballDirection.x;
//   pos.y += ballDirection.y;
//   pos.z += ballDirection.z;

//   // Collision check with racket2
//   if (checkCollision(racket2, ball)) {
//     ballDirection.z = -Math.abs(ballDirection.z); // Reflect back
//   }

//   // Collision check with racket1
//   if (checkCollision(racket1, ball)) {
//     ballDirection.z = Math.abs(ballDirection.z); // Reflect forward
//   }

//   // Simple bounce from ground or ceiling
//   if (pos.y <= 0 || pos.y >= 1.5) {
//     ballDirection.y *= -1;
//   }

//   // Reset ball if it goes too far
//   if (Math.abs(pos.z) > 3) {
//     pos.set(0, 0.5, 0);
//     ballDirection = { x: 0, y: 0.02, z: 0.05 };
//   }

//   requestAnimationFrame(animateBall);
// }

// function checkCollision(racket, ball) {
//   const racketPos = racket.object3D.position;
//   const ballPos = ball.object3D.position;

//   const dx = racketPos.x - ballPos.x;
//   const dy = racketPos.y - ballPos.y;
//   const dz = racketPos.z - ballPos.z;

//   const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

//   return distance < 0.5; // Adjust based on your models' sizes
// }

// // Wait until models are loaded
// window.addEventListener("load", () => {
//   setTimeout(() => {
//     if (ball && ball.object3D) {
//       animateBall();
//     }
//   }, 3000); // Wait a bit for models to load
// });