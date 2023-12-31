import { ISeriesPrimitivePaneView, Time } from 'lightweight-charts';

export const enum Trend {
  UP = 1,
  NONE = 0,
  DOWN = -1,
}

export const enum PivotType {
  HIGH = 1,
  LOW = -1,
}

export const enum Wave {
  _1 = 1,
  _2 = 2,
  _3 = 3,
  _4 = 4,
  _5 = 5,
  _A = 6,
  _B = 7,
  _C = 8,
  _D = 9,
  _E = 10,
}

export const enum Degree {
  MINISCULE = 1,
  SUBMICRO = 2,
  MICRO = 3,
  SUBMINUETTE = 4,
  MINUETTE = 5,
  MINUTE = 6,
  MINOR = 7,
  INTERMEDIATE = 8,
  PRIMARY = 9,
  CYCLE = 10,
  SUPERCYCLE = 11,
  GRANDSUPERCYCLE = 12,
  SUBMILLENNIUM = 13,
  MILLENNIUM = 14,
  SUPERMILLENNIUM = 15,
}

export type Pivot = {
  time: Time;
  price: number;
};

export type Interval = '1' | '5' | '10' | '30' | '60' | '240' | 'D' | 'W' | 'M';

export type WavePivot = Pivot & {
  wave: Wave;
  degree: Degree;
  type: PivotType;
  interval: Interval;
  children?: WavePivot[];
  visible: boolean;
  subTimes: {
    month: Time | null;
    week: Time | null;
    day: Time | null;
  };
};

export type UIPivot = WavePivot & {
  x: number;
  y: number;
  isHover: boolean;
  children?: UIPivot[];
};

export interface PivotChangeInfo {
  time: Time;
  price: number;
}

export interface SubCountInfo {
  pivotFrom: WavePivot;
  pivotTo?: WavePivot;
}

export interface WaveNode {
  degree: Degree;
  wave: Wave;
  projection: number;
  retracement: number;
  pivots: WavePivot[];
  children: WaveNode[];
}

export interface ISeriesPrimitivePaneViewWithHover extends ISeriesPrimitivePaneView {
  [x: string]: any;
  isHover(x: number, y: number): WavePivot | null;
}
