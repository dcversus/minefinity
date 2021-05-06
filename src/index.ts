
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

// document.addEventListener('contextmenu', event => event.preventDefault());
let textures = {} as any;
const WIDTH = 16;
let cursor = [0,0];
const field = {
  ['x_y']: undefined,
}

enum STATE {
  empty,
  flagged,
  mine,
  wrong,
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight
}

function click([x, y], stt = false) {
  let cell = field[`${x}_${y}`];

  if (! cell) {
    cell = field[`${x}_${y}`] = new Cell(x, y, stt ? STATE.flagged : STATE.empty);
    gameContainer.addChild(cell);
  } else {
    cell.update(STATE.mine);
  }
}

class Cell extends PIXI.Container {
  state: STATE;

	constructor(x: number, y: number, state: STATE){
		super();
		this.x = x * WIDTH;
    this.y = y * WIDTH;
    this.state = state;
    let [ backTexture, frontTexture ] = this.getTexture(state);

		let back = new PIXI.Sprite(backTexture);
		let front = new PIXI.Sprite(frontTexture);
		this.addChildAt(back, 0);
		this.addChildAt(front, 1);
  }

  update(state: STATE) {
    let [ backTexture, frontTexture ] = this.getTexture(state);

		let back = this.getChildAt(0) as PIXI.Sprite;
		let front = this.getChildAt(1) as PIXI.Sprite;
		back.texture = backTexture;
		front.texture = frontTexture;
  }

  getTexture(state) {
    if (state === STATE.empty) {
      return [textures.open.texture, PIXI.Texture.EMPTY];
    }

    if (state === STATE.flagged) {
      return [textures.closed.texture, textures.flag.texture];
    }

    if (state === STATE.mine) {
      return [textures.open.texture, textures.mine.texture];
    }

    if (state === STATE.wrong) {
      return [textures.open.texture, textures.wrong.texture];
    }

    if (state === STATE.one) {
      return [textures.open.texture, textures.one.texture];
    }

    if (state === STATE.two) {
      return [textures.open.texture, textures.two.texture];
    }

    if (state === STATE.three) {
      return [textures.open.texture, textures.three.texture];
    }

    if (state === STATE.four) {
      return [textures.open.texture, textures.four.texture];
    }

    if (state === STATE.five) {
      return [textures.open.texture, textures.five.texture];
    }

    if (state === STATE.six) {
      return [textures.open.texture, textures.six.texture];
    }

    if (state === STATE.seven) {
      return [textures.open.texture, textures.seven.texture];
    }

    if (state === STATE.eight) {
      return [textures.open.texture, textures.eight.texture];
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


function setup(loader, resources) {
  const mines = 10;
  const width = 2147483647 ;
  const height = 2147483647 ;
  const containerWidth = width * WIDTH;
  const containerHeight = height * WIDTH;
  gameContainer = new PIXI.TilingSprite(
    resources.closed.texture,
    containerWidth,
    containerHeight
  );

	clickHandler.addChildAt(gameContainer, 0);

  gameContainer.name = 'gameContainer';

  // centerField([width / 2, height / 2]);

  textures = resources;
}

var gameContainer;
// var fieldContainer = new PIXI.Container();
var clickHandler = new PIXI.Container();
clickHandler.interactive = true;
app.stage.addChild(clickHandler);

function centerField([x, y]) {
	let centerX = app.renderer.width/2;
	let centerY = app.renderer.height/2;
	let newX = Math.floor(-x*WIDTH + centerX);
  let newY = Math.floor(-y*WIDTH + centerY);

	// fieldContainer.position.set(newX,newY);
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
  .on('touchendoutside', onDragEnd)

function onDragStart(event) {
  this.dragging = true;
  this.hasDragged = false;

  this.dragPoint = event.data.getLocalPosition(gameContainer);
  this.startPosition = {x : gameContainer.position.x, y : gameContainer.position.y};
}

function onDragEnd() {
  this.dragging = false;
  if(! this.hasDragged) {
    // if the mousebutton didnt move, it means the user clicked
    console.log('cursor', cursor);
    click(cursor);
  }
}

function onDragMove(event) {
  if (this.dragging) {
    var newPosition = event.data.getLocalPosition(this.parent);
    let x = Math.floor( newPosition.x - this.dragPoint.x );
    let y = Math.floor( newPosition.y - this.dragPoint.y );

    const gameContainer = this.getChildByName('gameContainer');

    gameContainer.position.set(x,y);
    if(Math.pow(this.startPosition.x-x,2)+Math.pow(this.startPosition.y-y,2)>Math.pow(WIDTH,2)/9) {
      this.hasDragged = true;
    }
  }

  let position = event.data.getLocalPosition(gameContainer);
  let x = Math.floor(position.x/WIDTH);
  let y = Math.floor(position.y/WIDTH);
  cursor = [x,y];
}

function onRightClick(event){
  // Controls.flag();
  console.log('cursor', cursor);
  click(cursor, true);
  // centerField(cursor);
}
