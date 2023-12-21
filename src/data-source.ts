import { IChartApi, ISeriesApi, SeriesOptionsMap } from 'lightweight-charts';
import { ElliottWavesOptions } from './options';
import { MousePosition } from './mouse';
import { Interval, WavePivot } from './types';

export interface ElliottWavesDataSource {
  chart: IChartApi;
  series: ISeriesApi<keyof SeriesOptionsMap>;
  options: ElliottWavesOptions;
  mousePosition: MousePosition;
  isSelectingPivot: boolean;
  pivots: WavePivot[];
  interval: Interval;
}
