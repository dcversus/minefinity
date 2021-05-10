
import * as PIXI from 'pixi.js';

const one = require('./assets/1.png');
const two = require('./assets/2.png');
const three = require('./assets/3.png');
const four = require('./assets/4.png');
const five = require('./assets/5.png');
const six = require('./assets/6.png');
const seven = require('./assets/7.png');
const eight = require('./assets/8.png');
const mine = require('./assets/mine.png');
const closed = require('./assets/closed.png');
const flag = require('./assets/flag.png');
const wrong = require('./assets/wrong.png');
const open = require('./assets/open.png');
const btn_reset = require('./assets/btn_reset.png');
const btn_rip = require('./assets/btn_rip.png');
const btn_scared = require('./assets/btn_scared.png');
const btn_smile = require('./assets/btn_smile.png');
const btn_win = require('./assets/btn_win.png');

console.log('one', one)

export function loadResources() {
  return new Promise(resolve => {
    new PIXI.Loader()
      .add('1', one.default)
      .add('2', two.default)
      .add('3', three.default)
      .add('4', four.default)
      .add('5', five.default)
      .add('6', six.default)
      .add('7', seven.default)
      .add('8', eight.default)
      .add('closed', closed.default)
      .add('flag', flag.default)
      .add('mine', mine.default)
      .add('wrong', wrong.default)
      .add('open', open.default)
      .add('btn_reset', btn_reset.default)
      .add('btn_rip', btn_rip.default)
      .add('btn_scared', btn_scared.default)
      .add('btn_smile', btn_smile.default)
      .add('btn_win', btn_win.default)
      .load((loader, resources) => {
        resolve(resources);
      });
  })
}
