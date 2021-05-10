
import * as PIXI from 'pixi.js';

import { resetGame, GameState } from '../store';

export class SmileButton extends PIXI.Sprite {
  isPressed = false;

	constructor() {
    super(GameState.textures.btn_smile.texture);

    this.interactive = true;
    this.buttonMode = true;
    this.name = 'smileButton';

    this
      .on('pointerdown', this.onButtonDown)
      .on('pointerup', this.resetGame)
      .on('pointerupoutside', this.onButtonUp)
  }

  resetGame() {
    resetGame();
  }

  onButtonDown() {
    this.isPressed = true;
    this.updateSmileView();
  }

  onButtonUp() {
    this.isPressed = false;
    this.updateSmileView();
  }

  updateSmileView() {
    if (this.isPressed) {
      this.texture = GameState.textures.btn_reset.texture;
      return;
    }

    if (GameState.gameWin) {
      this.texture = GameState.textures.btn_win.texture;
      return;
    }

    if (GameState.gameOver) {
      this.texture = GameState.textures.btn_rip.texture;
      return;
    }

    if (GameState.dragging) {
      this.texture = GameState.textures.btn_scared.texture;
      return;
    }

    this.texture = GameState.textures.btn_smile.texture;
  }
}
