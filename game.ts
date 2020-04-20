export type Status = 'dead' | 'alive';

export interface Cell {
  status: Status;
}

type GenerationMatrix = Cell[][];

export interface CellSelector {
  x: number;
  y: number;
}

export interface CreateGenerationArgs {
  /**
   * The size of the matrix that will be generated.
   */
  size: { x: number; y: number };
  /**
   * Whether to fill the matrix with dead cells. If `false`
   * a new matrix with of dimensions of size will be created
   * but with empty values instead of cells.
   *
   * @remark
   * Passing true makes this function O(x*y) instead of O(y).
   *
   * Defaults to true.
   */
  fill?: boolean;
}

export const createGenerationMatrix = ({
  size: { x, y },
  fill = true,
}: CreateGenerationArgs): GenerationMatrix => {
  const mtx = new Array<Cell[]>(y);
  for (let yIdx = 0; yIdx < mtx.length; ++yIdx) {
    const xArray = new Array<Cell>(x);
    if (fill) {
      for (let xIdx = 0; xIdx < xArray.length; ++xIdx) {
        xArray[xIdx] = { status: 'dead' };
      }
    }
    mtx[yIdx] = xArray;
  }

  return mtx;
};

type Neighbors = [Cell?, Cell?, Cell?, Cell?, Cell?, Cell?, Cell?, Cell?];

const extractNeighbors = (
  gen: GenerationMatrix,
  { x, y }: CellSelector
): Neighbors => {
  const above = y - 1;
  const adjacent = y;
  const beneath = y + 1;
  const left = x - 1;
  const middle = x;
  const right = x + 1;

  const topN = gen[above]
    ? [gen[above][left], gen[above][middle], gen[above][right]]
    : [];

  const middleN = [gen[adjacent][left], gen[adjacent][right]];

  const bottomN = gen[beneath]
    ? [gen[beneath][left], gen[beneath][middle], gen[beneath][right]]
    : [];

  return [...topN, ...middleN, ...bottomN] as Neighbors;
};

/**
 * Calculate the next generation as a pure function of the current one.
 *
 * This applies the game rules to each cell _simultaneously_ to
 * achieve the desired affect of Conway's game of life.
 */
export const nextGeneration = (
  currentGen: GenerationMatrix
): GenerationMatrix => {
  const [firstRow] = currentGen;
  const next = createGenerationMatrix({
    size: { y: currentGen.length, x: firstRow?.length ?? 0 },
    fill: false,
  });

  currentGen.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      const liveNeighborsCount = extractNeighbors(currentGen, {
        x: cIdx,
        y: rIdx,
      }).reduce((countAcc, neighborCell) => {
        if (neighborCell && neighborCell.status === 'alive') {
          return countAcc + 1;
        }
        return countAcc;
      }, 0);

      // Game rules
      if (
        cell.status === 'alive' &&
        liveNeighborsCount !== 2 &&
        liveNeighborsCount !== 3
      ) {
        next[rIdx][cIdx] = { status: 'dead' };
      } else if (cell.status === 'dead' && liveNeighborsCount === 3) {
        next[rIdx][cIdx] = { status: 'alive' };
      } else {
        next[rIdx][cIdx] = { ...cell };
      }
    });
  });

  return next;
};

const toggleCellState = (
  gen: GenerationMatrix,
  { x, y }: CellSelector
): void => {
  gen[y][x].status = gen[y][x].status === 'alive' ? 'dead' : 'alive';
};

export const mutate = {
  toggleCellState,
};
