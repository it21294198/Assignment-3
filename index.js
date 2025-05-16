// index.js

window.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('sizeSlider');
  const model = document.getElementById('model');

  slider.addEventListener('input', (e) => {
    const scale = e.target.value;
    model.setAttribute('scale', `${scale} ${scale} ${scale}`);
  });
});
