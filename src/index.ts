import * as PIXI from 'pixi.js';

import { Field } from './components/field';
import { SmileButton } from './components/smileButton';

import { loadResources } from './resources';
import { GameState, generateChunk } from './store';
import { OPTIMAL_CHUNK_SIZE } from './constants';

document.addEventListener('contextmenu', event => event.preventDefault());

const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor : 0xf9690e
});
document.body.appendChild(app.view);

app.renderer.resize(window.innerWidth, window.innerHeight);

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

window.addEventListener('resize', () =>
  app.renderer.resize(window.innerWidth, window.innerHeight)
);

loadResources().then(textures => {
  GameState.textures = textures;

  resetGame();
})

async function resetGame() {
  while (app.stage.children[0]) {
    app.stage.removeChild(app.stage.children[0]);
  }

  GameState.fieldWidth = +window.prompt('fieldWidth', '10000000');
  GameState.fieldHeight = +window.prompt('fieldHeight', '10000000');
  GameState.fieldMines = +window.prompt('fieldMines', '10000000000000');

  const smileButton = new SmileButton();
  const gameContainer = new Field();

  app.stage.addChild(gameContainer);
  app.stage.addChild(smileButton);


  GameState.smileButton = smileButton;
  GameState.resetGame = resetGame;
  GameState.chunkSize = Math.min(OPTIMAL_CHUNK_SIZE, GameState.fieldHeight, GameState.fieldWidth)

  generateChunk([1, 1]);
}
