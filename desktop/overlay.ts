const canvas = document.getElementById('overlayCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function drawBoxes(boxes: { x: number; y: number; w: number; h: number }[]) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#00FF88';
  ctx.lineWidth = 2;
  boxes.forEach(b => {
    ctx.strokeRect(b.x, b.y, b.w, b.h);
  });
}

// listen from preload
if (window.overlay) {
  window.overlay.onBoxesUpdate((boxes: any[]) => drawBoxes(boxes));
}