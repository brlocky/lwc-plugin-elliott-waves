import { IChartApi, ISeriesApi, SeriesOptionsMap, Time } from 'lightweight-charts';
import { ElliottWavesOptions } from './options';
import { MousePosition } from './mouse';
import { WaveNode } from './types';

export interface Point {
  time: Time;
  price: number;
}

export interface ElliottWavesDataSource {
  chart: IChartApi;
  series: ISeriesApi<keyof SeriesOptionsMap>;
  options: ElliottWavesOptions;
  p1: Point;
  p2: Point;
  mousePosition: MousePosition;
  isSelectingPivot: boolean;
  waves: WaveNode[];
}
