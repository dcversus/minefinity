
import * as PIXI from 'pixi.js';

import one from './assets/1.png';
import two from './assets/2.png';
import three from './assets/3.png';
import four from './assets/4.png';
import five from './assets/5.png';
import six from './assets/6.png';
import seven from './assets/7.png';
import eight from './assets/8.png';
import mine from './assets/mine.png';
import closed from './assets/closed.png';
import flag from './assets/flag.png';
import wrong from './assets/wrong.png';
import open from './assets/open.png';

document.addEventListener('contextmenu', event => event.preventDefault());

const LOAD_RADIUS = 32;

let textures = {} as any;
const TILE_WIDTH = 16;
const FIELD_WIDTH = 10000;
const FIELD_HEIGHT = 10000;
const FIELD_MINES = 100000000;

let cursor = [0,0];
const field = {}

enum STATE {
  empty,
  flagged,
  mine,
  wrong,
  tip,
  closed
}

function isCellAdded([x, y]: [number, number]): boolean {
  let cell = field[`${x}_${y}`];
  
  return !!cell;
}

function getCell([x, y]: [number, number]): Cell {
  let cell = field[`${x}_${y}`];

  if (! cell) {
    cell = field[`${x}_${y}`] = new Cell(x, y);
    // if (Math.pow(x - cursor[0], 2) + Math.pow(y - cursor[1], 2) < Math.pow(LOAD_RADIUS, 2)) {
    //   gameContainer.addChild(cell);
    // }
  }

  return cell;
}


function sleep(dur, val) {
  return new Promise(res => {
    setTimeout(() => { res(val) }, dur);
  });
}

function* getNeighbours([x, y], findAllEmpty) {
  const offsetRange = [-1,0,1];

  for (let xOffset of offsetRange) {
    const xNeighbour = x - xOffset;

    if (xNeighbour >= 0 && xNeighbour < FIELD_WIDTH) {
      for (let yOffset of offsetRange) {
        const yNeighbour = y - yOffset;

        if (yNeighbour >= 0 && yNeighbour < FIELD_HEIGHT) {
          if(yOffset === 0 && xOffset === 0) {
            continue;
          }

          const isNotAdded = !isCellAdded([xNeighbour, yNeighbour]);
          const cell = getCell([xNeighbour, yNeighbour]);

          // if (findAllEmpty) {
          //   yield sleep(1, cell);
          // } else {
            yield cell;
          // }

          if (findAllEmpty && isNotAdded) {
            yield* getNeighbours([xNeighbour, yNeighbour], true);
          }
        }
      }
    }
  }
}

class Cell extends PIXI.Container {
  state = STATE.closed;
  neighbours = 0;
  isMine = false;
  isOpen = false;
  isFlagged = false;
  cellX: number;
  cellY: number;

	constructor(x: number, y: number) {
		super();
		this.x = x * TILE_WIDTH;
    this.y = y * TILE_WIDTH;
		this.cellX = x;
    this.cellY = y;
    let [ backTexture, frontTexture ] = this.getTexture();

		let back = new PIXI.Sprite(backTexture);
		let front = new PIXI.Sprite(frontTexture);
		this.addChildAt(back, 0);
		this.addChildAt(front, 1);
  }

  addNeighbour() {
    this.neighbours++;
  }

  placeMine() {
    this.isMine = true;

    return this;
  }

  open() {
    if (this.isFlagged) {
      return;
    }

    if (this.neighbours) {
      this.state = STATE.tip;
    } else {
      this.state = STATE.empty;
    }

    if (this.isMine) {
      this.state = STATE.wrong;
    }

    this.isOpen = true;

    this.updateView();
  }

  get isSafeForOpen() {
    return !this.isMine && !this.isOpen && !this.isFlagged;
  }

  markFlagged() {
    if (this.isOpen) {
      return;
    }

    this.isFlagged = ! this.isFlagged;

    this.state = this.isFlagged ? STATE.flagged : STATE.closed;
    this.updateView();
  }

  updateView() {
    let [ backTexture, frontTexture ] = this.getTexture();

		let back = this.getChildAt(0) as PIXI.Sprite;
		let front = this.getChildAt(1) as PIXI.Sprite;
		back.texture = backTexture;
		front.texture = frontTexture;
  }

  getTexture() {
    if (this.state === STATE.closed) {
      return [textures.closed.texture, PIXI.Texture.EMPTY];
    }

    if (this.state === STATE.empty) {
      return [textures.open.texture, PIXI.Texture.EMPTY];
    }

    if (this.state === STATE.tip) {
      const tipNumber = this.neighbours.toString();
      return [textures.open.texture, textures[tipNumber].texture];
    }

    if (this.state === STATE.flagged) {
      return [textures.closed.texture, textures.flag.texture];
    }

    if (this.state === STATE.mine) {
      return [textures.open.texture, textures.mine.texture];
    }

    if (this.state === STATE.wrong) {
      return [textures.open.texture, textures.wrong.texture];
    }
  }
}

