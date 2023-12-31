import { BarData, Coordinate, Time } from 'lightweight-charts';
import { ElliottWavesPaneRenderer } from './pane-renderer';
import { ElliottWavesDataSource } from './data-source';
import { ISeriesPrimitivePaneViewWithHover, PivotChangeInfo, PivotType, WavePivot } from './types';
import { Delegate } from './helpers/delegate';

export interface ViewPoint {
  x: Coordinate;
  y: Coordinate;
  type: PivotType;
}

export class ElliottWavesPaneView implements ISeriesPrimitivePaneViewWithHover {
  _source: ElliottWavesDataSource;
  _pivot: ViewPoint | null;
  _pivotChanged: Delegate<PivotChangeInfo> = new Delegate();

  constructor(source: ElliottWavesDataSource) {
    this._source = source;
    this._pivot = null;
  }
  isHover(_: number, __: number): WavePivot | null {
    return null;
  }

  pivotChanged(): Delegate<PivotChangeInfo> {
    return this._pivotChanged;
  }

  update() {
    const { mousePosition, series, isSelectingPivot } = this._source;
    const barData = series.dataByIndex(mousePosition.logical) as BarData<Time>;

    if (!barData) {
      return;
    }

    if (isSelectingPivot) {
      const high = series.priceToCoordinate(barData.high) as Coordinate;
      const low = series.priceToCoordinate(barData.low) as Coordinate;

      const pivotType = high > mousePosition.y ? PivotType.HIGH : PivotType.LOW;
      const pivotY = pivotType == PivotType.HIGH ? (high as Coordinate) : (low as Coordinate);
      this._pivot = { x: mousePosition.x2, y: pivotY, type: pivotType };

      const pivotPrice = pivotType == PivotType.HIGH ? barData.high : barData.low;
      this._pivotChanged.fire({
        time: barData.time,
        price: pivotPrice,
      });
    } else {
      this._pivot = null;
    }
  }

  renderer() {
    return new ElliottWavesPaneRenderer(this._pivot, this._source.options.fillColor);
  }
}
