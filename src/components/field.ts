
import * as PIXI from 'pixi.js';

import { TILE_WIDTH } from '../constants';

import {
  GameState,
  updateSmileView,
  isCellAdded,
  openCell,
  getNeighbours,
  renderCells,
  generateChunk,
  markFlagged
} from '../store';

export class Field extends PIXI.Container {
  hasDragged: boolean;
  dragPoint:  { x: number, y: number };
  startPosition: { x: number, y: number };

	constructor() {
    super();

    const containerWidth = GameState.fieldWidth * TILE_WIDTH;
    const containerHeight = GameState.fieldHeight * TILE_WIDTH;
    const innerContainer = new PIXI.TilingSprite(
      GameState.textures.closed.texture,
      containerWidth,
      containerHeight
    );
    innerContainer.name = 'innerContainer';

    this.addChildAt(innerContainer, 0);
    this.interactive = true;

    this
      .on('mousedown', this.onDragStart)
      .on('mouseup', this.onDragEnd)
      .on('pointerupoutside', this.onDragEnd)
      .on('pointermove', this.onDragMove)
      .on('rightclick', this.onRightClick)
      .on('touchstart', this.onDragStart)
      .on('touchmove', this.onDragMove)
      .on('touchend', this.onDragEnd)
      .on('touchendoutside', this.onDragEnd);
  }

  onDragStart(event) {
    const innerContainer = this.getChildByName('innerContainer');
    this.hasDragged = false;

    this.dragPoint = event.data.getLocalPosition(innerContainer);
    this.startPosition = {
      x: innerContainer.position.x,
      y: innerContainer.position.y
    };

    GameState.dragging = true;
    updateSmileView();
  }

  async onDragEnd() {
    const innerContainer = this.getChildByName('innerContainer');
    GameState.dragging = false;
    updateSmileView();

    if(!this.hasDragged) {
      const isNeedReveal = !isCellAdded(GameState.cursor);

      openCell(GameState.cursor);

      if (isNeedReveal) {
        for await (let neighbourCell of getNeighbours(GameState.cursor, true)) {
          openCell(neighbourCell);
        }
      }

      renderCells(innerContainer);
    }
  }

  onDragMove(event) {
    const innerContainer = this.getChildByName('innerContainer');

    let position = event.data.getLocalPosition(innerContainer);
    let x = Math.floor(position.x / TILE_WIDTH);
    let y = Math.floor(position.y / TILE_WIDTH);
    GameState.cursor = [x, y];

    if (GameState.dragging) {
      var newPosition = event.data.getLocalPosition(this.parent);
      let x = Math.floor(newPosition.x - this.dragPoint.x);
      let y = Math.floor(newPosition.y - this.dragPoint.y);

      innerContainer.position.set(x, y);
      if (Math.pow(this.startPosition.x - x, 2) + Math.pow(this.startPosition.y - y, 2) > Math.pow(TILE_WIDTH, 2) / 9) {
        this.hasDragged = true;
        renderCells(innerContainer);
        generateChunk(GameState.cursor);
      }
    }
  }

  onRightClick(){
    markFlagged(GameState.cursor);
  }
}
