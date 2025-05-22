// index.js

window.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('sizeSlider');
  const model = document.getElementById('model');
  this.court = document.querySelector('#tennis-court');

  slider.addEventListener('input', (e) => {
    const scale = e.target.value;
    model.setAttribute('scale', `${scale} ${scale} ${scale}`);
  });
});
