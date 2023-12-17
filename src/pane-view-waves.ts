import { SeriesPrimitivePaneViewZOrder } from 'lightweight-charts';
import { ElliottWavesDataSource } from './data-source';
import { WavesPaneRenderer } from './pane-renderer-waves';
import { ISeriesPrimitivePaneViewWithHover, PivotType, UIPivot, WavePivot } from './types';

export class WavesPaneView implements ISeriesPrimitivePaneViewWithHover {
  _source: ElliottWavesDataSource;
  _pivots: UIPivot[];

  constructor(source: ElliottWavesDataSource) {
    this._source = source;
    this._pivots = [];
  }

  /**
   * Defines where in the visual layer stack the renderer should be executed. Default is `'normal'`.
   *
   * @returns the desired position in the visual layer stack. @see {@link SeriesPrimitivePaneViewZOrder}
   */
  zOrder?(): SeriesPrimitivePaneViewZOrder {
    return 'top';
  }

  isHover(x: number, y: number): boolean {
    const pivot = this._pivots.find((p) => {
      return this._isHover(p, x, y);
    });
    return !!pivot;
  }

  _isHover(p: UIPivot, x: number, y: number): boolean {
    const boxSize = 10;
    if (x + boxSize > p.x && x - boxSize < p.x && y + boxSize > p.y && y - boxSize < p.y) {
      return true;
    }
    return false;
  }

  update() {
    const { chart, series, mousePosition } = this._source;

    const mapUIPivot = (p: WavePivot) => {
      const vPadding = p.type === PivotType.HIGH ? -20 : 20;
      const y = vPadding + (series.priceToCoordinate(p.price) as number);
      const x = chart.timeScale().timeToCoordinate(p.time) as number;

      const newPivot = { ...p, x, y, isHover: false };
      if (this._isHover(newPivot, mousePosition.x, mousePosition.y)) {
        newPivot.isHover = true;
      }

      return newPivot;
    };

    this._pivots = this._source.pivots.map(mapUIPivot);

    /* 
    const high = series.priceToCoordinate(barData.high) as Coordinate;
    const low = series.priceToCoordinate(barData.low) as Coordinate;

    const pivotType = high > mousePosition.y ? PivotType.HIGH : PivotType.LOW;
    const pivotY = pivotType == PivotType.HIGH ? (high as Coordinate) : (low as Coordinate);
    this._pivot = { x: mousePosition.x2, y: pivotY, type: pivotType };

    const pivotPrice = pivotType == PivotType.HIGH ? barData.high : barData.low;
    this._pivotChanged.fire({
      time: barData.time,
      price: pivotPrice,
    }); */
  }

  /**
   * This method returns a renderer - special object to draw data
   *
   * @returns an renderer object to be used for drawing, or `null` if we have nothing to draw.
   */
  renderer() {
    return new WavesPaneRenderer(this._pivots);
  }
}
