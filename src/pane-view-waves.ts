import { ISeriesPrimitivePaneView } from 'lightweight-charts';
import { ElliottWavesDataSource } from './data-source';
import { WavesPaneRenderer } from './pane-renderer-waves';
import { UIPivot, Wave, WaveNode } from './types';

export class WavesPaneView implements ISeriesPrimitivePaneView {
  _source: ElliottWavesDataSource;
  _pivots: UIPivot[];

  constructor(source: ElliottWavesDataSource) {
    this._source = source;
    this._pivots = [];
  }

  getPivots(wave: WaveNode) {
    const { chart, series } = this._source;
    return wave.pivots.map((p) => {
      const y = series.priceToCoordinate(p.price) as number;
      const x = chart.timeScale().timeToCoordinate(p.time) as number;
      return { ...p, x, y };
    });
  }
  update() {
    const pivots = this._source.waves.flatMap((w) => {
      return this.getPivots(w);
    });

    const uniquePivots = pivots.filter((pivot, index, self) => {
      // Check if the pivot is part of "wave1"
      const isWave1 = pivot.wave === Wave._1;
      // Check if the pivot is unique based on its price and time
      const isUnique = index === self.findIndex((p) => p.price === pivot.price && p.time === pivot.time);

      // Keep the pivot if it's part of "wave1" or is unique
      return isWave1 || isUnique;
    });
    this._pivots = uniquePivots;
  }

  renderer() {
    return new WavesPaneRenderer(this._pivots);
  }
}
