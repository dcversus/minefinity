import { CellCords, CellStateInterface, GameStateInterface } from './interfaces';
import { VIEW_STATE, TILE_WIDTH, LOAD_CHUNK_DEEP, REVEAL_DEEP } from './constants';
import { Cell } from './components/cell';

export let GameState: GameStateInterface = {
  textures: {},
  cursor: [0, 0],
  fieldWidth: 0,
  fieldHeight: 0,
  fieldMines: 0,
  chunkSize: 0,
  field: {},
  chunks: {},
  openedCells: 0,
  gameOver: false,
  gameWin: false,
  dragging: false,
  insurance: true
}

// GameState.chunkSize = 10;
// GameState.fieldWidth = 10;
// GameState.fieldHeight = 10;
// GameState.fieldMines = 5;
// const GameState.chunkSize = 128;
// const GameState.fieldWidth = 10000000;
// const GameState.fieldHeight = 10000000;
// const GameState.fieldMines = 10000000000000;

export function resetGame() {
  GameState = {
    ...GameState,
    cursor: [0, 0],
    chunks: {},
    field: {},
    gameOver: false,
    gameWin: false,
    insurance: true,
    openedCells: 0
  };

  GameState.resetGame();
}

export function updateSmileView() {
  GameState.smileButton.updateSmileView();
}

export async function generateChunk([x, y]: CellCords, deep = LOAD_CHUNK_DEEP) {
  const offsetRange = [-GameState.chunkSize, 0, GameState.chunkSize];

  if (x <= 0 || x > GameState.fieldWidth || y <= 0 || y > GameState.fieldHeight) {
    return;
  }

  if (!deep) {
    return;
  }
  for (let xOffset of offsetRange) {
    for (let yOffset of offsetRange) {
      generateChunk([x + xOffset, y + yOffset], deep - 1);
    }
  }

  const normalizedChunkX = Math.ceil(x / GameState.chunkSize) - 1;
  const normalizedChunkY = Math.ceil(y / GameState.chunkSize) - 1;

  if (GameState.chunks[`${normalizedChunkX}_${normalizedChunkY}`]) {
    return;
  }

  GameState.chunks[`${normalizedChunkX}_${normalizedChunkY}`] = true;

  const chunkWidthCount = Math.ceil(GameState.fieldWidth / GameState.chunkSize);
  const chunkHeightCount = Math.ceil(GameState.fieldHeight / GameState.chunkSize);
  const minesPerChunk = Math.ceil(GameState.fieldMines / (chunkWidthCount * chunkHeightCount));

  const chunkXoffset = normalizedChunkX * GameState.chunkSize;
  const chunkYoffset = normalizedChunkY * GameState.chunkSize;

  for (let mineCoords of getUniqueCoords([chunkXoffset, chunkYoffset], minesPerChunk)) {
    placeMine(mineCoords);

    for await (let neighbourCell of getNeighbours(mineCoords)) {
      addNeighbour(neighbourCell);
    }
  }
}

export function renderCells(gameContainer) {
  const leftCorner = -Math.floor(gameContainer.x / TILE_WIDTH);
  const rightCorner = leftCorner + Math.floor(window.innerWidth / TILE_WIDTH);
  const topCorner = -Math.floor(gameContainer.y / TILE_WIDTH);
  const bottomCorner = topCorner + Math.floor(window.innerHeight / TILE_WIDTH);

  for (let cellIndex = 0; cellIndex < gameContainer.children.length -1; cellIndex++) {
    const sprite = gameContainer.children[cellIndex];
    const { x: cellX, y: cellY } = sprite.cellState;

    if (cellX <= leftCorner || cellX >= rightCorner || cellY <= topCorner || cellY >= bottomCorner) {
      gameContainer.removeChild(sprite);
    }
  }

  for (let cellX = leftCorner; cellX < rightCorner; cellX++) {
    for (let cellY = topCorner; cellY < bottomCorner; cellY++) {
      const cell = getCell([cellX, cellY]);

      if (cell && !cell?.sprite?.parent) {
        gameContainer.addChild(new Cell(cell));
      }
    }
  }
}

function getCell([x, y]: CellCords): CellStateInterface {
  return GameState.field[`${x}_${y}`];
}

