window.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('sizeSlider');
  const model = document.getElementById('model');

  // Update model scale when slider changes
  slider.addEventListener('input', (e) => {
    const scale = e.target.value;
    model.setAttribute('scale', `${scale} ${scale} ${scale}`);
  });
});