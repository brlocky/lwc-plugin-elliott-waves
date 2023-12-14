import { BitmapCoordinatesRenderingScope, CanvasRenderingTarget2D } from 'fancy-canvas';
import { ISeriesPrimitivePaneRenderer } from 'lightweight-charts';
import { positionsLine } from './helpers/dimensions/positions';
import { averageWidthPerCharacter, centreLabelHeight, centreLabelInlinePadding } from './constants';
import { PivotType, UIPivot } from './types';

export class WavesPaneRenderer implements ISeriesPrimitivePaneRenderer {
  _pivots: UIPivot[];

  constructor(pivots: UIPivot[]) {
    this._pivots = pivots;
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      // this._drawTradingLineLabels(scope);
      this._drawPivots(scope);
    });
  }

  _calculateLabelWidth(textLength: number) {
    return centreLabelInlinePadding * 2 + 2 * textLength * averageWidthPerCharacter;
  }

  _drawPivots(scope: BitmapCoordinatesRenderingScope) {
    if (!this._pivots.length) return;

    this._pivots.forEach((p) => {
      this._drawPivot(scope, p);
    });
  }

  _drawPivot(scope: BitmapCoordinatesRenderingScope, pivot: UIPivot) {
    const ctx = scope.context;
    let text = pivot.wave?.toString() || ('- ' as string);

    const vPadding = pivot.type === PivotType.HIGH ? -20 : 20;
    const labelWidth = this._calculateLabelWidth(text.length);
    const labelXDimensions = positionsLine(pivot.x as number, scope.horizontalPixelRatio, labelWidth);
    const yDimensions = positionsLine(pivot.y + vPadding, scope.verticalPixelRatio, centreLabelHeight);

    const radius = 4 * scope.horizontalPixelRatio;
    // draw main body background of label
    ctx.beginPath();
    ctx.roundRect(labelXDimensions.position, yDimensions.position, labelXDimensions.length, yDimensions.length, radius);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // draw stroke for main body
    ctx.beginPath();
    ctx.roundRect(labelXDimensions.position, yDimensions.position, labelXDimensions.length, yDimensions.length, radius);
    ctx.strokeStyle = '#131722';
    ctx.lineWidth = 1 * scope.horizontalPixelRatio;
    ctx.stroke();

    // write text
    ctx.beginPath();
    ctx.fillStyle = '#131722';
    ctx.textBaseline = 'middle';
    // ctx.font = `${Math.round(12 * scope.verticalPixelRatio)}px EW`;
    ctx.font = `${Math.round(20 * scope.verticalPixelRatio)}px arial`;

    ctx.fillText(
      text,
      labelXDimensions.position + centreLabelInlinePadding * scope.horizontalPixelRatio,
      vPadding * scope.verticalPixelRatio + pivot.y * scope.verticalPixelRatio,
    );
  }
}
