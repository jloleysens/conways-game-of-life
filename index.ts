import { createGenerationMatrix, mutate, nextGeneration } from './game';

const SIZE_Y = 50;
const SIZE_X = 50;
const GEN_CAP = 100;
const FPS = 100;

(function main() {
  let gen = createGenerationMatrix({
    size: {
      x: 10,
      y: 10,
    },
    fill: true,
  });

  const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
  const stepButton = document.querySelector<HTMLCanvasElement>('#step');

  const canvasClickHandler = (event: MouseEvent) => {
    const {
      x: canvasXOffset,
      y: canvasYOffset,
    } = canvas.getBoundingClientRect();
    const xIdx = Math.floor((event.clientX - canvasXOffset) / SIZE_Y);
    const yIdx = Math.floor((event.clientY - canvasYOffset) / SIZE_Y);
    mutate.toggleCellState(gen, { x: xIdx, y: yIdx });
    render();
  };

  const ctx = canvas.getContext('2d');
  const emptyRect = ctx.rect.bind(ctx);
  const fillRect = ctx.fillRect.bind(ctx);
  const clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

  let currentGen: number;
  const simulate = (done: () => void) => {
    if (currentGen < GEN_CAP) {
      gen = nextGeneration(gen);
      ++currentGen;
      render();
      setTimeout(() => simulate(done), FPS);
    } else {
      done();
    }
  };

  let running = false;
  const stepHandler = () => {
    if (running) {
      return;
    }
    running = true;
    currentGen = 0;
    canvas.removeEventListener('click', canvasClickHandler);
    simulate(() => {
      canvas.addEventListener('click', canvasClickHandler);
      running = false;
    });
  };

  const render = () => {
    clear();
    gen.forEach((row, rowIdx) => {
      row.forEach((cell, cellIdx) => {
        ctx.beginPath();
        const rectFn = cell.status === 'dead' ? emptyRect : fillRect;
        rectFn(cellIdx * SIZE_Y, rowIdx * SIZE_Y, SIZE_Y, SIZE_X);
        ctx.stroke();
      });
    });
  };

  canvas.addEventListener('click', canvasClickHandler);
  stepButton.addEventListener('click', stepHandler);

  render();
})();
