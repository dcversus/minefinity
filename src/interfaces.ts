import { Cell } from './components/cell';
import { SmileButton } from './components/smileButton';
import { VIEW_STATE } from './constants';

export interface CellStateInterface {
  viewState: VIEW_STATE;
  x: number;
  y: number;
  isFlagged?: boolean;
  neighbours?: number;
  isMine?: boolean;
  isOpen?: boolean;
  sprite?: Cell;
}

export interface GameStateInterface {
  textures: any;
  smileButton?: SmileButton;
  cursor: CellCords;
  fieldWidth: number;
  fieldHeight: number;
  fieldMines: number;
  chunkSize: number;
  field: {};
  chunks: {};
  openedCells: number;
  gameOver: boolean;
  gameWin: boolean;
  dragging: boolean;
  insurance: boolean;
  resetGame?: Function;
}

export type CellCords = [number, number];