export function isCellAdded([x, y]: CellCords): boolean {
  return !!getCell([x, y]);
}

function updateCell([x, y]: CellCords, reducer: (cell: CellStateInterface) => CellStateInterface) {
  let cell = getCell([x, y]);

  if (!cell) {
    cell = {
      viewState: VIEW_STATE.closed,
      x,
      y,
    };
  }

  GameState.field[`${x}_${y}`] = reducer(cell);

  if (cell.sprite) {
    cell.sprite.updateView();
  }
}

function placeMine([x, y]: CellCords) {
  updateCell([x, y], cell => {
    cell.isMine = true;

    return cell;
  });
}

function addNeighbour([x, y]: CellCords, count = 1) {
  updateCell([x, y], cell => {
    cell.neighbours = cell.neighbours ? cell.neighbours + count : 1;

    return cell;
  });
}

export function openCell([x, y]: CellCords) {
  updateCell([x, y], cell => {
    if (!cell.isFlagged && !GameState.gameOver) {
      if (cell.neighbours) {
        cell.viewState = VIEW_STATE.tip;
      } else {
        cell.viewState = VIEW_STATE.empty;
      }

      if (cell.isMine && !GameState.insurance) {
        console.log('luser');
        cell.viewState = VIEW_STATE.wrong;
        GameState.gameOver = true;
        updateSmileView();
      }

      if (cell.isMine && GameState.insurance) {
        console.log('babah');
        GameState.insurance = false;
        cell.isMine = false;
        cell.viewState = cell.neighbours ? VIEW_STATE.tip : VIEW_STATE.empty;

        for (let neighbourCell of getNeighbours([cell.x, cell.y])) {
          addNeighbour(neighbourCell, -1);
        }

        let newX;
        let newY;

        do {
          newX = Math.floor(Math.random() * GameState.chunkSize);
          newY = Math.floor(Math.random() * GameState.chunkSize);
        } while (!isCellAdded([newX, newY]));

        placeMine([newX, newY]);

        for (let neighbourCell of getNeighbours([newX, newY])) {
          addNeighbour(neighbourCell);
        }
      }

      if (GameState.insurance) {
        console.log('lucky');
        GameState.insurance = false;
      }

      if (!cell.isOpen && !cell.isMine) {
        GameState.openedCells += 1;
        const allCells = (GameState.fieldWidth * GameState.fieldHeight) - GameState.fieldMines;
        if (GameState.openedCells === allCells) {
          GameState.gameOver = true;
          GameState.gameWin = true;
          updateSmileView();
        }
        console.log('cellsLeft', allCells - GameState.openedCells)
      }

      cell.isOpen = true;
    }

    return cell;
  });
}

export function markFlagged([x, y]: CellCords) {
  updateCell([x, y], cell => {
    if (!cell.isOpen) {
      cell.isFlagged = !cell.isFlagged;
      cell.viewState = cell.isFlagged ? VIEW_STATE.flagged : VIEW_STATE.closed;
    }

    return cell;
  });
}

export function* getNeighbours([x, y]: CellCords, findAllEmpty = false, deep = REVEAL_DEEP) {
  const offsetRange = [-1, 0, 1];

  for (let xOffset of offsetRange) {
    const xNeighbour = x - xOffset;

    if (xNeighbour >= 0 && xNeighbour < GameState.fieldWidth) {
      for (let yOffset of offsetRange) {
        const yNeighbour = y - yOffset;

        if (yNeighbour >= 0 && yNeighbour < GameState.fieldHeight) {
          if(yOffset === 0 && xOffset === 0) {
            continue;
          }

          const isNotAdded = !isCellAdded([xNeighbour, yNeighbour]);

          yield [xNeighbour, yNeighbour];

          if (findAllEmpty && isNotAdded && deep) {
            yield* getNeighbours([xNeighbour, yNeighbour], true, deep - 1);
          }
        }
      }
    }
  }
}

function* getUniqueCoords([startX, startY]: CellCords, limit: number) {
  let array = [];

  for (let x = startX; x < (startX + GameState.chunkSize); x++) {
    for (let y = startY; y < (startY + GameState.chunkSize); y++) {
      array.push([x, y]);
    }
  }

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  while(array.length && limit) {
    limit--;
    yield array.pop();
  }
}
