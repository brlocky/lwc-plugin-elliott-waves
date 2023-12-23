import { BitmapCoordinatesRenderingScope, CanvasRenderingTarget2D } from 'fancy-canvas';
import { ISeriesPrimitivePaneRenderer } from 'lightweight-charts';
import { positionsLine } from './helpers/dimensions/positions';
import { Degree, UIPivot, Wave } from './types';

export class WavesPaneRenderer implements ISeriesPrimitivePaneRenderer {
  _pivots: UIPivot[];

  constructor(pivots: UIPivot[]) {
    this._pivots = pivots;
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      // this._drawTradingLineLabels(scope);
      this._drawPivots(scope, this._pivots);

      /* // Check if the crosshair is over any pivot
      this._pivots.forEach((pivot) => {
        if (this._isHovered(pivot, crosshairX, crosshairY)) {
          // Do something when the crosshair is over the pivot
          console.log('Crosshair is over a pivot:', pivot);
        }
      }); */
    });
  }

  _drawPivots(scope: BitmapCoordinatesRenderingScope, pivots: UIPivot[]) {
    pivots.forEach((p) => {
      this._drawPivot(scope, p);
    });
  }

  _getPivotText(pivot: UIPivot) {
    switch (pivot.wave) {
      case Wave._A:
        return 'A';
      case Wave._B:
        return 'B';
      case Wave._C:
        return 'C';
      case Wave._D:
        return 'D';
      case Wave._E:
        return 'D';
    }

    return pivot.wave?.toString() || ('- ' as string);
  }

  _getDegreeColor(pivot: UIPivot) {
    switch (pivot.degree) {
      case Degree.SUPERMILLENNIUM:
        return 'red';
      case Degree.MILLENNIUM:
        return '#FF7900';
      case Degree.SUBMILLENNIUM:
        return 'blue';
      case Degree.GRANDSUPERCYCLE:
        return 'darkblue';
      case Degree.SUPERCYCLE:
        return 'olive';
      case Degree.CYCLE:
        return 'teal';
      case Degree.PRIMARY:
        return 'maroon';
      case Degree.INTERMEDIATE:
        return 'black';
      case Degree.MINOR:
        return 'blue';
      case Degree.MINUTE:
        return 'pink';
      case Degree.MINUETTE:
        return 'green';
      case Degree.SUBMINUETTE:
        return 'orange';
      case Degree.MICRO:
        return 'purple';
      case Degree.SUBMICRO:
        return 'aqua';
      case Degree.MINISCULE:
        return 'red';
    }

    return 'red';
  }

  _getDegreeFontSize(pivot: UIPivot) {
    switch (pivot.degree) {
      case Degree.SUPERMILLENNIUM:
        return 22;
      case Degree.MILLENNIUM:
        return 21;
      case Degree.SUBMILLENNIUM:
        return 20;
      case Degree.GRANDSUPERCYCLE:
        return 19;
      case Degree.SUPERCYCLE:
        return 18;
      case Degree.CYCLE:
        return 17;
      case Degree.PRIMARY:
        return 17;
      case Degree.INTERMEDIATE:
        return 16;
      case Degree.MINOR:
        return 15;
      case Degree.MINUTE:
        return 14;
      case Degree.MINUETTE:
        return 13;
      case Degree.SUBMINUETTE:
        return 12;
      case Degree.MICRO:
        return 11;
      case Degree.SUBMICRO:
        return 11;
      case Degree.MINISCULE:
        return 11;
    }

    return 99;
  }

  _drawPivot(scope: BitmapCoordinatesRenderingScope, pivot: UIPivot) {
    const ctx = scope.context;
    let text = this._getPivotText(pivot);

    const labelXDimensions = positionsLine(pivot.x as number, scope.horizontalPixelRatio, 0);
    const yDimensions = positionsLine(pivot.y, scope.verticalPixelRatio, 0);

    ctx.beginPath();

    if (pivot.isHover) {
      ctx.roundRect(labelXDimensions.position, yDimensions.position, yDimensions.length, yDimensions.length, 10);
      ctx.fillStyle = '#FF0F00';
      ctx.fill();
    }

    ctx.fillStyle = this._getDegreeColor(pivot);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    const fontSize = this._getDegreeFontSize(pivot);
    ctx.font = `${Math.round(fontSize * scope.verticalPixelRatio)}px EW-${pivot.degree}`;
    console.log(`EW-${pivot.degree}`, pivot.price);

    ctx.fillText(text, labelXDimensions.position, pivot.y * scope.verticalPixelRatio);
  }
}