const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor : 0xf9690e
});
document.body.appendChild(app.view);

app.renderer.resize(window.innerWidth, window.innerHeight);

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

window.addEventListener('resize', function(event){
	app.renderer.resize(window.innerWidth, window.innerHeight);
});

new PIXI.Loader()
  .add('1', one)
  .add('2', two)
  .add('3', three)
  .add('4', four)
  .add('5', five)
  .add('6', six)
  .add('7', seven)
  .add('8', eight)
  .add('closed', closed)
  .add('flag', flag)
  .add('mine', mine)
  .add('wrong', wrong)
  .add('open', open)
  .load(setup);


async function setup(loader, resources) {
  const containerWidth = FIELD_WIDTH * TILE_WIDTH;
  const containerHeight = FIELD_HEIGHT * TILE_WIDTH;
  gameContainer = new PIXI.TilingSprite(
    resources.closed.texture,
    containerWidth,
    containerHeight
  );

	clickHandler.addChildAt(gameContainer, 0);

  gameContainer.name = 'gameContainer';

  textures = resources;

  for (let i=0; i < FIELD_MINES; i++) {
    const x = Math.floor(Math.random() * FIELD_WIDTH);
    const y = Math.floor(Math.random() * FIELD_HEIGHT);

    if(isCellAdded([x, y])) {
      i--;
    } else {
      getCell([x, y]).placeMine();

      for await (let neighbourCell of getNeighbours([x,y])) {
        neighbourCell.addNeighbour();
      }
    }
  }
}

var gameContainer;
var clickHandler = new PIXI.Container();
clickHandler.interactive = true;
app.stage.addChild(clickHandler);

function centerField([x, y]) {
	let centerX = app.renderer.width/2;
	let centerY = app.renderer.height/2;
	let newX = Math.floor(-x*TILE_WIDTH + centerX);
  let newY = Math.floor(-y*TILE_WIDTH + centerY);

	gameContainer.position.set(newX,newY);
}

clickHandler
  .on('mousedown', onDragStart)
  .on('mouseup', onDragEnd)
  .on('pointerupoutside', onDragEnd)
  .on('pointermove', onDragMove)
  .on('rightclick', onRightClick)
  .on('touchstart', onDragStart)
  .on('touchmove', onDragMove)
  .on('touchend', onDragEnd)
  .on('touchendoutside', onDragEnd);

function onDragStart(event) {
  this.dragging = true;
  this.hasDragged = false;

  this.dragPoint = event.data.getLocalPosition(gameContainer);
  this.startPosition = {x : gameContainer.position.x, y : gameContainer.position.y};
}

async function onDragEnd() {
  this.dragging = false;

  if(! this.hasDragged) {
    const isNeedReveal = !isCellAdded(cursor);

    getCell(cursor).open();

    if (isNeedReveal) {
      for await (let neighbourCell of getNeighbours(cursor, true)) {
        neighbourCell.open();
      }
    }
  }
}

function onDragMove(event) {
  if (this.dragging) {
    var newPosition = event.data.getLocalPosition(this.parent);
    let x = Math.floor( newPosition.x - this.dragPoint.x );
    let y = Math.floor( newPosition.y - this.dragPoint.y );

    const gameContainer = this.getChildByName('gameContainer');

    gameContainer.position.set(x,y);
    if (Math.pow(this.startPosition.x - x, 2) + Math.pow(this.startPosition.y - y, 2) > Math.pow(TILE_WIDTH, 2) / 9) {
      this.hasDragged = true;

      console.log('gameContainer.children', field, gameContainer.children);
      let position = event.data.getLocalPosition(gameContainer);
      let cursorCellX = Math.floor(position.x/TILE_WIDTH);
      let cursorCellY = Math.floor(position.y/TILE_WIDTH);
      console.log('cursorCellX',cursorCellX)
      console.log('cursorCellY',cursorCellY)
      Object.values(field).forEach(cell => {
        if (Math.pow(cell?.cellX - cursorCellX, 2) + Math.pow(cell?.cellY - cursorCellY, 2) < Math.pow(LOAD_RADIUS, 2)) {
          if (!cell?.parent) {
            gameContainer.addChild(cell);
          }
        } else {
          if (cell?.parent) {
            gameContainer.removeChild(cell)
          }
        }
      })
    }
    
  }

  let position = event.data.getLocalPosition(gameContainer);
  let x = Math.floor(position.x/TILE_WIDTH);
  let y = Math.floor(position.y/TILE_WIDTH);
  cursor = [x,y];
}

function onRightClick(event){
  // Controls.flag();
  // console.log('cursor', cursor);
  getCell(cursor).markFlagged();
  // centerField(cursor);
}
