
import * as PIXI from 'pixi.js';

import { CellStateInterface } from '../interfaces';
import { VIEW_STATE, TILE_WIDTH } from '../constants';
import { GameState } from '../store';

export class Cell extends PIXI.Container {
  cellState: CellStateInterface;

	constructor(state: CellStateInterface) {
		super();
		this.x = state.x * TILE_WIDTH;
    this.y = state.y * TILE_WIDTH;
    this.cellState = state;
    this.cellState.sprite = this;
    let [ backTexture, frontTexture ] = this.getTexture();

		let back = new PIXI.Sprite(backTexture);
		let front = new PIXI.Sprite(frontTexture);
		this.addChildAt(back, 0);
		this.addChildAt(front, 1);
  }

  updateView() {
    let [ backTexture, frontTexture ] = this.getTexture();

		let back = this.getChildAt(0) as PIXI.Sprite;
		let front = this.getChildAt(1) as PIXI.Sprite;
		back.texture = backTexture;
		front.texture = frontTexture;
  }

  getTexture() {
    if (this.cellState.viewState === VIEW_STATE.closed) {
      return [GameState.textures.closed.texture, PIXI.Texture.EMPTY];
    }

    if (this.cellState.viewState === VIEW_STATE.empty) {
      return [GameState.textures.open.texture, PIXI.Texture.EMPTY];
    }

    if (this.cellState.viewState === VIEW_STATE.tip) {
      const tipNumber = this.cellState.neighbours.toString();
      return [GameState.textures.open.texture, GameState.textures[tipNumber].texture];
    }

    if (this.cellState.viewState === VIEW_STATE.flagged) {
      return [GameState.textures.closed.texture, GameState.textures.flag.texture];
    }

    if (this.cellState.viewState === VIEW_STATE.mine) {
      return [GameState.textures.open.texture, GameState.textures.mine.texture];
    }

    if (this.cellState.viewState === VIEW_STATE.wrong) {
      return [GameState.textures.open.texture, GameState.textures.wrong.texture];
    }
  }
}
